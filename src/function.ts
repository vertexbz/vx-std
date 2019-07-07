/**
 * Chains function calls, every function gets the same argument set, and latest non-undefined return value is returned
 */
export const chainIfNeeded = (...fns: Array<Function | null | false | void | 0>) => {
    if (fns.length === 0 || (fns.length === 1 && !fns[0])) {
        return undefined;
    } else if (fns.length === 1) {
        return fns[0];
    }

    return (...args: any[]) => {
        let result = undefined;

        for (const fn of fns) {
            if (fn) {
                const returned = fn(...args);
                if (returned !== undefined) {
                    result = returned;
                }
            }
        }

        return result;
    };
};

/**
 * Quick clone for functions
 */
export const clone = <F extends Function = Function>(fn: F): F => {
    const cloned = new Function('return ' + fn.toString())();

    for (const key in fn) {
        cloned[key] = fn[key];
    }

    return cloned;
};
