import fs from 'fs';

export type Disposer = () => void;

export default class FileWatcher {
    protected readonly _path: string;
    protected _watcherDisposer: Disposer | undefined = undefined;
    protected _data: Buffer | undefined = undefined;
    protected _version = 0;
    protected _changed = false;

    public constructor(path: string) {
        this._path = path;
    }

    protected watch() {
        let fsWait: NodeJS.Timeout | number | null = null;
        const watcher = fs.watch(this._path, { encoding: 'buffer', persistent: true, recursive: true }, (eventType, fileName) => {
            if (fileName) {
                if (fsWait) {
                    clearTimeout(fsWait as any);
                    fsWait = null;
                }
                fsWait = setTimeout(() => {
                    fsWait = null;

                    if (eventType === 'rename' && !fs.existsSync(this._path)) {
                        this._data = undefined;
                    } else {
                        this._data = this.read();
                    }
                    this._version++;
                    this._changed = true;
                }, 50);
            }

        });

        return () => watcher.close();
    }

    protected read() {
        return fs.readFileSync(this._path);
    }

    public start() {
        if (this._watcherDisposer) {
            return;
        }
        this._watcherDisposer = this.watch();
        this._data = this.read();
    }

    public destroy() {
        if (!this._watcherDisposer) {
            return;
        }
        this._watcherDisposer();
        this._watcherDisposer = undefined;
    }

    public get changed() {
        const changed = this._changed;
        this._changed = false;
        return changed;
    }

    public get version() {
        return this._version;
    }

    public get path() {
        return this._path;
    }

    public get data() {
        this.start();
        return this._data || null;
    }
}
