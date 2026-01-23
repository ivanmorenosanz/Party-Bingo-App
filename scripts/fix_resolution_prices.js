
import { initDb, getDb, saveDb } from '../server/db.js';

async function run() {
    await initDb();
    const db = getDb();

    console.log('🔧 Fixing prices for tv_show_bets...');

    // Set all squares in tv_show_bets to 1.0 price (since we resolved as All Yes)
    // and ensure status is settled.
    db.run(`UPDATE bingo_squares 
            SET current_price = 1.0, status = 'settled', resolved_outcome = 1 
            WHERE bingo_id = 'tv_show_bets'`);

    console.log('✅ Prices updated to 1.0 for tv_show_bets');
    saveDb();
}

run().catch(console.error);
