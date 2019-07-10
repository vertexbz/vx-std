/**
 * Wait for given period of time
 * @param time delay time in milliseconds
 * @param reject when set to true promise will be rejected instead of being resolved after specified time (default: false)
 */
export const wait = (time: number, reject: boolean = false): Promise<void> =>
    new Promise((res, rej) => setTimeout(reject ? rej : res, time));




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