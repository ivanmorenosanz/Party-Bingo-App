import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';

const PositionsContext = createContext(null);

export function PositionsProvider({ children }) {
    const { user } = useAuth();
    const { earnCoins } = useWallet();
    const [positions, setPositions] = useState([]);

    // Load positions from localStorage
    useEffect(() => {
        if (user?.id) {
            const saved = localStorage.getItem(`positions_${user.id}`);
            if (saved) {
                setPositions(JSON.parse(saved));
            }
        }
    }, [user?.id]);

    // Save to localStorage when positions change
    useEffect(() => {
        if (user?.id && positions.length > 0) {
            localStorage.setItem(`positions_${user.id}`, JSON.stringify(positions));
        }
    }, [positions, user?.id]);

    // Add a new position
    const addPosition = (bingoId, squareId, squareDescription, direction, shares, cost, bingoTitle) => {
        const newPosition = {
            id: `${Date.now()}`,
            bingoId,
            bingoTitle,
            squareId,
            squareDescription,
            direction, // 'YES' or 'NO'
            shares,
            cost,
            purchasePrice: cost / shares,
            timestamp: new Date().toISOString(),
        };

        setPositions(prev => {
            // Check if position already exists for same square/direction
            const existingIndex = prev.findIndex(
                p => p.squareId === squareId && p.direction === direction
            );

            if (existingIndex >= 0) {
                // Merge positions
                const existing = prev[existingIndex];
                const merged = {
                    ...existing,
                    shares: existing.shares + shares,
                    cost: existing.cost + cost,
                    purchasePrice: (existing.cost + cost) / (existing.shares + shares),
                    timestamp: new Date().toISOString(),
                };
                const updated = [...prev];
                updated[existingIndex] = merged;
                return updated;
            }

            return [newPosition, ...prev];
        });
    };

    // Payout Logic
    const claimPayouts = (bingoId, results, marketData) => {
        // Find positions for this bingo (active OR wrongly settled as loss)
        const relevantPositions = positions.filter(p => p.bingoId === bingoId);

        if (relevantPositions.length === 0) return { claimed: 0, amount: 0 };

        let totalNewPayout = 0;
        let claimedCount = 0;
        const updates = new Map();

        relevantPositions.forEach(pos => {
            let isWinner = false;

            // Determine if winner based on pos type
            if (pos.squareId.includes('_sq_')) {
                // Square
                const index = parseInt(pos.squareId.split('_sq_')[1]);
                const result = results[index]; // boolean
                isWinner = (pos.direction === 'YES' && result) || (pos.direction === 'NO' && !result);
            } else if (pos.squareId.startsWith('line_')) {
                // Line - Manual mapping for standard 3x3
                let indices = [];
                if (pos.squareId === 'line_row1') indices = [0, 1, 2];
                else if (pos.squareId === 'line_row2') indices = [3, 4, 5];
                else if (pos.squareId === 'line_row3') indices = [6, 7, 8];
                else if (pos.squareId === 'line_col1') indices = [0, 3, 6];
                else if (pos.squareId === 'line_col2') indices = [1, 4, 7];
                else if (pos.squareId === 'line_col3') indices = [2, 5, 8];

                if (indices.length > 0) {
                    const allYes = indices.every(idx => results[idx] === true);
                    isWinner = (pos.direction === 'YES' && allYes) || (pos.direction === 'NO' && !allYes);
                } else {
                    // Fallback using description if ID logic fails or custom grid
                    // Just assume NO for safety if unknown to avoid free money?
                    // Or check if squareId parses?
                }
            } else if (pos.squareId === 'bingo_full') {
                // Bingo
                const allYes = results.every(r => r === true);
                isWinner = (pos.direction === 'YES' && allYes) || (pos.direction === 'NO' && !allYes);
            }

            // Logic for payout
            if (isWinner) {
                if (!pos.settled) {
                    // Normal claim
                    totalNewPayout += pos.shares * 100;
                    updates.set(pos.id, { settled: true, payout: pos.shares * 100 });
                    claimedCount++;
                } else if (pos.settled && (!pos.payout || pos.payout === 0)) {
                    // Retroactive Fix
                    totalNewPayout += pos.shares * 100;
                    updates.set(pos.id, { settled: true, payout: pos.shares * 100 });
                    claimedCount++;
                }
            } else {
                // Loser
                if (!pos.settled) {
                    updates.set(pos.id, { settled: true, payout: 0 });
                    claimedCount++;
                }
            }
        });

        if (updates.size > 0) {
            // Update wallet
            if (totalNewPayout > 0) {
                earnCoins(totalNewPayout, `Payout for ${relevantPositions[0].bingoTitle}`);
            }

            // Update positions
            setPositions(prev => prev.map(p => {
                if (updates.has(p.id)) {
                    return { ...p, ...updates.get(p.id) };
                }
                return p;
            }));
        }

        return { claimed: claimedCount, amount: totalNewPayout };
    };

    // Get positions for a specific bingo
    const getPositionsForBingo = (bingoId) => {
        return positions.filter(p => p.bingoId === bingoId);
    };

    // Get all active positions
    const getAllPositions = () => positions;

    // Calculate total portfolio value (simplified - just shares * 100)
    const getPortfolioValue = () => {
        return positions.reduce((sum, p) => sum + (p.shares * 100), 0);
    };

    // Calculate total invested
    const getTotalInvested = () => {
        return positions.reduce((sum, p) => sum + p.cost, 0);
    };

    return (
        <PositionsContext.Provider value={{
            positions,
            addPosition,
            getPositionsForBingo,
            getAllPositions,
            getPortfolioValue,
            getTotalInvested,
            claimPayouts,
        }}>
            {children}
        </PositionsContext.Provider>
    );
}

export function usePositions() {
    const context = useContext(PositionsContext);
    if (!context) {
        throw new Error('usePositions must be used within a PositionsProvider');
    }
    return context;
}
