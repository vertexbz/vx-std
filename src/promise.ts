/**
 * Wait for given period of time
 * @param time delay time in milliseconds
 * @param reject when set to true promise will be rejected instead of being resolved after specified time (default: false)
 */
export const wait = (time: number, reject: boolean = false): Promise<void> =>
    new Promise((res, rej) => setTimeout(reject ? rej : res, time));

export type PromiseResolver<T> = (value?: T | PromiseLike<T>) => void;
export type PromiseRejector = (reason?: any) => void;

/**
 * Promise that can be manually rejected or resolved elsewhere
 */
export class RemoteControlledPromise<T = any> {
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
            this._resolver(value);
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


const thenMethods = [
    'bind', 'catch', 'finally', 'asCallback', 'spread', 'map', 'reduce', 'tap', 'then',
    'thenReturn', 'return', 'yield', 'ensure', 'reflect', 'get', 'mapSeries', 'delay'
];

export interface ResolvableInterface<R> {
    _run(): Promise<R>
}

/**
 * Mixes helper methods into class to make its promise-like objects.
 * Instance called as promise (so with then, catch, preceded by await, etc...) will invoke _run method with no arguments.
 * Very useful to create knex or objection -like query builders.
 *
 * Basic usage example:
 *
 * ```ts
 * import { promise } from 'vx-std';
 * class QueryBuilderBase {
 *   select(table: string) {
 *       console.log('Selected table:', table);
 *       return this;
 *   }
 *
 *   _run() {
 *       console.log('Running query');
 *       return new Promise((res) => {
 *           setTimeout(() => {
 *               console.log('Sending result');
 *               return 42;
 *           }, 100)
 *       })
 *   }
 * }
 * const QueryBuilder = promise.makeResolvable(QueryBuilderBase);
 * // ...
 * const qb = new QueryBuilder();
 * const result = await qb.select(table); // Selected table: ...
 *                                        // Running query
 *
 *                                        // Sending result
 * console.log(result);                   // 42
 * ```
 */
export const makeResolvable = <R, T extends {new(...args:any[]): ResolvableInterface<R>}>(Target: T): T & Promise<R> => {
    for (const method of thenMethods) {
        // $FlowIgnore
        Target.prototype[method] = function() {
            const promise = this._run();
            return promise[method].apply(promise, arguments);
        };
    }

    return Target as T & Promise<R>;
};
