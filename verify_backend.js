
import { initDb, getDb, parseUserRow, getFirst, getAll } from './server/db.js';
import { v4 as uuidv4 } from 'uuid';

async function runVerification() {
    console.log('🧪 Starting Verification...');

    // 1. Init DB
    await initDb();
    const db = getDb();
    console.log('✅ DB Initialized');

    // 2. Create User
    const userId = uuidv4();
    db.run(`INSERT INTO users (id, username, email, is_verified) VALUES (?, ?, ?, 1)`, [userId, 'test_user', 'test@example.com']);
    db.run(`INSERT INTO wallets (user_id, coins) VALUES (?, 1000)`, [userId]);
    console.log('✅ User created');

    // 3. Create Bingo
    const bingoId = uuidv4();
    db.run(`INSERT INTO bingos (id, title, category, creator_id) VALUES (?, ?, ?, ?)`,
        [bingoId, 'Test Bingo', 'Testing', userId]);

    // 4. Create Square
    const squareId = uuidv4();
    db.run(`INSERT INTO bingo_squares (id, bingo_id, description, initial_probability, status) VALUES (?, ?, ?, ?, ?)`,
        [squareId, bingoId, 'Test Square', 0.5, 'open']);
    console.log('✅ Bingo & Square created');

    // 5. Place Trade Logic (Simulating route handler logic)
    // Check wallet
    const wallet = getFirst(db.exec('SELECT * FROM wallets WHERE user_id = ?', [userId]));
    const amount = 50;

    if (wallet.coins >= amount) {
        // Deduct
        db.run('UPDATE wallets SET coins = ? WHERE user_id = ?', [wallet.coins - amount, userId]);

        // Record Trade
        const tradeId = uuidv4();
        db.run(`INSERT INTO trades (id, user_id, square_id, direction, amount, price_at_trade) VALUES (?, ?, ?, ?, ?, ?)`,
            [tradeId, userId, squareId, 'YES', amount, 0.5]);

        console.log('✅ Trade placed successfully');

        // Verify Trade exists
        const trade = getFirst(db.exec('SELECT * FROM trades WHERE id = ?', [tradeId]));
        if (trade && trade.amount === 50) {
            console.log('✅ Trade verified in DB');
        } else {
            console.error('❌ Trade verification failed');
        }

    } else {
        console.error('❌ Insufficient funds for test');
    }

    console.log('🎉 Verification Complete');
}

runVerification().catch(console.error);
