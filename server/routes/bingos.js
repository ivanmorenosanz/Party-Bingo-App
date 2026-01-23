import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb, getFirst, getAll } from '../db.js';

const router = express.Router();

// GET /api/bingos
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const bingos = getAll(db.exec('SELECT * FROM bingos ORDER BY created_at DESC'));

        // Fetch squares for each bingo
        const result = bingos.map(bingo => {
            const squares = getAll(db.exec('SELECT * FROM bingo_squares WHERE bingo_id = ? ORDER BY position ASC', [bingo.id]));
            return { ...bingo, squares };
        });

        res.json(result);
    } catch (error) {
        console.error('Get bingos error:', error);
        res.status(500).json({ error: 'Failed to get bingos' });
    }
});

// GET /api/bingos/:id
router.get('/:id', (req, res) => {
    try {
        const db = getDb();
        const bingo = getFirst(db.exec('SELECT * FROM bingos WHERE id = ?', [req.params.id]));
        if (!bingo) return res.status(404).json({ error: 'Bingo not found' });

        const squares = getAll(db.exec('SELECT * FROM bingo_squares WHERE bingo_id = ? ORDER BY position ASC', [bingo.id]));
        res.json({ ...bingo, squares });
    } catch (error) {
        console.error('Get bingo error:', error);
        res.status(500).json({ error: 'Failed to get bingo' });
    }
});

// POST /api/bingos
router.post('/', (req, res) => {
    try {
        const db = getDb();
        const { title, category, creatorId, squares } = req.body;

        if (!title || !creatorId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const bingoId = uuidv4();
        const now = new Date().toISOString();

        db.run(`INSERT INTO bingos (id, title, category, creator_id, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)`, [
            bingoId, title, category, creatorId, 'open', now
        ]);

        if (squares && Array.isArray(squares)) {
            squares.forEach((sq, index) => {
                db.run(`INSERT INTO bingo_squares (id, bingo_id, description, initial_probability, position)
                        VALUES (?, ?, ?, ?, ?)`, [
                    uuidv4(), bingoId, sq.description, sq.initialProbability || 0.5, index
                ]);
            });
        }

        saveDb();
        res.status(201).json({ id: bingoId, success: true });
    } catch (error) {
        console.error('Create bingo error:', error);
        res.status(500).json({ error: 'Failed to create bingo' });
    }
});

// POST /api/bingos/:id/resolve (Admin/Dev)
// In a real app, this would be protected
router.post('/:id/resolve', (req, res) => {
    // TODO: Implement resolution logic
    // 1. Update square status and resolved_outcome
    // 2. Find all trades for this square
    // 3. For each trade:
    //    - Mark as resolved
    //    - Calculate Payout
    //    - Update User Wallet (if win)
    //    - Update User URS Stats (Correct/Total)
    res.json({ message: 'Resolution logic pending implementation' });
});

export default router;
