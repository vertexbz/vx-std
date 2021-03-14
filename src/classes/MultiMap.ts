import { makeIterator } from '../array';
import { MagicMap } from './MagicMap';

export type EntryVisitor<K, V, M> = (value: V[], key: K, map: M) => void;
export type Visitor<K, V, M> = (value: V, key: K, map: M) => void;

export class MultiMap<K = string, V = any> {
    protected store = new MagicMap<K, V[]>(() => [] as V[]);

    public constructor(initial?: MultiMap<[K, V]>) {
        if (initial) {
            initial.forEach(([key, value]: [K, V]) => {
                this.set(key, value);
            });
        }
    }

    public get(key: K): V[] {
        return this.store.get(key);
    }

    public set(key: K, ...vals: V[]): this {
        const entry = this.store.get(key);
        Array.prototype.push.apply(entry, vals);
        return this;
    }

    public delete(key: K, ...vals: V[]): boolean {
        if (!this.has(key))
            return false;

        if (vals.length == 0) {
            this.store.delete(key);
            return true;
        }

        const entry = this.get(key);

        let removed = false;
        for (const val of vals) {
            const idx = entry.indexOf(val as V);
            if (idx != -1) {
                entry.splice(idx, 1);
                removed = true;
            }
        }

        return removed;
    }

    public has(key: K, val?: V): boolean {
        const hasKey = this.store.has(key);

        if (arguments.length == 1 || !hasKey)
            return hasKey;

        const entry = this.get(key) || [];
        return entry.indexOf(val!) != -1;
    }

    public keys(): IterableIterator<K> {
        return this.store.keys();
    }

    public values(): IterableIterator<V> {
        const vals: V[] = [];
        this.forEachEntry((entry: V[]) => {
            vals.push(...entry);
        });

        return makeIterator(vals);
    }

    public forEachEntry(visitor: EntryVisitor<K, V, MultiMap<K, V>>): void {
        const keys = this.keys();
        let next;
        while (!(next = keys.next()).done) {
            visitor(this.get(next.value) as V[], next.value, this);
        }
    }

    public forEach(visitor: Visitor<K, V, MultiMap<K, V>>): void {
        this.forEachEntry((entry, key) => {
            entry.forEach((item) => {
                visitor(item, key, this);
            });
        });
    }

    public clear(): this {
        this.store.clear();
        return this;
    }

    public get size(): number {
        let total = 0;

        this.forEachEntry((value) => {
            total += value.length;
        });

        return total;
    }
}

