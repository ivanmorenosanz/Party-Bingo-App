
import { initDb, getDb, saveDb, getFirst } from '../server/db.js';

async function migrate() {
    await initDb();
    const db = getDb();

    console.log('🔧 Running verified creator migration...');

    // Add currency column to bingos
    try {
        db.run('ALTER TABLE bingos ADD COLUMN currency TEXT DEFAULT \'coins\'');
        console.log('✅ Added currency column');
    } catch (e) {
        console.log('ℹ️ currency column might exist:', e.message);
    }

    // Add ends_at column to bingos
    try {
        db.run('ALTER TABLE bingos ADD COLUMN ends_at TEXT DEFAULT NULL');
        console.log('✅ Added ends_at column');
    } catch (e) {
        console.log('ℹ️ ends_at column might exist:', e.message);
    }

    // Add tags column to bingos
    try {
        db.run('ALTER TABLE bingos ADD COLUMN tags TEXT DEFAULT \'[]\'');
        console.log('✅ Added tags column');
    } catch (e) {
        console.log('ℹ️ tags column might exist:', e.message);
    }

    // Add cash column to wallets
    try {
        db.run('ALTER TABLE wallets ADD COLUMN cash REAL DEFAULT 0');
        console.log('✅ Added cash column to wallets');
    } catch (e) {
        console.log('ℹ️ cash column might exist:', e.message);
    }

    // Set ivan@test.com as verified creator
    try {
        const user = getFirst(db.exec('SELECT * FROM users WHERE email = ?', ['ivan@test.com']));
        if (user) {
            db.run('UPDATE users SET is_verified = 1 WHERE email = ?', ['ivan@test.com']);
            console.log('✅ Set ivan@test.com as verified creator');
        } else {
            console.log('⚠️ ivan@test.com not found in database');
        }
    } catch (e) {
        console.log('⚠️ Error updating verified status:', e.message);
    }

    saveDb();
    console.log('✅ Migration complete!');
}

migrate().catch(console.error);
