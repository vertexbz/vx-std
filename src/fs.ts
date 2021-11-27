import fs from 'fs';
import os from 'os';
import path from 'path';

export function tempFileSync(name = 'tmp', data = ''): string {
    const tempPath = path.join(os.tmpdir(), 'temp-');
    const dirPath = fs.mkdtempSync(tempPath);
    const filePath = path.join(dirPath, name);
    fs.writeFileSync(filePath, data);

    return filePath;
}
