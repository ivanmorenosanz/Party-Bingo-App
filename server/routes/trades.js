import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb, getFirst, getAll } from '../db.js';

const router = express.Router();

// GET /api/trades/user/:userId
router.get('/user/:userId', (req, res) => {
    try {
        const db = getDb();
        const trades = getAll(db.exec(`
            SELECT t.*, s.description as square_description, b.title as bingo_title 
            FROM trades t
            JOIN bingo_squares s ON t.square_id = s.id
            JOIN bingos b ON s.bingo_id = b.id
            WHERE t.user_id = ?
            ORDER BY t.timestamp DESC
        `, [req.params.userId]));

        res.json(trades);
    } catch (error) {
        console.error('Get trades error:', error);
        res.status(500).json({ error: 'Failed to get trades' });
    }
});

// POST /api/trades
router.post('/', (req, res) => {
    try {
        const db = getDb();
        const { userId, squareId, direction, amount } = req.body;

        if (!userId || !squareId || !direction || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // 1. Check Wallet Balance
        const wallet = getFirst(db.exec('SELECT * FROM wallets WHERE user_id = ?', [userId]));
        if (!wallet || wallet.coins < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // 2. Check Square Status
        const square = getFirst(db.exec('SELECT * FROM bingo_squares WHERE id = ?', [squareId]));
        if (!square || square.status !== 'open') {
            return res.status(400).json({ error: 'Square is not open for trading' });
        }

        // 3. Check Bingo Status and Creator
        const bingo = getFirst(db.exec('SELECT * FROM bingos WHERE id = ?', [square.bingo_id]));
        if (!bingo) {
            return res.status(400).json({ error: 'Market not found' });
        }

        // Prevent creator from trading on their own market
        if (bingo.creator_id === userId) {
            return res.status(403).json({ error: 'You cannot trade on your own market' });
        }

        // Check if market has ended (pending result)
        if (bingo.ends_at && new Date(bingo.ends_at) < new Date()) {
            return res.status(400).json({ error: 'Market has ended. Awaiting result.' });
        }

        // Check if market is closed
        if (bingo.status !== 'open') {
            return res.status(400).json({ error: 'Market is not open for trading' });
        }

        // 3. Deduct Coins
        const newBalance = wallet.coins - amount;
        db.run('UPDATE wallets SET coins = ? WHERE user_id = ?', [newBalance, userId]);

        // 4. Record Transaction (Spend)
        db.run(`INSERT INTO transactions (id, user_id, type, amount, description, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)`, [
            uuidv4(), userId, 'spend', amount, `Trade: ${direction} on ${square.description}`, new Date().toISOString()
        ]);

        // 5. Create Trade Record
        const tradeId = uuidv4();
        db.run(`INSERT INTO trades (id, user_id, square_id, direction, amount, price_at_trade, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            tradeId, userId, squareId, direction, amount, 0.5, new Date().toISOString() // Fixed price 0.5 for MVP
        ]);

        saveDb();

        res.status(201).json({ success: true, tradeId, newBalance });
    } catch (error) {
        console.error('Place trade error:', error);
        res.status(500).json({ error: 'Failed to place trade' });
    }
});

export default router;
