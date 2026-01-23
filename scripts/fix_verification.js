
import { initDb, getDb, saveDb } from '../server/db.js';

async function migrate() {
    await initDb();
    const db = getDb();

    console.log('🔧 Revoking verification for pepe@test.com...');

    try {
        db.run('UPDATE users SET is_verified = 0 WHERE email = ?', ['pepe@test.com']);
        console.log('✅ Revoked verification for pepe@test.com');

        // Ensure Ivan is still verified
        db.run('UPDATE users SET is_verified = 1 WHERE email = ?', ['ivan@test.com']);
        console.log('✅ Confirmed verification for ivan@test.com');

    } catch (e) {
        console.log('⚠️ Error updating user:', e.message);
    }

    saveDb();
}

migrate().catch(console.error);
