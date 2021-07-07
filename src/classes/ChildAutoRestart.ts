import { fork as nodeFork, spawn as nodeSpawn } from 'child_process';
import { isNumber } from '../predicate';
import * as promise from '../promise';
import Child from './Child';
import RemoteControlledPromise from './RemoteControlledPromise';

import type { ForkOptions as NodeForkOptions, SpawnOptions as NodeSpawnOptions } from 'child_process';
import type { SpawnSig , RejectSig, ResolveSig } from './Child';

export type RestartType = boolean | 'zero' | 'nonzero';

export interface AutoRestartOptions {
    throw?: boolean;
    restartDelay?: number;
    restart?: RestartType;
}

export interface ForkOptions extends NodeForkOptions, AutoRestartOptions {

}

export interface SpawnOptions extends NodeSpawnOptions, AutoRestartOptions {

}

export default class ChildAutoRestart extends Child {
    protected _promise = new RemoteControlledPromise();
    protected _options: AutoRestartOptions;
    protected _stop = false;

    public static fork(module: string, args: string[] = [], options: ForkOptions = {}): Promise<ChildAutoRestart> {
        const { restartDelay = true, restart = true, 'throw': t = true, ...forkOptions } = options;
        return this.init<ChildAutoRestart>(() => nodeFork(module, args, forkOptions), { restartDelay, restart, 'throw': t });
    }

    public static spawn(command: string, args: string[] = [], options: SpawnOptions = {}): Promise<ChildAutoRestart> {
        const { restartDelay = true, restart = true, 'throw': t = true, ...forkOptions } = options;
        return this.init<ChildAutoRestart>(() => nodeSpawn(command, args, forkOptions), { restartDelay, restart, 'throw': t });
    }

    public constructor(spawn: SpawnSig, options: AutoRestartOptions) {
        super(spawn);
        this._options = options;
    }

    protected shouldRestart(code: number) {
        return !this._stop && (
            this._options.restart === true ||
            (this._options.restart === 'zero' && code === 0) ||
            (this._options.restart === 'nonzero' && code !== 0)
        );
    }

    protected init() {
        const process = super.init();
        process.on('close', (code) => {
            if (this.shouldRestart(code)) {
                const delay = !isNumber(this._options.restartDelay) ? 500 : this._options.restartDelay;
                promise.wait(delay).then(() => {
                    if (this._stop) {
                        return;
                    }
                    return this.start();
                });
            } else {
                const error = this.exitError(code);
                if (error && this._options.throw !== false) {
                    this._promise.reject(error);
                } else {
                    this._promise.resolve();
                }
            }
        });
        
        return process;
    }

    protected handleClose(res: ResolveSig, rej: RejectSig, code: number) {
        const error = this.exitError(code || 0);
        if (error && this._options.throw !== false) {
            rej(error);
        } else {
            res();
        }
    }

    protected async start(): Promise<this> {
        this._stop = false;
        return super.start();
    }

    public kill(signal: NodeJS.Signals = 'SIGTERM') {
        this._stop = true;
        super.kill(signal);
    }

    public killAndWait(signal: NodeJS.Signals = 'SIGTERM'): undefined | Promise<void> {
        this._stop = true;
        return super.killAndWait(signal);
    }

    public async join(): Promise<void> {
        return this._promise.promise;
    }
}
