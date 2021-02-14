import type { AnyFunction } from './type';

export type ChainableSig<A, R> = (...args: A[]) => R;

/**
 * Chains function calls, every function gets the same argument set, and latest non-undefined return value is returned
 */
export const chainIfNeeded = <A, R>(...fns_: Array<ChainableSig<A, R> | null | false | void | 0>) => {
    const fns = fns_.filter(Boolean) as ChainableSig<A, R>[];

    if (fns.length === 0) {
        return undefined;
    } else if (fns.length === 1) {
        return fns[0];
    }

    return (...args: any[]) => {
        let result = undefined;

        for (const fn of fns) {
            const returned = fn(...args);
            if (returned !== undefined) {
                result = returned;
            }
        }

        return result;
    };
};

/**
 * Quick clone for functions
 */
export const clone = <F extends AnyFunction = any>(fn: F): F => {
    const cloned = new Function('return ' + fn.toString())();

    for (const key in fn) {
        cloned[key] = fn[key];
    }

    return cloned;
};
