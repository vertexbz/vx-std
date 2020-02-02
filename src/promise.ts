/**
 * Wait for given period of time
 * @param time delay time in milliseconds
 * @param reject when set to true promise will be rejected instead of being resolved after specified time (default: false)
 */
export const wait = (time: number, reject: boolean = false): Promise<void> =>
    new Promise((res, rej) => setTimeout(reject ? rej : res, time));

/**
 * Promise that can be manually rejected or resolved elsewhere
 */
export class RemoteControlledPromise<T = any> extends Promise<T> {
    protected _running = true;
    protected _resolved = false;
    protected _rejected = false;
    protected _resolver: undefined | ((value?: T | PromiseLike<T>) => void);
    protected _rejector: undefined | ((reason?: any) => void);

    constructor() {
        super((res, rej) => {
            this._resolver = res;
            this._rejector = rej;
        });
    }

    resolve(value?: T | PromiseLike<T>) {
        if (this._resolver) {
            this._running = false;
            this._resolved = true;
            this._resolver(value);
        }
    }

    reject(reason?: any) {
        if (this._rejector) {
            this._running = false;
            this._rejected = true;
            this._rejector(reason);
        }
    }

    get running(): boolean {
        return this._running;
    }

    get resolved(): boolean {
        return this._resolved;
    }

    get rejected(): boolean {
        return this._rejected;
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
