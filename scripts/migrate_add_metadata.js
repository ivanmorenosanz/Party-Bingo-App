
import { initDb, getDb, saveDb } from '../server/db.js';

async function migrate() {
    await initDb();
    const db = getDb();

    console.log('🔧 Running migration to add metadata column to transactions...');

    try {
        db.run('ALTER TABLE transactions ADD COLUMN metadata TEXT DEFAULT NULL');
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
