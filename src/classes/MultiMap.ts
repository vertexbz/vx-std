import { makeIterator } from '../array';

export type EntryVisitor<K, V> = (value: V[], key: K, map: MultiMap<K, V>) => void;
export type Visitor<K, V> = (value: V, key: K, map: MultiMap<K, V>) => void;

export default class MultiMap<K = string, V = any> {
    _ = new Map<K, V[]>();

    constructor(initial?: MultiMap<[K, V]>) {
        if (initial) {
            initial.forEach(([key, value]: [K, V]) => {
                this.set(key, value);
            });
        }
    }

    get(key: K) {
        return this._.get(key)
    }

    set(key: K, val: V) {
        const args = Array.prototype.slice.call(arguments);

        key = args.shift();

        let entry = this.get(key);
        if (!entry) {
            entry = [];
            this._.set(key, entry);
        }

        Array.prototype.push.apply(entry, args);
        return this;
    }

    delete(key: K, val?: V) {
        if (!this.has(key))
            return false;

        if (arguments.length == 1) {
            this._.delete(key);
            return true;
        } else {
            const entry = this.get(key);

            if (entry) {
                const idx = entry.indexOf(val as V);
                if (idx != -1) {
                    entry.splice(idx, 1);
                    return true;
                }
            }
        }

        return false;
    };

    has(key: K, val?: V) {
        const hasKey = this._.has(key);

        if (arguments.length == 1 || !hasKey)
            return hasKey;

        const entry = this.get(key) || [];
        return entry.indexOf(val as V) != -1;
    };

    /**
     * @return {Array} all the keys in the map
     */
    keys() {
        return makeIterator(this._.keys());
    };

    /**
     * @return {Array} all the values in the map
     */
    values() {
        const vals: V[] = [];
        this.forEachEntry((entry: V[]) => {
            vals.push(...entry);
        });

        return makeIterator(vals);
    };

    /**
     *
     */
    forEachEntry(visitor: EntryVisitor<K, V>) {
        const keys = this.keys();
        let next;
        while(!(next = keys.next()).done) {
            visitor(this.get(next.value) as V[], next.value, this);
        }
    };

    forEach(visitor: Visitor<K, V>) {
        this.forEachEntry((entry, key) => {
            entry.forEach((item) => {
                visitor(item, key, this);
            });
        });
    };

    clear() {
        this._.clear();
    }

    get size() {
        let total = 0;

        this.forEachEntry((value) => {
            total += value.length;
        });

        return total;
    }
}

