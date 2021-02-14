export type LeafCreatorSig<K, T, M> = (key: K, parent: M) => T;

type MagicMapVisitorSig<K, V> = (value: V, key: K, map: Map<K, V>) => void;

export
class MagicMap<K, C> {
    protected _store = new Map<K, C>();
    protected _constructor: LeafCreatorSig<K, C, MagicMap<K, C>>;

    public constructor(c: LeafCreatorSig<K, C, MagicMap<K, C>>) {
        this._constructor = c;
    }

    protected getOrCreate(key: K, constructorKey?: any): C {
        const value = this._store.get(key);

        if (value === undefined) {
            const leaf = this._constructor(constructorKey || key, this);
            this._store.set(key, leaf);
            return leaf;
        }


        return value;
    }

    public get(key: K): C {
        return this.getOrCreate(key);
    }

    public set(key: K, value: C) {
        this._store.set(key, value);
        return this;
    }

    public has(key: K): boolean {
        return this._store.has(key);
    }

    public delete(key: K) {
        return this._store.delete(key);
    }

    public forEach(visitor: MagicMapVisitorSig<K, C>, thisArg?: any): void {
        this._store.forEach(visitor, thisArg);
    }
}
