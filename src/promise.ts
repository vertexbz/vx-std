import type { ConstructorArgTypes } from './type';

/**
 * Wait for given period of time
 * @param time delay time in milliseconds
 * @param reject when set to true promise will be rejected instead of being resolved after specified time (default: false)
 */
export const wait = (time: number, reject = false): Promise<void> =>
    new Promise((res, rej) => setTimeout(reject ? rej : res, time));

export type PromiseResolver<T> = (value: T | PromiseLike<T>) => void;
export type PromiseRejector = (reason?: any) => void;

const thenMethods = [
    'bind', 'catch', 'finally', 'asCallback', 'spread', 'map', 'reduce', 'tap', 'then',
    'thenReturn', 'return', 'yield', 'ensure', 'reflect', 'get', 'mapSeries', 'delay'
];

export interface ResolvableInterface<R> {
    _run(): Promise<R>
}

export interface ResolvableInterfaceCls<R> {
    new(...args: any[]): ResolvableInterface<R>
}

export interface ResolvableCls<R, T extends ResolvableInterfaceCls<R> = any> {
    new (...args: ConstructorArgTypes<T>): InstanceType<T> & Promise<R>
}

export type ResultExtractor<T> = T extends ResolvableInterfaceCls<infer U> ? U : never;
export type BaseExtractor<T> = T extends ResolvableInterfaceCls<any> ? T : never;

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
export const makeResolvable = <T, R = ResultExtractor<BaseExtractor<T>>>(Target: T): ResolvableCls<R, BaseExtractor<T>> => {
    for (const method of thenMethods) {
        (Target as BaseExtractor<T>).prototype[method] = function(...args: any[]) {
            const promise = this._run();
            // eslint-disable-next-line prefer-spread
            return promise[method].apply(promise, args);
        };
    }

    return Target as any;
};
