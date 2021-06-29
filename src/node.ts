/* eslint-disable @typescript-eslint/ban-types */
import { fork as nodeFork } from 'child_process';
import RemoteControlledPromise from './classes/RemoteControlledPromise';
import * as promise from './promise';
import * as predicate from './predicate';

import type { ChildProcess, ForkOptions as NodeForkOptions } from 'child_process';

export interface ForkOptions extends NodeForkOptions {
    restartDelay?: number;
    restart?: boolean;
}

export interface ForkMeta {
    process: ChildProcess|null;
    promise: Promise<undefined>;
    terminate(): void;
}

export function fork(module: string, payload: Record<string, any>, forkOptions?: ForkOptions): ForkMeta {
    const options: ForkOptions = {
        restartDelay: 5000,
        restart: false,
        detached: false,
        ...forkOptions
    };

    const promise = new RemoteControlledPromise<undefined>();

    let running = true;

    const meta: ForkMeta = {
        promise: promise.promise,
        process: null,
        terminate() {
            running = false;
            meta.process?.kill();
        }
    };

    const runProcess = () => {
        const process = nodeFork(module, [JSON.stringify(payload)], options);
        meta.process = process;

        process.on('close', (code: number) => {
            meta.process = null;
            if (options.restart && running) {
                setTimeout(runProcess, options.restartDelay);
            } else if (code === 0) {
                promise.resolve();
            } else {
                promise.reject(code);
            }
        });
    };

    runProcess();
    return meta;
}

export function paramsFromJsonPayload<P = Record<string, any>>(offset = 2, base?: P): () => Promise<P> | P {
    return function (): Promise<P> | P {
        return Object.assign({}, base || {}, JSON.parse(process.argv[offset] || '{}'));
    };
}

export type DisposerSig = () => void
export type ExitSig = (sig: NodeJS.Signals) => Promise<void> | void;

export interface ServiceParams {
    quit(): void;
    onExit(cb: ExitSig): DisposerSig;
    params: Record<string, any>
}

export type InitRoutineSig = () => Promise<object | void> | object | void
export type ServiceRoutineSig = (serviceParams: ServiceParams) => Promise<void> | void;

export type ServiceConfig = {
    keepAlive?: boolean,
    autostart?: boolean,
    terminationDelay?: number,
    restartDelay?: number,
    log?(...args: any[]): void;
};

export function service(loopRoutine: ServiceRoutineSig): void;
export function service(config: ServiceConfig, loopRoutine: ServiceRoutineSig): void;
export function service(initRoutine: InitRoutineSig, loopRoutine: ServiceRoutineSig): void;
export function service(config: ServiceConfig, initRoutine: InitRoutineSig, loopRoutine: ServiceRoutineSig): void;
export function service(initRoutine: InitRoutineSig, initRoutine2: InitRoutineSig, loopRoutine: ServiceRoutineSig): void;
export function service(config: ServiceConfig, initRoutine: InitRoutineSig, initRoutine2: InitRoutineSig, loopRoutine: ServiceRoutineSig): void;
// eslint-disable-next-line max-len
export function service(initRoutine: InitRoutineSig, initRoutine2: InitRoutineSig, initRoutine3: InitRoutineSig, loopRoutine: ServiceRoutineSig): void;
// eslint-disable-next-line max-len
export function service(config: ServiceConfig, initRoutine: InitRoutineSig, initRoutine2: InitRoutineSig, initRoutine3: InitRoutineSig, loopRoutine: ServiceRoutineSig): void;
export function service(config: ServiceConfig, ...routines: (ServiceRoutineSig | InitRoutineSig)[]): void;
export function service(...routines: any[]) {
    const options: ServiceConfig = {
        keepAlive: false,
        autostart: true,
        terminationDelay: 0,
        restartDelay: 5000,
        // eslint-disable-next-line no-console
        log: console.log.bind(console)
    };
    if (predicate.isPlainObject(routines[0])) {
        Object.assign(options, routines.shift());
    }
    const loopRoutine = routines.pop() as ServiceRoutineSig;

    const keepAlive = new RemoteControlledPromise<undefined>();

    const exitCallbacks = new Set<ExitSig>();
    (['SIGHUP', 'SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((sig) => process.on(sig, async () => {
        if (options.terminationDelay) {
            // eslint-disable-next-line no-console
            options.log!('!!', sig, 'Terminating in ' + options.terminationDelay + 'ms...');
            await promise.wait(options.terminationDelay);
        }

        for (const callback of Array.from(exitCallbacks).reverse()) {
            await callback(sig);
        }

        // eslint-disable-next-line no-console
        options.log!('!!', sig, 'Terminating ...');
        keepAlive.reject(sig);
        // eslint-disable-next-line no-process-exit
        process.exit(0);
    }));

    const runner = async () => {
        const inits = await Promise.all((routines as InitRoutineSig[]).map((routine) => routine()));

        const loopParams = inits.filter(predicate.isPlainObject)
            .reduce((acc, obj) => {
                return { ...obj, ...acc };
            }, {});

        options.log!('!!', 'Starting...');
        while (keepAlive.running) {
            try {
                await loopRoutine({
                    quit(reason?: any) {
                        if (reason) {
                            keepAlive.reject(reason);
                        } else {
                            keepAlive.resolve();
                        }
                    },
                    onExit(cb: ExitSig) {
                        exitCallbacks.add(cb);
                        return () => {
                            exitCallbacks.delete(cb);
                        };
                    },
                    params: loopParams
                });
                if (options.keepAlive) {
                    await keepAlive.promise;
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                options.log!('!!', 'Worker failed with error:', e);
                if (keepAlive.running) {
                    await promise.wait(options.restartDelay!);
                    // eslint-disable-next-line no-console
                    options.log!('!!', 'Restarting...');
                }
            }
        }
    };

    if (options.autostart) {
        return runner();
    }

    return runner;
}
