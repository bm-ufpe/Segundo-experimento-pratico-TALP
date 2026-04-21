import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');

function filePath(name: string): string {
    return path.join(DATA_DIR, `${name}.json`);
}

export function readDb<T>(name: string): T[] {
    const fp = filePath(name);
    if (!fs.existsSync(fp)) return [];
    const raw = fs.readFileSync(fp, 'utf-8');
    try {
        return JSON.parse(raw) as T[];
    } catch {
        const backup = `${fp}.corrupt`;
        fs.renameSync(fp, backup);
        console.error(`[db] corrupt JSON in ${name}.json — moved to ${name}.json.corrupt, starting empty`);
        return [];
    }
}

export function writeDb<T>(name: string, data: T[]): void {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf-8');
}
