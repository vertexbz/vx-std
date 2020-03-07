// @flow
import CallableInstance from './CallableInstance';

type LeafCreatorSig<T, M> = (key: string, parent: M) => T;

type NormalizerSig = (prop: string) => string;

type StoreType<T> = { [key: string]: T };

export interface CallableSig<T, K> {
    (): StoreType<T>;
    [K: string]: T
}

export class MagicObject<T = any> extends CallableInstance implements CallableSig<T, string> {
    // @ts-ignore
    private readonly _store: StoreType<T>;

    public constructor(creator: LeafCreatorSig<T, MagicObject<T>>, normalizer?: NormalizerSig) {
        super('_call');
        this._store = {};

        const that = this;
        return new Proxy(that, {
            get(_: any, prop: string): T {
                if (normalizer) {
                    prop = normalizer(prop);
                }

                if (!(prop in that._store)) {
                    that._store[prop] = creator(prop, that);
                }

                return that._store[prop];
            }
        });
    }

    // @ts-ignore
    private _call(): StoreType<T> {
        return Object.freeze(Object.assign({}, this._store));
    }

    [K: string]: T;
}
