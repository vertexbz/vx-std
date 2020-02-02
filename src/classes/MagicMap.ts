export type LeafCreatorSig<K, T, M> = (key: K, parent: M) => T;

type MagicMapVisitorSig<K, V> = (value: V, key: K, map: Map<K, V>) => void;

export
class MagicMap<K, C> {
    _store = new Map<K, C>();
    _constructor: LeafCreatorSig<K, C, MagicMap<K, C>>;

    constructor(c: LeafCreatorSig<K, C, MagicMap<K, C>>) {
        this._constructor = c;
    }

    get(key: K, constructorKey: never): C {
        const value = this._store.get(key);

        if (value === undefined) {
            const leaf = this._constructor(constructorKey || key, this);
            this._store.set(key, leaf);
            return leaf;
        }


        return value;
    }

    set(key: K, value: C) {
        this._store.set(key, value);
        return this;
    }

    has(key: K): boolean {
        return this._store.has(key);
    }

    delete(key: K) {
        return this._store.delete(key);
    }

    forEach(visitor: MagicMapVisitorSig<K, C>, thisArg?: any): void {
        this._store.forEach(visitor, thisArg);
    };
}
