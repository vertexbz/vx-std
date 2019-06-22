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
