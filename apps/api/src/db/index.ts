import { Database } from 'bun:sqlite';
import * as fs from 'fs';
import * as path from 'path';

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    const dbPath = path.join(__dirname, '..', '..', 'photostudio.db');
    db = new Database(dbPath, { create: true });
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}

export function initDb(): void {
  const database = getDb();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  database.run(schema);
}

export default getDb;
