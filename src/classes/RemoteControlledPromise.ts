import type { PromiseRejector, PromiseResolver } from '../promise';

/**
 * Promise that can be manually rejected or resolved elsewhere
 */
export default
class RemoteControlledPromise<T = any> {
    protected _promise: Promise<T>;
    protected _resolver: PromiseResolver<T> = undefined as any;
    protected _rejector: PromiseRejector = undefined as any;

    protected _state = 'running';

    protected _resolvedValue: T | PromiseLike<T> | undefined;
    protected _rejectReason: any;

    public constructor() {
        this._promise = new Promise<T>(this._promiseRoutine.bind(this));
    }

    protected _promiseRoutine(res: PromiseResolver<T>, rej: PromiseRejector) {
        this._resolver = res;
        this._rejector = rej;
    }

    public resolve(value?: T | PromiseLike<T>): void {
        this._state = 'resolved';
        this._resolvedValue = value;
        this._resolver(value!);
    }

    public reject(reason?: any): void {
        this._state = 'rejected';
        this._rejectReason = reason;
        this._rejector(reason);
    }

    public get running(): boolean {
        return this._state === 'running';
    }

    public get resolved(): boolean {
        return this._state === 'resolved';
    }

    public get rejected(): boolean {
        return this._state === 'rejected';
    }

    public get promise(): Promise<T> {
        if (this.resolved) {
            return Promise.resolve(this._resolvedValue!);
        } else if (this.rejected) {
            return Promise.reject(this._rejectReason);
        }

        return this._promise;
    }
}
