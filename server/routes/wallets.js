import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb, getFirst, getAll } from '../db.js';

const router = express.Router();

// GET /api/wallets/:userId
router.get('/:userId', (req, res) => {
    try {
        const db = getDb();
        const wallet = getFirst(db.exec('SELECT * FROM wallets WHERE user_id = ?', [req.params.userId]));
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const transactions = getAll(db.exec(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 100',
            [req.params.userId]
        ));

        res.json({
            coins: wallet.coins,
            transactions: transactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                description: t.description,
                timestamp: t.timestamp,
            })),
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({ error: 'Failed to get wallet' });
    }
});

// POST /api/wallets/:userId/earn
router.post('/:userId/earn', (req, res) => {
    try {
        const db = getDb();
        const { amount, reason } = req.body;
        const userId = req.params.userId;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const wallet = getFirst(db.exec('SELECT * FROM wallets WHERE user_id = ?', [userId]));
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const newBalance = wallet.coins + amount;
        db.run('UPDATE wallets SET coins = ? WHERE user_id = ?', [newBalance, userId]);

        // Record transaction
        db.run(`INSERT INTO transactions (id, user_id, type, amount, description, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)`, [
            uuidv4(),
            userId,
            'earn',
            amount,
            reason || 'Reward',
            new Date().toISOString()
        ]);

        saveDb();
        res.json({ coins: newBalance, success: true });
    } catch (error) {
        console.error('Earn coins error:', error);
        res.status(500).json({ error: 'Failed to add coins' });
    }
});

// POST /api/wallets/:userId/spend
router.post('/:userId/spend', (req, res) => {
    try {
        const db = getDb();
        const { amount, reason } = req.body;
        const userId = req.params.userId;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const wallet = getFirst(db.exec('SELECT * FROM wallets WHERE user_id = ?', [userId]));
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        if (wallet.coins < amount) {
            return res.status(400).json({ error: 'Insufficient coins', success: false });
        }

        const newBalance = wallet.coins - amount;
        db.run('UPDATE wallets SET coins = ? WHERE user_id = ?', [newBalance, userId]);

        // Record transaction
        db.run(`INSERT INTO transactions (id, user_id, type, amount, description, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)`, [
            uuidv4(),
            userId,
            'spend',
            amount,
            reason || 'Purchase',
            new Date().toISOString()
        ]);

        saveDb();
        res.json({ coins: newBalance, success: true });
    } catch (error) {
        console.error('Spend coins error:', error);
        res.status(500).json({ error: 'Failed to spend coins' });
    }
});

export default router;
