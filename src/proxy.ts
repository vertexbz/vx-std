import { isFunction } from './predicate';

export const fallbackProxy = (...objs: Array<any>) => {
    const truthy: Array<Object> = objs.filter(Boolean) as any;
    return new Proxy(truthy[objs.length - 1], {
        get(_, prop) {
            for (const obj of objs) {
                // @ts-ignore
                if (prop in obj) {
                    // @ts-ignore
                    const value = obj[prop];
                    if (isFunction(value)) {
                        return value.bind(obj);
                    }
                    return value;
                }
            }
        },
        set(_, prop, value) {
            for (const obj of objs) {
                // @ts-ignore
                if (prop in obj) {
                    // @ts-ignore
                    obj[prop] = value;
                    return true;
                }
            }

            return false;
        },
        has(_, prop) {
            for (const obj of objs) {
                // @ts-ignore
                if (prop in obj) {
                    return true;
                }
            }

            return false;
        },
        isExtensible() {
            return false;
        }
    });
};
