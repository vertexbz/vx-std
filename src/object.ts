/* eslint-disable @typescript-eslint/ban-types */
import { isNumber, isPlainObject, isFunction } from './predicate';
import * as path from './path';

type CasesType<C> = { [key: string]: C };
type ObjectMapperSig<V> = (key: string, value: V, context: any) => V | any;
type RecursiveObjectMapperSig<V> = (key: Array<string | number>, value: V, context: any) => V | any;
type ObjectVisitorSig<V> = (key: string, value: V, context: any) => void;
type RecursiveObjectVisitorSig<V> = (key: Array<string | number>, value: V, context: any) => void;

const _recursiveContextMark = Symbol();
const _recursiveContext = (context: any) => {
    const recursiveContext = {
        [_recursiveContextMark]: true,
        context,
        path: [],
        enter(key: string | number) {
            return {
                ...recursiveContext,
                path: [...recursiveContext.path, key]
            };
        }
    };
    return recursiveContext;
};

/**
 * Map object values
 */
export const map = <O = object>(o: O, mapper: ObjectMapperSig<any>, context?: any): O => {
    if (o) {
        const result: { [P in keyof O]: O[P] | any } = ({} as any);
        for (const [key, value] of Object.entries(o)) {
            // @ts-ignore
            result[key] = mapper(key, value, context);
        }
        return result;
    }

    return o;
};

/**
 * Map object values, recursive
 */
map.recursive = <O = object>(o: O, visitor: RecursiveObjectMapperSig<any>, mapArrays?: boolean, context?: any): O => {
    context = (context && context[_recursiveContextMark]) ? context : _recursiveContext(context);

    return map(o, (key, value, context) => {
        const nextContext = context.enter(key);

        if (isPlainObject(value) || (mapArrays && Array.isArray(value))) {
            return map.recursive(value as any, visitor, mapArrays, nextContext);
        }

        return visitor(nextContext.path, value, nextContext.context);
    }, context);
};

export const visit = <O = object>(o: O, visitor: ObjectVisitorSig<any>, context?: any): O => {
    if (o) {
        for (const [key, value] of Object.entries(o)) {
            visitor(key, value, context);
        }
    }
    return o;
};

visit.recursive = <O = object>(o: O, visitor: RecursiveObjectVisitorSig<any>, visitArrays?: boolean, context?: any): O => {
    context = (context && context[_recursiveContextMark]) ? context : _recursiveContext(context);

    return visit(o, (key, value, context) => {
        const nextContext = context.enter(key);

        if (isPlainObject(value) || (visitArrays && Array.isArray(value))) {
            visit.recursive(value as any, visitor, visitArrays, context);
        }

        visitor(nextContext.path, value, nextContext.context);
    }, context);
};

export const _putIn = <O>(o: O, strPath: string, value: any, pickCurrent?: (value: any) => any): O => {
    const pPath = path.parse(strPath);
    const lastKey = pPath.pop();

    const root = pickCurrent ? pickCurrent(o) : o;

    if (lastKey) {
        let key;
        let current = root;
        while ((key = pPath.shift()) !== undefined) {
            if (!(key in current)) {
                // @ts-ignore
                current[key] = isNumber(pPath[0]) ? [] : {};
            } else if (pickCurrent) {
                current[key] = pickCurrent(current[key]);
            }

            // @ts-ignore
            current = current[key];
        }

        // @ts-ignore
        current[lastKey] = value;
    }

    return root;
};

export const setIn = <O>(o: O, strPath: string, value: any): O => {
    return _putIn(o, strPath, value);
};

export const replaceIn = <O>(o: O, strPath: string, value: any): O => {
    return _putIn(o, strPath, value, (a) => Array.isArray(a) ? [...a] : { ...a });
};

export const getIn = <O, F>(o: O, strPath: string, fallbackValue?: F): any | F => {
    const pPath = path.parse(strPath);

    let key;
    let current = o;
    while ((key = pPath.shift())) {
        if (!current || !(key in current)) {
            return fallbackValue;
        }

        // @ts-ignore
        current = current[key];
    }

    return current;
};

export const createCaseOf = <C>(cases: CasesType<C>) => (theCase: string): C | void => {
    if (theCase in cases) {
        return cases[theCase];
    }

    return undefined;
};

export const collectDescriptors = (subject: object, limit: any = Object): { [x: string]: PropertyDescriptor } => {
    const result = {};

    subject = isFunction(subject) ? subject.prototype : Object.getPrototypeOf(subject);

    do {
        // @ts-ignore
        Object.assign(result, { ...Object.getOwnPropertyDescriptors(subject), ...result });
        // @ts-ignore
        subject = Object.getPrototypeOf(subject);
    } while (subject && subject !== limit.prototype);

    return result;
};
