import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
const dbPath = join(__dirname, '..', 'db.json');

function readDB() {
  const data = readFileSync(dbPath);
  return JSON.parse(data);
}

function writeDB(data) {
  writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export default { readDB, writeDB };
