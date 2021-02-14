export const getTag = (value: any, resolveCustomConstructors = true) => {
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

export type AnyFunction = (...args: any[]) => any;

export type ConstructorArgTypes<T> = T extends new (...args: infer U) => any ? U : never


