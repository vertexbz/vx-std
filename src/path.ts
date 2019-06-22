import { isNumber, isString } from './predicate';
import { getTag } from './type';

/**
 * Parse string path and return path array
 */
export const parse = (path: string): Array<string | number> => {
    const result: Array<string | number> = [];
    path.replace(/(?:\[(?<a>[0-9]+)\])|(?<o>[^\.\[]+)/g, (...args) => {
        const { a, o } = args.pop();

        if (a) {
            const index = parseInt(a);
            if (!isNaN(index)) {
                result.push(index);
                return '';
            }
        }

        result.push(o);
        return '';
    });

    return result;
};

export const stringifyItem = (key: string | number): string => {
    if (isNumber(key)) {
        return '[' + key + ']';
    } else if (isString(key)) {
        // @ts-ignore
        return key;
    } else {
        throw new Error(`Keys of type '${getTag(key)}' are a big no-no here.`);
    }
};

export const stringify = (path: Array<string | number>): string => {
    return path
        .map(stringifyItem)
        .reduce((acc, item, i) => acc + ((i === 0 || isNumber(path[i])) ? item : ('.' + item)), '');
};

export const verify = (path: string): boolean => /^(?:(?:\[[0-9]+\])|(?:\.?[^\.\[]+))+$/.test(path);

export const concat = (...paths: string[]): string => {
    return paths.filter(isString).reduce((path, piece) => {
        if (path.length === 0 || /^\[[0-9]+]/.test(piece)) {
            return path + piece;
        }

        return path + '.' + piece;
    }, '');
};
