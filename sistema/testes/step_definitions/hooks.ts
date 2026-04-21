import { Before } from '@cucumber/cucumber';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../backend/data');

// Limpa todos os arquivos JSON antes de cada cenário
Before(() => {
    if (!fs.existsSync(DATA_DIR)) return;
    for (const file of fs.readdirSync(DATA_DIR)) {
        if (file.endsWith('.json')) {
            fs.writeFileSync(path.join(DATA_DIR, file), '[]', 'utf-8');
        }
    }
});
