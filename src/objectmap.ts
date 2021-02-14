import { visit, setIn } from './object';

type PathMapType = Record<string, any>;

export const fromObject = (o: Record<string, any>) => {
    const result: PathMapType = {};
    visit.recursive(o, (path, value) => {
        result[path.join('.')] = value;
    });

    return result;
};

export const toObject = (m: PathMapType) => {
    const result: Record<string, any> = {};
    visit(m, (path, value) => setIn(result, path, value));
    return result;
};
