import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb, getFirst, getAll, parseUserRow } from '../db.js';

const router = express.Router();

// Scoring functions (server-side version)
const MAX_PROFIT_LOG = 5;

const calculateProfitScore = (netProfit) => {
    const profitLog = Math.log10(Math.max(netProfit, 1));
    return Math.min((profitLog / MAX_PROFIT_LOG) * 100, 100);
};

const calculateWinRateScore = (wins, total) => {
    if (total < 10) return 0;
    return (wins / total) * 100;
};

const calculateActivityScore = (total) => {
    return Math.min(Math.log2(total + 1) * 10, 100);
};

const calculateStreakBonus = (streak) => {
    return Math.min(streak * 2, 20);
};

const calculateScore = (stats) => {
    const { netProfit = 0, wins = 0, losses = 0, currentStreak = 0 } = stats;
    const total = wins + losses;

    return (
        (calculateProfitScore(netProfit) * 0.40) +
        (calculateWinRateScore(wins, total) * 0.35) +
        (calculateActivityScore(total) * 0.15) +
        (calculateStreakBonus(currentStreak) * 0.10)
    );
};

// GET /api/leaderboard?timeframe=weekly
router.get('/', (req, res) => {
    try {
        const db = getDb();
        const timeframe = req.query.timeframe || 'weekly';

        const entries = getAll(db.exec(
            `SELECT * FROM leaderboard WHERE timeframe = ? ORDER BY score DESC, win_rate DESC, net_profit DESC LIMIT 50`,
            [timeframe]
        ));

        res.json({
            timeframe,
            entries: entries.map((e, index) => ({
                rank: index + 1,
                userId: e.user_id,
                username: e.username,
                score: Math.round(e.score * 100) / 100,
                netProfit: e.net_profit,
                wins: e.wins,
                losses: e.losses,
                totalPredictions: e.total_predictions,
                winRate: e.win_rate,
                currentStreak: e.current_streak,
            }))
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

// GET /api/leaderboard/user/:userId
router.get('/user/:userId', (req, res) => {
    try {
        const db = getDb();
        const timeframe = req.query.timeframe || 'weekly';

        const entry = getFirst(db.exec(
            `SELECT * FROM leaderboard WHERE user_id = ? AND timeframe = ?`,
            [req.params.userId, timeframe]
        ));

        if (!entry) {
            return res.json({ rank: null, entry: null });
        }

        // Get rank
        const rankResult = getFirst(db.exec(
            `SELECT COUNT(*) as rank FROM leaderboard WHERE timeframe = ? AND score > ?`,
            [timeframe, entry.score]
        ));

        const rank = (rankResult?.rank || 0) + 1;

        res.json({
            rank,
            entry: {
                userId: entry.user_id,
                username: entry.username,
                score: Math.round(entry.score * 100) / 100,
                netProfit: entry.net_profit,
                wins: entry.wins,
                losses: entry.losses,
                totalPredictions: entry.total_predictions,
                winRate: entry.win_rate,
                currentStreak: entry.current_streak,
            }
        });
    } catch (error) {
        console.error('Get user leaderboard error:', error);
        res.status(500).json({ error: 'Failed to get user leaderboard' });
    }
});

// POST /api/leaderboard/refresh (Admin/Dev - recalculate all scores)
router.post('/refresh', (req, res) => {
    try {
        const db = getDb();
        const timeframe = req.body.timeframe || 'weekly';

        // Get all users
        const users = getAll(db.exec('SELECT * FROM users'));

        users.forEach(userRow => {
            const user = parseUserRow(userRow);

            // Get user's resolved trades for this timeframe
            // For MVP, we use all-time stats from user.stats.urs
            const ursStats = user.stats?.urs || { correctTrades: 0, totalTrades: 0, resolvedTrades: 0 };

            // Calculate mock stats (in production, calculate from actual trades with timeframe filter)
            const stats = {
                netProfit: (ursStats.correctTrades || 0) * 50, // Assume 50 coins per win
                wins: ursStats.correctTrades || 0,
                losses: (ursStats.resolvedTrades || 0) - (ursStats.correctTrades || 0),
                currentStreak: user.stats?.currentStreak || 0,
            };

            const score = calculateScore(stats);
            const winRate = stats.wins + stats.losses > 0
                ? (stats.wins / (stats.wins + stats.losses)) * 100
                : 0;

            // Upsert leaderboard entry
            db.run(`
                INSERT INTO leaderboard (id, user_id, username, timeframe, score, net_profit, wins, losses, total_predictions, win_rate, current_streak, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, timeframe) DO UPDATE SET
                    username = excluded.username,
                    score = excluded.score,
                    net_profit = excluded.net_profit,
                    wins = excluded.wins,
                    losses = excluded.losses,
                    total_predictions = excluded.total_predictions,
                    win_rate = excluded.win_rate,
                    current_streak = excluded.current_streak,
                    last_updated = excluded.last_updated
            `, [
                uuidv4(),
                user.id,
                user.username,
                timeframe,
                score,
                stats.netProfit,
                stats.wins,
                stats.losses,
                stats.wins + stats.losses,
                winRate,
                stats.currentStreak,
                new Date().toISOString()
            ]);
        });

        saveDb();
        res.json({ success: true, message: `Refreshed ${users.length} entries for ${timeframe}` });
    } catch (error) {
        console.error('Refresh leaderboard error:', error);
        res.status(500).json({ error: 'Failed to refresh leaderboard' });
    }
});

export default router;
