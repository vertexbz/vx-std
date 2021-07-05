import { fork as nodeFork, spawn as nodeSpawn } from 'child_process';

import type { ChildProcess, ForkOptions, SpawnOptions, MessageOptions } from 'child_process';
import type { Readable, Writable } from 'stream';
import type net from 'net';

export type SpawnSig = () => ChildProcess;

export default class Child {
    protected _code = -1;
    protected _spawn: SpawnSig;
    // @ts-ignore
    protected _process: ChildProcess;

    public static init<R = Child>(spawn: SpawnSig, ...args: any[]): Promise<R> {
        // @ts-ignore
        const instance: R = new this(spawn, ...args);
        // @ts-ignore
        return instance.start();
    }

    public static fork(module: string, args: string[] = [], options: ForkOptions = {}): Promise<Child> {
        return this.init(() => nodeFork(module, args, options));
    }

    public static spawn(command: string, args: string[] = [], options: SpawnOptions = {}): Promise<Child> {
        return this.init(() => nodeSpawn(command, args, options));
    }

    protected constructor(spawn: SpawnSig) {
        this._spawn = spawn;
    }

    protected init() {
        this._code = -1;
        const process = this._spawn();
        process.on('close', (code) => {
            if (null !== code) {
                this._code = code;
            }
        });

        return process;
    }

    protected async start(): Promise<this> {
        const process = this.init();
        this._process = process;

        return new Promise((res, rej) => {
            process.on('spawn', () => res(this));
            process.on('error', (e: Error) => rej(e));
        });
    }

    public async join(): Promise<void> {
        return this._join();
    }

    public async _join(): Promise<void> {
        if (!this._process) {
            return;
        }

        const process = this._process;
        return new Promise<void>((res, rej) => {
            if (!process) {
                res();
                return;
            }
            process.on('close', (code) => {
                const error = this.exitError(code || 0);
                if (error) {
                    rej(error);
                } else {
                    res();
                }
            });
        });
    }

    public kill(signal: NodeJS.Signals = 'SIGTERM') {
        if (!this._process) {
            return;
        }
        this._process.kill(signal);
    }

    public killAndWait(signal: NodeJS.Signals = 'SIGTERM') {
        if (!this._process) {
            return;
        }

        const awaiter = this._join();
        this._process.kill(signal);
        return awaiter;
    }

    protected exitError(code: number) {
        if (code > 0) {
            return new Error('Child process returned non-zero exit code: ' + code);
        }

        return 0;
    }

    // Proxy ChildProcess methods
    public set stdin(stdin: Writable | null) {
        this._process.stdin = stdin;
    }
    public get stdin() {
        return this._process.stdin;
    }
    public set stdout(stdout: Readable | null) {
        this._process.stdout = stdout;
    }
    public get stdout() {
        return this._process.stdout;
    }
    public set stderr(stderr: Readable | null) {
        this._process.stderr = stderr;
    }
    public get stderr() {
        return this._process.stderr;
    }
    public get channel() {
        return this._process.channel;
    }
    public get stdio() {
        return this._process.stdio;
    }
    public get killed() {
        return this._process.killed;
    }
    public get pid() {
        return this._process.pid;
    }
    public get connected() {
        return this._process.connected;
    }

    public send(message: any, callback?: (error: Error | null) => void): boolean;
    public send(message: any, sendHandle?: net.Socket | net.Server, callback?: (error: Error | null) => void): boolean;
    public send(message: any, sendHandle?: net.Socket | net.Server, options?: MessageOptions, callback?: (error: Error | null) => void): boolean;
    public send(...args: any[]) {
        // @ts-ignore
        return this._process.send(...args);
    }

    public disconnect() {
        return this._process.disconnect();
    }
    public unref() {
        return this._process.unref();
    }
    public ref() {
        return this._process.ref();
    }

    public addListener(event: 'close', listener: (code: number, signal: string) => void): this;
    public addListener(event: 'disconnect', listener: () => void): this;
    public addListener(event: 'error', listener: (err: Error) => void): this;
    public addListener(event: 'exit', listener: (code: number | null, signal: string | null) => void): this;
    public addListener(event: 'message', listener: (message: any, sendHandle: net.Socket | net.Server) => void): this;
    public addListener(event: string, listener: (...args: any[]) => void): this {
        // @ts-ignore
        return this._process.addListener(event, listener);
    }

    public emit(event: 'close', code: number, signal: string): boolean;
    public emit(event: 'disconnect'): boolean;
    public emit(event: 'error', err: Error): boolean;
    public emit(event: 'exit', code: number | null, signal: string | null): boolean;
    public emit(event: 'message', message: any, sendHandle: net.Socket | net.Server): boolean;
    public emit(event: string | symbol, ...args: any[]): boolean {
        return this._process.emit(event, ...args);
    }

    public on(event: 'close', listener: (code: number, signal: string) => void): this;
    public on(event: 'disconnect', listener: () => void): this;
    public on(event: 'error', listener: (err: Error) => void): this;
    public on(event: 'exit', listener: (code: number | null, signal: string | null) => void): this;
    public on(event: 'message', listener: (message: any, sendHandle: net.Socket | net.Server) => void): this;
    public on(event: string, listener: (...args: any[]) => void): this {
        this._process.on(event, listener);
        return this;
    }

    public once(event: 'close', listener: (code: number, signal: string) => void): this;
    public once(event: 'disconnect', listener: () => void): this;
    public once(event: 'error', listener: (err: Error) => void): this;
    public once(event: 'exit', listener: (code: number | null, signal: string | null) => void): this;
    public once(event: 'message', listener: (message: any, sendHandle: net.Socket | net.Server) => void): this;
    public once(event: string, listener: (...args: any[]) => void): this {
        this._process.once(event, listener);
        return this;
    }

    public prependListener(event: 'close', listener: (code: number, signal: string) => void): this;
    public prependListener(event: 'disconnect', listener: () => void): this;
    public prependListener(event: 'error', listener: (err: Error) => void): this;
    public prependListener(event: 'exit', listener: (code: number | null, signal: string | null) => void): this;
    public prependListener(event: 'message', listener: (message: any, sendHandle: net.Socket | net.Server) => void): this;
    public prependListener(event: string, listener: (...args: any[]) => void): this {
        this._process.prependListener(event, listener);
        return this;
    }

    public prependOnceListener(event: 'close', listener: (code: number, signal: string) => void): this;
    public prependOnceListener(event: 'disconnect', listener: () => void): this;
    public prependOnceListener(event: 'error', listener: (err: Error) => void): this;
    public prependOnceListener(event: 'exit', listener: (code: number | null, signal: string | null) => void): this;
    public prependOnceListener(event: 'message', listener: (message: any, sendHandle: net.Socket | net.Server) => void): this;
    public prependOnceListener(event: string, listener: (...args: any[]) => void): this {
        this._process.prependOnceListener(event, listener);
        return this;
    }
}
