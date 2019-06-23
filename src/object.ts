import { isNumber, isPlainObject } from './predicate';
import * as path from './path';

type CasesType<C> = { [key: string]: C };
type ObjectMapperSig<K, V> = (key: string, value: V, context: any) => V | any;
type RecursiveObjectMapperSig<K, V> = (key: Array<string | number>, value: V, context: any) => V | any;
type ObjectVisitorSig<K, V> = (key: string, value: V, context: any) => void;
type RecursiveObjectVisitorSig<K, V> = (key: Array<string | number>, value: V, context: any) => void;

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
            }
        }
    };
    return recursiveContext;
};

/**
 * Map object values
 */
export const map = <O = object>(o: O, mapper: ObjectMapperSig<keyof O, any>, context?: any): O => {
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
map.recursive = <O = object>(o: O, visitor: RecursiveObjectMapperSig<keyof O, any>, mapArrays?: boolean, context?: any): O => {
    context = (context && context[_recursiveContextMark]) ? context : _recursiveContext(context);

    return map(o, (key, value, context) => {
        const nextContext = context.enter(key);

        if (isPlainObject(value) || (mapArrays && Array.isArray(value))) {
            return map.recursive(value as any, visitor, mapArrays, nextContext);
        }

        return visitor(nextContext.path, value, nextContext.context);
    }, context);
};

export const visit = <O = object>(o: O, visitor: ObjectVisitorSig<keyof O, any>, context?: any): O => {
    if (o) {
        for (const [key, value] of Object.entries(o)) {
            visitor(key, value, context);
        }
    }
    return o;
};

visit.recursive = <O = object>(o: O, visitor: RecursiveObjectVisitorSig<keyof O, any>, visitArrays?: boolean, context?: any): O => {
    context = (context && context[_recursiveContextMark]) ? context : _recursiveContext(context);

    return visit(o, (key, value, context) => {
        const nextContext = context.enter(key);

        if (isPlainObject(value) || (visitArrays && Array.isArray(value))) {
            visit.recursive(value as any, visitor, visitArrays, context);
        }

        visitor(nextContext.path, value, nextContext.context);
    }, context);
};

export const _putIn = <O>(o: O, strPath: string, value: any, pickCurrent: (value: any) => any): O => {
    const pPath = path.parse(strPath);
    const lastKey = pPath.pop();

    if (lastKey) {
        let key;
        let current = pickCurrent(o);
        while ((key = pPath.shift()) !== undefined) {
            if (!(key in current)) {
                // @ts-ignore
                current[key] = isNumber(pPath[0]) ? [] : {};
            }

            // @ts-ignore
            current = pickCurrent(current[key]);
        }

        // @ts-ignore
        current[lastKey] = value;
    }

    return o;
};

export const setIn = <O>(o: O, strPath: string, value: any): O => {
    return _putIn(o, strPath, value, (a) => a);
};

export const replaceIn = <O>(o: O, strPath: string, value: any): O => {
    return _putIn(o, strPath, value, (a) => Array.isArray(a) ? [...a] : {...a});
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
