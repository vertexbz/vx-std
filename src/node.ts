/* eslint-disable @typescript-eslint/ban-types */
import RemoteControlledPromise from './classes/RemoteControlledPromise';
import * as promise from './promise';
import * as predicate from './predicate';

export type InitRoutineSig = () => Promise<object | void> | object | void
export type ServiceRoutineSig = (params: object) => Promise<void> | void;

export type ServiceConfig = {
    keepAlive?: boolean,
    autostart?: boolean
};

export function service(config: ServiceConfig, ...routines: (ServiceRoutineSig | InitRoutineSig)[]): void;
export function service(...routines: any[]) {
    const options: ServiceConfig = {
        keepAlive: false,
        autostart: true
    };
    if (predicate.isPlainObject(routines[0])) {
        Object.assign(options, routines.shift());
    }
    const loopRoutine = routines.pop() as ServiceRoutineSig;

    const keepAlive = new RemoteControlledPromise<undefined>();

    (['SIGHUP', 'SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((sig) => process.on(sig, () => {
        // eslint-disable-next-line no-console
        console.log(sig, 'Terminating worker pool...');
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
                }
            });

        while (keepAlive.running) {
            try {
                await loopRoutine(loopParams);
                if (options.keepAlive) {
                    await keepAlive.promise;
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log('!!', 'Pool failed with error:', e);
                if (keepAlive.running) {
                    await promise.wait(5000);
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
