import { visit, setIn } from './object';

type PathMapType = { [key: string]: any };

export const fromObject = (o: Object) => {
    const result: PathMapType = {};
    visit.recursive(o, (path, value) => {
        result[path.join('.')] = value;
    });

    return result;
};

export const toObject = (m: PathMapType) => {
    const result: Object = {};
    visit(m, (path, value) => setIn(result, path, value));
    return result;
};
