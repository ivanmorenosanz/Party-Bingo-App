import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb, getFirst, getAll } from '../db.js';

const router = express.Router();

// LMSR Constants
const DEFAULT_LIQUIDITY = 100;
const CORRELATION_FACTOR = 1.2;
const PAYOUT_PER_SHARE = 100;

// LMSR Functions
const lmsrCost = (yesShares, noShares, liquidity = DEFAULT_LIQUIDITY) => {
    const b = liquidity;
    return b * Math.log(Math.exp(yesShares / b) + Math.exp(noShares / b));
};

const getYesPrice = (yesShares, noShares, liquidity = DEFAULT_LIQUIDITY) => {
    const b = liquidity;
    const expYes = Math.exp(yesShares / b);
    const expNo = Math.exp(noShares / b);
    return expYes / (expYes + expNo);
};

const calculateBuyCost = (yesShares, noShares, direction, shares, liquidity = DEFAULT_LIQUIDITY) => {
    const costBefore = lmsrCost(yesShares, noShares, liquidity);
    let costAfter;
    if (direction === 'YES') {
        costAfter = lmsrCost(yesShares + shares, noShares, liquidity);
    } else {
        costAfter = lmsrCost(yesShares, noShares + shares, liquidity);
    }
    return costAfter - costBefore;
};

const getBingoLines = () => [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6], // Diagonals
];

// GET /api/markets/:bingoId - Get market state for a bingo
router.get('/:bingoId', (req, res) => {
    try {
        const db = getDb();
        const squares = getAll(db.exec(
            'SELECT * FROM bingo_squares WHERE bingo_id = ? ORDER BY position ASC',
            [req.params.bingoId]
        ));

        if (squares.length === 0) {
            return res.status(404).json({ error: 'No squares found' });
        }

        // Calculate derived probabilities
        const prices = squares.map(s => s.current_price || 0.5);
        const lines = getBingoLines().map((indices, i) => {
            const linePrices = indices.map(idx => prices[idx] || 0.5);
            const prob = linePrices.reduce((acc, p) => acc * p, 1) * CORRELATION_FACTOR;
            return {
                index: i,
                squares: indices,
                probability: Math.min(prob, 0.99),
                type: i < 3 ? 'row' : i < 6 ? 'column' : 'diagonal',
            };
        });

        const blackoutProb = prices.reduce((acc, p) => acc * p, 1) * Math.pow(CORRELATION_FACTOR, 3);

        res.json({
            squares: squares.map(s => ({
                id: s.id,
                position: s.position,
                description: s.description,
                status: s.status,
                yesPrice: s.current_price || 0.5,
                noPrice: 1 - (s.current_price || 0.5),
                yesShares: s.yes_shares || 0,
                noShares: s.no_shares || 0,
                resolvedOutcome: s.resolved_outcome,
            })),
            derived: {
                lines,
                blackout: Math.min(blackoutProb, 0.5),
            }
        });
    } catch (error) {
        console.error('Get markets error:', error);
        res.status(500).json({ error: 'Failed to get markets' });
    }
});

// POST /api/markets/:squareId/trade - Buy shares
router.post('/:squareId/trade', (req, res) => {
    try {
        const db = getDb();
        const { userId, direction, shares } = req.body;

        if (!userId || !direction || !shares || shares <= 0) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        if (direction !== 'YES' && direction !== 'NO') {
            return res.status(400).json({ error: 'Direction must be YES or NO' });
        }

        // Get square
        const square = getFirst(db.exec('SELECT * FROM bingo_squares WHERE id = ?', [req.params.squareId]));
        if (!square) {
            return res.status(404).json({ error: 'Square not found' });
        }

        if (square.status !== 'open') {
            return res.status(400).json({ error: 'Market is closed' });
        }

        const yesShares = square.yes_shares || 0;
        const noShares = square.no_shares || 0;
        const liquidity = square.liquidity || DEFAULT_LIQUIDITY;

        // Calculate cost
        const rawCost = calculateBuyCost(yesShares, noShares, direction, shares, liquidity);
        const cost = Math.ceil(rawCost * PAYOUT_PER_SHARE);

        // Check wallet
        const wallet = getFirst(db.exec('SELECT * FROM wallets WHERE user_id = ?', [userId]));
        const walletCoins = wallet ? Number(wallet.coins) : 0;

        console.log(`Trade check: User ${userId} has ${walletCoins} coins. Cost is ${cost}. Result: ${walletCoins < cost}`);

        if (!wallet || walletCoins < cost) {
            return res.status(400).json({ error: 'Insufficient funds', cost, balance: walletCoins });
        }

        // Deduct coins
        db.run('UPDATE wallets SET coins = ? WHERE user_id = ?', [wallet.coins - cost, userId]);

        // Update shares
        const newYesShares = direction === 'YES' ? yesShares + shares : yesShares;
        const newNoShares = direction === 'NO' ? noShares + shares : noShares;
        const newPrice = getYesPrice(newYesShares, newNoShares, liquidity);

        db.run(`UPDATE bingo_squares SET yes_shares = ?, no_shares = ?, current_price = ? WHERE id = ?`,
            [newYesShares, newNoShares, newPrice, req.params.squareId]);

        // Record trade
        const tradeId = uuidv4();
        db.run(`INSERT INTO trades (id, user_id, square_id, direction, amount, price_at_trade, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            tradeId, userId, req.params.squareId, direction, shares, newPrice, new Date().toISOString()
        ]);

        // Record transaction
        const metadata = JSON.stringify({ bingoId: req.params.bingoId || 'unknown' }); // Wait, square trade doesn't have bingoId in params? 
        // We need to look it up from the square or params. 
        // The API route is POST /api/markets/:squareId/trade
        // squareId is unique. We fetched 'square' earlier. `square.bingo_id` exists.

        const txMetadata = JSON.stringify({ bingoId: square.bingo_id });

        db.run(`INSERT INTO transactions (id, user_id, type, amount, description, timestamp, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            uuidv4(), userId, 'spend', cost, `${direction} ${shares} shares @ ${Math.round(newPrice * 100)}% on ${square.description}`, new Date().toISOString(), txMetadata
        ]);

        saveDb();

        res.json({
            success: true,
            tradeId,
            cost,
            newBalance: wallet.coins - cost,
            newPrice,
            shares,
        });
    } catch (error) {
        console.error('Trade error:', error);
        res.status(500).json({ error: 'Failed to execute trade' });
    }
});

// GET /api/markets/:squareId/price - Get current price quote
router.get('/:squareId/price', (req, res) => {
    try {
        const db = getDb();
        const shares = parseInt(req.query.shares) || 1;
        const direction = req.query.direction || 'YES';

        const square = getFirst(db.exec('SELECT * FROM bingo_squares WHERE id = ?', [req.params.squareId]));
        if (!square) {
            return res.status(404).json({ error: 'Square not found' });
        }

        const yesShares = square.yes_shares || 0;
        const noShares = square.no_shares || 0;
        const liquidity = square.liquidity || DEFAULT_LIQUIDITY;

        const rawCost = calculateBuyCost(yesShares, noShares, direction, shares, liquidity);
        const cost = Math.ceil(rawCost * PAYOUT_PER_SHARE);
        const currentPrice = getYesPrice(yesShares, noShares, liquidity);

        res.json({
            currentPrice,
            direction,
            shares,
            cost,
            pricePerShare: cost / shares,
        });
    } catch (error) {
        console.error('Get price error:', error);
        res.status(500).json({ error: 'Failed to get price' });
    }
});

export default router;
