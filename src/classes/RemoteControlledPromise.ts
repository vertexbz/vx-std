import type { PromiseRejector, PromiseResolver } from '../promise';

/**
 * Promise that can be manually rejected or resolved elsewhere
 */
export default
class RemoteControlledPromise<T = any> {
    protected _promise: Promise<T> | undefined;
    protected _resolver: undefined | PromiseResolver<T>;
    protected _rejector: undefined | PromiseRejector;

    protected _state = 'running';

    protected _resolvedValue: T | PromiseLike<T> | undefined;
    protected _rejectReason: any;

    protected _promiseRoutine(res: PromiseResolver<T>, rej: PromiseRejector) {
        this._resolver = res;
        this._rejector = rej;
    }

    resolve(value?: T | PromiseLike<T>) {
        if (this._resolver) {
            this._state = 'resolved';
            this._resolvedValue = value;
            this._resolver(value!);
        }
    }

    reject(reason?: any) {
        if (this._rejector) {
            this._state = 'rejected';
            this._rejectReason = reason;
            this._rejector(reason);
        }
    }

    get running(): boolean {
        return this._state === 'running';
    }

    get resolved(): boolean {
        return this._state === 'resolved';
    }

    get rejected(): boolean {
        return this._state === 'rejected';
    }

    get promise() {
        if (this.running) {
            if (!this._promise) {
                this._promise = new Promise<T>(this._promiseRoutine.bind(this));
            }
            return this._promise;
        } else if (this.resolved) {
            return Promise.resolve(this._resolvedValue);
        } else if (this.rejected) {
            return Promise.reject(this._rejectReason);
        }
    }
}
