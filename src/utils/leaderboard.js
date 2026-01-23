/**
 * Leaderboard Scoring System
 * 
 * Components:
 * - Profit Score (40%): log10(max(P, 1)) normalized
 * - Win Rate Score (35%): WR × 100 (min 10 predictions required)
 * - Activity Score (15%): min(log2(T + 1) × 10, 100)
 * - Streak Bonus (10%): min(S × 2, 20)
 * 
 * Final: ProfitNorm×0.40 + WinRateScore×0.35 + ActivityScore×0.15 + StreakBonus×0.10
 */

// Maximum expected profit for normalization (adjust based on economy)
const MAX_PROFIT_LOG = 5; // log10(100000) = 5

export const calculateProfitScore = (netProfit) => {
    const profitLog = Math.log10(Math.max(netProfit, 1));
    const normalized = (profitLog / MAX_PROFIT_LOG) * 100;
    return Math.min(normalized, 100); // Cap at 100
};

export const calculateWinRateScore = (wins, totalPredictions) => {
    // Minimum 10 predictions required
    if (totalPredictions < 10) return 0;
    const winRate = wins / totalPredictions;
    return winRate * 100;
};

export const calculateActivityScore = (totalPredictions) => {
    const score = Math.log2(totalPredictions + 1) * 10;
    return Math.min(score, 100); // Cap at 100
};

export const calculateStreakBonus = (currentStreak) => {
    return Math.min(currentStreak * 2, 20); // Cap at 20
};

export const calculateLeaderboardScore = (stats) => {
    const { netProfit = 0, wins = 0, losses = 0, currentStreak = 0 } = stats;
    const totalPredictions = wins + losses;

    const profitScore = calculateProfitScore(netProfit);
    const winRateScore = calculateWinRateScore(wins, totalPredictions);
    const activityScore = calculateActivityScore(totalPredictions);
    const streakBonus = calculateStreakBonus(currentStreak);

    const finalScore =
        (profitScore * 0.40) +
        (winRateScore * 0.35) +
        (activityScore * 0.15) +
        (streakBonus * 0.10);

    return {
        score: Math.round(finalScore * 100) / 100,
        breakdown: {
            profitScore: Math.round(profitScore * 100) / 100,
            winRateScore: Math.round(winRateScore * 100) / 100,
            activityScore: Math.round(activityScore * 100) / 100,
            streakBonus: Math.round(streakBonus * 100) / 100,
        },
        stats: {
            netProfit,
            wins,
            losses,
            totalPredictions,
            winRate: totalPredictions > 0 ? Math.round((wins / totalPredictions) * 10000) / 100 : 0,
            currentStreak,
        }
    };
};

export const TIMEFRAMES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    ALL_TIME: 'all_time',
};

export const getRankTier = (rank) => {
    if (rank === 1) return { label: '🥇 Champion', color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (rank === 2) return { label: '🥈 Elite', color: 'text-gray-400', bg: 'bg-gray-50' };
    if (rank === 3) return { label: '🥉 Pro', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (rank <= 10) return { label: '⭐ Top 10', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (rank <= 50) return { label: '🔥 Rising', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { label: 'Competitor', color: 'text-gray-500', bg: 'bg-gray-50' };
};
