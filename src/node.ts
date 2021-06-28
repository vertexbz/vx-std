/* eslint-disable @typescript-eslint/ban-types */
import RemoteControlledPromise from './classes/RemoteControlledPromise';
import * as promise from './promise';
import * as predicate from './predicate';

export type DisposerSig = () => void
export type InitRoutineSig = () => Promise<object | void> | object | void
export type ServiceRoutineSig = (params: object) => Promise<void> | void;
export type ExitSig = (sig: NodeJS.Signals) => Promise<void> | void;

export interface ServiceParamsBase {
    quit(): void;
    onExit(cb: ExitSig): DisposerSig;
}

export type ServiceConfig = {
    keepAlive?: boolean,
    autostart?: boolean,
    terminationDelay?: number,
    restartDelay?: number
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
        restartDelay: 5000
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
            console.log(sig, 'Terminating in ' + options.terminationDelay + 'ms...');
            await promise.wait(options.terminationDelay);
        }

        for (const callback of Array.from(exitCallbacks).reverse()) {
            await callback(sig);
        }

        // eslint-disable-next-line no-console
        console.log(sig, 'Terminating ...');
        keepAlive.reject(sig);
        // eslint-disable-next-line no-process-exit
        process.exit(0);
    }));

    const runner = async () => {
        const inits = await Promise.all((routines as InitRoutineSig[]).map((routine) => routine()));

        const loopParams = inits.filter(predicate.isPlainObject)
            .reduce((acc, obj) => {
                return { ...obj, ...acc };
            }, {
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
                }
            } as ServiceParamsBase);

        while (keepAlive.running) {
            try {
                await loopRoutine(loopParams);
                if (options.keepAlive) {
                    await keepAlive.promise;
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log('!!', 'Worker failed with error:', e);
                if (keepAlive.running) {
                    await promise.wait(options.restartDelay!);
                    // eslint-disable-next-line no-console
                    console.log('!!', 'Restarting...');
                }
            }
        }
    };

    if (options.autostart) {
        return runner();
    }

    return runner;
}
