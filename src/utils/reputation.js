/**
 * User Reputation System (URS) Utilities
 * 
 * Core Metrics:
 * 1. Accuracy Score (AS) - 70% weight
 *    AS = (correct_trades / total_trades) * 100
 * 
 * 2. Participation Score (PS) - 30% weight
 *    PS = min(100, 20 * log10(resolved_trades + 1))
 * 
 * Combined URS:
 *    URS = 0.7 * AS + 0.3 * PS
 */

export const calculateAS = (correctTrades, totalTrades) => {
    if (!totalTrades || totalTrades === 0) return 0;
    return (correctTrades / totalTrades) * 100;
};

export const calculatePS = (totalTrades) => {
    if (!totalTrades) return 0;
    // Cap at 100, logarithmic growth
    // log10(100) = 2 -> 20 * 2 = 40 (Requires tons of trades to max out, maybe adjust factor later)
    // User formula: 20 * log10(N + 1)
    // To hit 100: log10(N+1) = 5 -> N = 99,999 (This seems high for MVP, but sticking to user formula)
    return Math.min(100, 20 * Math.log10(totalTrades + 1));
};

export const calculateURS = (metrics) => {
    const { correctTrades = 0, totalTrades = 0, resolvedTrades = 0 } = metrics || {};

    // Use resolved trades for accuracy, not just placed trades (totalTrades usually implies resolved attempts for accuracy)
    // Assuming 'total_trades' in AS context means 'total resolved trades' where outcome is known.
    // Ideally AS = correct / resolved.
    const tradesForAccuracy = resolvedTrades > 0 ? resolvedTrades : 1;

    const AS = (correctTrades / tradesForAccuracy) * 100;
    const PS = calculatePS(totalTrades);

    // If no trades yet, URS is 0
    if (totalTrades === 0) return 0;

    return Math.round((0.7 * AS) + (0.3 * PS));
};

export const getURSTier = (urs) => {
    if (urs >= 80) return { label: 'Top Player', color: 'text-yellow-500', icon: '👑' };
    if (urs >= 60) return { label: 'Active / Skilled', color: 'text-blue-500', icon: '⭐' };
    return { label: 'Casual', color: 'text-gray-500', icon: '🌱' };
};

export const formatScore = (score) => {
    return Math.round(score);
};
