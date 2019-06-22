/**
 * Compares two arrays by its contents (order matters)
 */
export const equal = <A = any, B = any>(a: Array<A>, b: Array<B>): boolean => {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; ++i) {
        // @ts-ignore
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
};

/**
 * Remove item from array (mutable)
 */
export const remove = <T = any>(arr: Array<T>, val: T) => {
    const index = arr.indexOf(val);
    if (index >= 0) {
        arr.splice(index, 1);
    }

    return arr;
};

/**
 * Remove duplicates from array (mutable)
 */
export const uniq = <A>(arr: Array<A>) => {
    for (let i = 0; i < arr.length; ++i) {
        let index = -1;

        while ((index = arr.indexOf(arr[i], i + 1)) && index >= 0) {
            arr.splice(index, 1);
        }
    }
    return arr;
};

/**
 * Merge provided arrays (concatenate to first one, mutable)
 */
export const merge = <A>(arr: Array<A>, ...arrs: Array<any>) => {
    for (const a of arrs.filter(Array.isArray)) {
        arr.push(...a);
    }

    return arr;
};

/**
 * Remove item from array (immutable)
 */
export const copyRemove = <T>(arr: Array<T>, val: T) => {
    return remove([...arr], val);
};

/**
 * Remove duplicates from array (immutable)
 */
export const copyUniq = <A>(arr: Array<A>) => {
    return uniq([...arr]);
};

/**
 * Merge provided arrays (immutable)
 */
export const copyMerge = <A>(...arrs: Array<any>) => {
    return merge([], ...arrs);
};
