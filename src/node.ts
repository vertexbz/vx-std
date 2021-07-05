import RemoteControlledPromise from './classes/RemoteControlledPromise';
import * as promise from './promise';
import * as predicate from './predicate';

export { default as Child } from './classes/Child';
export { default as ChildAutoRestart } from './classes/ChildAutoRestart';

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

export type InitRoutineSig = () => Promise<Record<string, any> | void> | Record<string, any> | void
export type ServiceRoutineSig = (serviceParams: ServiceParams) => Promise<void> | void;

export type ServiceConfig = {
    keepAlive?: boolean,
    autostart?: boolean,
    throwOut?: boolean,
    terminationDelay?: number,
    restartDelay?: number,
    log?(...args: any[]): void;
    error?(...args: any[]): void;
};

export interface StartedServiceResult {
    onExit(cb: ExitSig): DisposerSig;
    promise: Promise<void>;
}

export interface PreparedServiceResult {
    onExit(cb: ExitSig): DisposerSig;
    start(): Promise<void>;
}

export function service(loopRoutine: ServiceRoutineSig): StartedServiceResult;
export function service(initRoutine: InitRoutineSig, loopRoutine: ServiceRoutineSig): StartedServiceResult;
export function service(initRoutine: InitRoutineSig, initRoutine2: InitRoutineSig, loopRoutine: ServiceRoutineSig): StartedServiceResult;
// eslint-disable-next-line max-len
export function service(initRoutine: InitRoutineSig, initRoutine2: InitRoutineSig, initRoutine3: InitRoutineSig, loopRoutine: ServiceRoutineSig): StartedServiceResult;

export function service(config: ServiceConfig & { autostart: true }, loopRoutine: ServiceRoutineSig): StartedServiceResult;
// eslint-disable-next-line max-len
export function service(config: ServiceConfig & { autostart: true }, initRoutine: InitRoutineSig, loopRoutine: ServiceRoutineSig): StartedServiceResult;
// eslint-disable-next-line max-len
export function service(config: ServiceConfig & { autostart: true }, initRoutine: InitRoutineSig, initRoutine2: InitRoutineSig, loopRoutine: ServiceRoutineSig): StartedServiceResult;
// eslint-disable-next-line max-len
export function service(config: ServiceConfig & { autostart: true }, initRoutine: InitRoutineSig, initRoutine2: InitRoutineSig, initRoutine3: InitRoutineSig, loopRoutine: ServiceRoutineSig): StartedServiceResult;
export function service(config: ServiceConfig & { autostart: true }, ...routines: (ServiceRoutineSig | InitRoutineSig)[]): StartedServiceResult;

export function service(config: ServiceConfig & { autostart: false }, loopRoutine: ServiceRoutineSig): PreparedServiceResult;
// eslint-disable-next-line max-len
export function service(config: ServiceConfig & { autostart: false }, initRoutine: InitRoutineSig, loopRoutine: ServiceRoutineSig): PreparedServiceResult;
// eslint-disable-next-line max-len
export function service(config: ServiceConfig & { autostart: false }, initRoutine: InitRoutineSig, initRoutine2: InitRoutineSig, loopRoutine: ServiceRoutineSig): PreparedServiceResult;
// eslint-disable-next-line max-len
export function service(config: ServiceConfig & { autostart: false }, initRoutine: InitRoutineSig, initRoutine2: InitRoutineSig, initRoutine3: InitRoutineSig, loopRoutine: ServiceRoutineSig): PreparedServiceResult;
// eslint-disable-next-line max-len
export function service(config: ServiceConfig & { autostart: false }, ...routines: (ServiceRoutineSig | InitRoutineSig)[]): PreparedServiceResult;
export function service(...routines: any[]): StartedServiceResult | PreparedServiceResult {
    const options: ServiceConfig = {
        keepAlive: false,
        autostart: true,
        terminationDelay: 0,
        restartDelay: 5000,
        // eslint-disable-next-line no-console
        log: console.log.bind(console),
        // eslint-disable-next-line no-console
        error: console.error.bind(console)
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
            options.log!(sig, 'Terminating in ' + options.terminationDelay + 'ms...');
            await promise.wait(options.terminationDelay);
        }

        for (const callback of Array.from(exitCallbacks).reverse()) {
            await callback(sig);
        }

        // eslint-disable-next-line no-console
        options.log!(sig, 'Terminating ...');
        keepAlive.reject(sig);
        // eslint-disable-next-line no-process-exit
        process.exit(0);
    }));

    const onExit = (cb: ExitSig) => {
        exitCallbacks.add(cb);
        return () => {
            exitCallbacks.delete(cb);
        };
    };

    const runner = async () => {
        const inits = await Promise.all((routines as InitRoutineSig[]).map((routine) => routine()));

        const loopParams = inits.filter(predicate.isPlainObject)
            .reduce((acc, obj) => {
                return { ...obj, ...acc };
            }, {});

        options.log!('Starting...');
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
                    onExit,
                    params: loopParams
                });
                if (options.keepAlive) {
                    await keepAlive.promise;
                }
            } catch (e) {
                options.error!('Worker failed with error:', e.stack);
                if (options.throwOut) {
                    throw e;
                }
                if (keepAlive.running) {
                    await promise.wait(options.restartDelay!);
                    options.log!('Restarting...');
                }
            }
        }
    };

    if (options.autostart) {
        return {
            promise: runner(),
            onExit
        };
    }

    return {
        start: runner,
        onExit
    };
}
