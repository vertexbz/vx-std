import fs from 'fs';
import { FileWatcher, promise } from '../../src';
import { tempFileSync } from '../../src/fs';

describe('FileWatcher', () => {
    // eslint-disable-next-line max-statements
    test('is compatible with CertWatchingServer', async () => {
        const filePath = tempFileSync();

        expect(fs.existsSync(filePath)).toBeTruthy();
        expect(fs.readFileSync(filePath).toString()).toBe('');

        const watcher = new FileWatcher(filePath);
        watcher.start();
        await promise.wait(100);

        expect(watcher.changed).toBeFalsy();
        expect(watcher.data?.toString()).toBe('');

        expect(watcher.changed).toBeFalsy();
        expect(watcher.data?.toString()).toBe('');

        fs.writeFileSync(filePath, 'value');
        await promise.wait(100);
        expect(fs.readFileSync(filePath).toString()).toBe('value');

        expect(watcher.changed).toBeTruthy();
        expect(watcher.data?.toString()).toBe('value');

        expect(watcher.changed).toBeFalsy();
        expect(watcher.data?.toString()).toBe('value');

        fs.unlinkSync(filePath);
        await promise.wait(100);

        expect(watcher.changed).toBeTruthy();
        expect(watcher.data).toBeNull();

        expect(watcher.changed).toBeFalsy();
        expect(watcher.data).toBeNull();
    });
});
