// @flow
type LeafCreatorSig<T, M> = (key: string, parent: M) => T;

type NormalizerSig = (prop: string) => string;

export class MagicObject<T = any> {
    constructor(creator: LeafCreatorSig<T, MagicObject<T>>, normalizer?: NormalizerSig) {
        const store: { [key: string]: T } = {};

        return new Proxy(() => Object.freeze(Object.assign({}, store)), {
            get(_: any, prop: string): T {
                if (normalizer) {
                    prop = normalizer(prop);
                }

                if (!(prop in store)) {
                    store[prop] = creator(prop, store);
                }

                return store[prop];
            }
        });
    }
}
