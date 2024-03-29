import { getTag } from './type';
import type { AnyFunction } from './type';

/**
 * Checks whether provided argument is a function
 */
export const isFunction = (subject: any): subject is AnyFunction => {
    return typeof subject === 'function' || subject instanceof Function;
};

/**
 * Checks whether provided argument is a string
 */
export const isString = (subject: any): subject is string => {
    return typeof subject === 'string' || subject instanceof String;
};

/**
 * Checks whether provided argument is a numeric string
 */
export const isNumeric = (str: string): boolean => {
    // @ts-ignore
    return !isNaN(str) && !isNaN(parseFloat(str));
};

/**
 * Checks whether provided argument is a number
 */
export const isNumber = (subject: any): subject is number => {
    return typeof subject === 'number' || subject instanceof Number;
};

/**
 * Checks whether provided argument is an object
 */
export const isObject = (subject: any): subject is Record<string, any> => {
    return subject && typeof subject === 'object';
};

/**
 * Checks whether provided argument is a plain object
 */
export const isPlainObject = (subject: any): subject is Record<string, any> => {
    if (!isObject(subject)) return false;
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
