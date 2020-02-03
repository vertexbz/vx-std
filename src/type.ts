export const getTag = (value: any, resolveCustomConstructors: boolean = true) => {
    if (value === null) {
        return 'Null';
    }

    if (value === undefined) {
        return 'Undefined';
    }

    if (resolveCustomConstructors && value && value.constructor) {
        return value.constructor.name;
    }

    return Object.prototype.toString.call(value).split(' ')[1].slice(0, -1);
};

export type ConstructorArgTypes<T> = T extends new (...args: infer U) => any ? U : never

export type ArgumentTypes<T> = T extends (... args: infer U ) => infer R ? U: never;

export type ReplaceReturnType<T, TNewReturn> = (...a: ArgumentTypes<T>) => TNewReturn;


// Names of properties in T with types that include undefined
type OptionalPropertyNames<T> =
    { [K in keyof T]: undefined extends T[K] ? K : never }[keyof T];

// Common properties from L and R with undefined in R[K] replaced by type in L[K]
type SpreadProperties<L, R, K extends keyof L & keyof R> = { [P in K]: L[P] | Exclude<R[P], undefined> };

type Id<T> = {[K in keyof T]: T[K]}; // see note at bottom*

// Type of { ...L, ...R }
export type Spread<L, R> = Id<
    // Properties in L that don't exist in R
    & Pick<L, Exclude<keyof L, keyof R>>
    // Properties in R with types that exclude undefined
    & Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>>
    // Properties in R, with types that include undefined, that don't exist in L
    & Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>>
    // Properties in R, with types that include undefined, that exist in L
    & SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
    >;
