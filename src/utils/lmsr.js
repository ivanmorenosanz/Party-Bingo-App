/**
 * LMSR (Logarithmic Market Scoring Rule) Market Maker
 * 
 * Used for prediction market pricing on bingo squares.
 * Each square is a binary YES/NO market.
 * 
 * Key formulas:
 * - Cost function: C(q) = b * ln(e^(q_yes/b) + e^(q_no/b))
 * - Price YES: P_yes = e^(q_yes/b) / (e^(q_yes/b) + e^(q_no/b))
 * - Trade cost: cost = C(q_after) - C(q_before)
 */

// Default liquidity parameter (higher = slower price movement)
export const DEFAULT_LIQUIDITY = 100;

// Correlation factor for derived markets
export const CORRELATION_FACTOR = 1.2;

/**
 * Calculate the LMSR cost function
 */
export const lmsrCost = (yesShares, noShares, liquidity = DEFAULT_LIQUIDITY) => {
    const b = liquidity;
    return b * Math.log(Math.exp(yesShares / b) + Math.exp(noShares / b));
};

/**
 * Calculate current YES probability (price)
 */
export const getYesPrice = (yesShares, noShares, liquidity = DEFAULT_LIQUIDITY) => {
    const b = liquidity;
    const expYes = Math.exp(yesShares / b);
    const expNo = Math.exp(noShares / b);
    return expYes / (expYes + expNo);
};

/**
 * Calculate current NO probability (price)
 */
export const getNoPrice = (yesShares, noShares, liquidity = DEFAULT_LIQUIDITY) => {
    return 1 - getYesPrice(yesShares, noShares, liquidity);
};

/**
 * Calculate cost to buy shares
 * @param {number} yesShares - Current YES shares
 * @param {number} noShares - Current NO shares
 * @param {string} direction - 'YES' or 'NO'
 * @param {number} shares - Number of shares to buy
 * @param {number} liquidity - Liquidity parameter
 * @returns {number} Cost in coins
 */
export const calculateBuyCost = (yesShares, noShares, direction, shares, liquidity = DEFAULT_LIQUIDITY) => {
    const costBefore = lmsrCost(yesShares, noShares, liquidity);

    let costAfter;
    if (direction === 'YES') {
        costAfter = lmsrCost(yesShares + shares, noShares, liquidity);
    } else {
        costAfter = lmsrCost(yesShares, noShares + shares, liquidity);
    }

    return Math.ceil(costAfter - costBefore); // Round up for safety
};

/**
 * Calculate payout if prediction is correct
 * @param {number} shares - Shares held
 * @returns {number} Payout (1 coin per share if correct)
 */
export const calculatePayout = (shares) => {
    return shares; // Each share pays 1 coin if correct
};

/**
 * Calculate line probability (product of square probabilities)
 * @param {number[]} squarePrices - Array of 3 YES prices
 * @param {number} correlationFactor - Boost for correlated outcomes
 */
export const calculateLineProbability = (squarePrices, correlationFactor = CORRELATION_FACTOR) => {
    if (squarePrices.length !== 3) return 0;
    const baseProb = squarePrices.reduce((acc, p) => acc * p, 1);
    return Math.min(baseProb * correlationFactor, 0.99); // Cap at 99%
};

/**
 * Calculate blackout probability (all 9 squares YES)
 * @param {number[]} squarePrices - Array of 9 YES prices
 * @param {number} correlationFactor - Boost for correlated outcomes
 */
export const calculateBlackoutProbability = (squarePrices, correlationFactor = CORRELATION_FACTOR) => {
    if (squarePrices.length !== 9) return 0;
    const baseProb = squarePrices.reduce((acc, p) => acc * p, 1);
    // Apply stronger correlation for blackout (more correlated)
    const adjustedCorrelation = Math.pow(correlationFactor, 3);
    return Math.min(baseProb * adjustedCorrelation, 0.5); // Cap at 50%
};

/**
 * Get all 8 possible bingo lines for a 3x3 grid
 * Returns indices for each line
 */
export const getBingoLines = () => [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Col 1
    [1, 4, 7], // Col 2
    [2, 5, 8], // Col 3
    [0, 4, 8], // Diagonal 1
    [2, 4, 6], // Diagonal 2
];

/**
 * Calculate all derived market probabilities
 * @param {object[]} squares - Array of 9 squares with currentPrice
 */
export const calculateDerivedMarkets = (squares) => {
    if (!squares || squares.length !== 9) {
        return { lines: [], blackout: 0 };
    }

    const prices = squares.map(s => s.current_price || 0.5);
    const lines = getBingoLines();

    const lineProbs = lines.map((lineIndices, i) => {
        const linePrices = lineIndices.map(idx => prices[idx]);
        return {
            index: i,
            squares: lineIndices,
            probability: calculateLineProbability(linePrices),
            type: i < 3 ? 'row' : i < 6 ? 'column' : 'diagonal',
        };
    });

    const blackoutProb = calculateBlackoutProbability(prices);

    return {
        lines: lineProbs,
        blackout: blackoutProb,
    };
};

/**
 * Format probability as percentage
 */
export const formatProbability = (prob) => {
    return `${Math.round(prob * 100)}%`;
};
