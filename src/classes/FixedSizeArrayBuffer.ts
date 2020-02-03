export default class FixedSizeArrayBuffer<T = any> {
    protected _size: number;
    protected _store: T[] = [];

    constructor(size: number) {
        this._size = size;
    }

    public has(item: T): boolean {
        return this._store.includes(item);
    }

    public push(item: T) {
        if (this._store.length === this._size) {
            this._store.shift();
        }
        this._store.push(item);
    }

    public shift(): T | undefined {
        return this._store.shift();
    }

    public pop(): T | undefined {
        return this._store.pop();
    }
}
