import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, 'bingo.db');

let db = null;

// Initialize database
export async function initDb() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT,
            avatar TEXT DEFAULT '{"character":"warrior","frame":"default","background":"purple","badge":null,"effect":null}',
            owned_cosmetics TEXT DEFAULT '["default","purple","warrior","mage"]',
            rewards TEXT DEFAULT '[]',
            stats TEXT DEFAULT '{"gamesPlayed":0,"gamesWon":0,"totalBingos":0,"currentStreak":0,"bestStreak":0}',
            leagues TEXT DEFAULT '[]',
            is_guest INTEGER DEFAULT 0,
            is_verified INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS wallets (
            user_id TEXT PRIMARY KEY,
            coins INTEGER DEFAULT 100
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            amount INTEGER NOT NULL,
            description TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            expires_at TEXT
        )
    `);

  saveDb();
  return db;
}

// Save database to file
export function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Get database instance
export function getDb() {
  return db;
}

// Helper function to parse JSON fields from database
export function parseUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatar: JSON.parse(row.avatar || '{}'),
    ownedCosmetics: JSON.parse(row.owned_cosmetics || '[]'),
    rewards: JSON.parse(row.rewards || '[]'),
    stats: JSON.parse(row.stats || '{}'),
    leagues: JSON.parse(row.leagues || '[]'),
    isGuest: Boolean(row.is_guest),
    isVerified: Boolean(row.is_verified),
    createdAt: row.created_at,
  };
}

// Convert result to object
function rowToObject(columns, values) {
  if (!values) return null;
  const obj = {};
  columns.forEach((col, i) => {
    obj[col] = values[i];
  });
  return obj;
}

// Query helpers
export function getFirst(result) {
  if (result.length === 0 || result[0].values.length === 0) return null;
  return rowToObject(result[0].columns, result[0].values[0]);
}

export function getAll(result) {
  if (result.length === 0) return [];
  return result[0].values.map(row => rowToObject(result[0].columns, row));
}
