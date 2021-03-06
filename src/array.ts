/**
 * Compares two arrays by its contents (order matters)
 */
export const equal = <A = any, B = any>(a: A[], b: B[]): boolean => {
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
export const remove = <T = any>(arr: T[], val: T): T[] => {
    const index = arr.indexOf(val);
    if (index >= 0) {
        arr.splice(index, 1);
    }

    return arr;
};

/**
 * Remove duplicates from array (mutable)
 */
export const uniq = <T>(arr: T[]): T[] => {
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
export const merge = <T>(arr: T[], ...arrs: T[][]): T[] => {
    for (const a of arrs.filter(Array.isArray)) {
        arr.push(...a);
    }

    return arr;
};

/**
 * Remove item from array (immutable)
 */
export const copyRemove = <T>(arr: T[], val: T) => {
    return remove([...arr], val);
};

/**
 * Remove duplicates from array (immutable)
 */
export const copyUniq = <T>(arr: T[]): T[] => {
    return uniq([...arr]);
};

/**
 * Merge provided arrays (immutable)
 */
export const copyMerge = <T>(...arrs: T[][]): T[] => {
    return merge([], ...arrs);
};

/**
 * Make iterator of array
 */
export const makeIterator = <T>(iterator: Array<T> | IterableIterator<T>): IterableIterator<T> => {
    if (Array.isArray(iterator)) {
        let nextIndex = 0;

        return {
            [Symbol.iterator]() {
                return makeIterator(iterator);
            },
            next() {
                if (nextIndex < iterator.length) {
                    return { value: iterator[nextIndex++], done: false };
                }

                return { done: true } as IteratorResult<T>;
            }
        };
    }

    return iterator;
};
