
import { initDb, getDb, saveDb } from '../server/db.js';

async function migrate() {
    await initDb();
    const db = getDb();

    console.log('🔧 Running migration to add current_price column...');

    try {
        db.run('ALTER TABLE bingo_squares ADD COLUMN current_price REAL DEFAULT 0.5');
        console.log('✅ Column added successfully');
    } catch (e) {
        if (e.message && e.message.includes('duplicate column')) {
            console.log('ℹ️ Column already exists');
        } else {
            console.log('⚠️ Error adding column (might exist):', e.message);
        }
    }

    saveDb();
}

migrate().catch(console.error);
