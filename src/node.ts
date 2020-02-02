import * as promise from './promise';

type ServiceRoutineSig = () => Promise<void> | void;

export const service = (...routines: ServiceRoutineSig[]) => {
    const loopRoutine = routines.pop() as ServiceRoutineSig;

    let run = true;

    (['SIGHUP', 'SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((sig) => process.on(sig, () => {
        console.log(sig, 'Terminating worker pool...');
        run = false;
        // eslint-disable-next-line no-process-exit
        process.exit(0);
    }));


    return (async () => {
        await Promise.all(routines.map((routine) => routine()));

        while (run) {
            try {
                await loopRoutine();
                while (run) {
                    await promise.wait(1000);
                }
            } catch (e) {
                console.log('!!', 'Pool failed with error:', e);
                if (run) {
                    await promise.wait(5000);
                    console.log('!!', 'Restarting...');
                }
            }
        }
    })();
};
