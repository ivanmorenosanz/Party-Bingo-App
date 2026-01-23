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
            stats TEXT DEFAULT '{"gamesPlayed":0,"gamesWon":0,"totalBingos":0,"currentStreak":0,"bestStreak":0,"urs":{"correctTrades":0,"totalTrades":0,"resolvedTrades":0}}',
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
        CREATE TABLE IF NOT EXISTS bingos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT,
            creator_id TEXT,
            status TEXT DEFAULT 'open',
            resolution_time TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS bingo_squares (
            id TEXT PRIMARY KEY,
            bingo_id TEXT NOT NULL,
            description TEXT NOT NULL,
            outcome_type TEXT DEFAULT 'boolean',
            initial_probability REAL DEFAULT 0.5,
            status TEXT DEFAULT 'open',
            resolved_outcome INTEGER DEFAULT NULL,
            position INTEGER,
            yes_shares REAL DEFAULT 0,
            no_shares REAL DEFAULT 0,
            liquidity REAL DEFAULT 100,
            current_price REAL DEFAULT 0.5
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS trades (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            square_id TEXT NOT NULL,
            direction TEXT NOT NULL,
            amount INTEGER NOT NULL,
            price_at_trade REAL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            resolved INTEGER DEFAULT 0,
            payout INTEGER DEFAULT NULL
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS leaderboard (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            username TEXT,
            timeframe TEXT NOT NULL,
            score REAL DEFAULT 0,
            rank INTEGER DEFAULT 0,
            net_profit INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            total_predictions INTEGER DEFAULT 0,
            win_rate REAL DEFAULT 0,
            current_streak INTEGER DEFAULT 0,
            last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, timeframe)
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
