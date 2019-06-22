import { getTag } from './type';

/**
 * Checks whether provided argument is a function
 */
export const isFunction = (subject: any): subject is Function => {
    return typeof subject === 'function' || subject instanceof Function;
};

/**
 * Checks whether provided argument is a string
 */
export const isString = (subject: any): subject is string => {
    return typeof subject === 'string' || subject instanceof String;
};

/**
 * Checks whether provided argument is a number
 */
export const isNumber = (subject: any): subject is number => {
    return typeof subject === 'number' || subject instanceof Number;
};

/**
 * Checks whether provided argument is a plain object
 */
export const isPlainObject = (subject: any): subject is object => {
    if (typeof subject !== 'object' || subject === null) return false;
    const proto = Object.getPrototypeOf(subject);
    if (proto === null) return true;
    let baseProto = proto;

    while (Object.getPrototypeOf(baseProto) !== null) {
        baseProto = Object.getPrototypeOf(baseProto);
    }

    return proto === baseProto;
};

/**
 * Checks whether provided argument is a symbol
 */
export const isSymbol = (subject: any): subject is symbol => {
    const type = typeof subject;
    return type === 'symbol' || (type === 'object' && getTag(subject, false) === 'Symbol');
};
