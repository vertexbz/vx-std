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
