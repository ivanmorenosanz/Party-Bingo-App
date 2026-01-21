import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { walletAPI } from '../api/client';

const WalletContext = createContext(null);

const STARTING_COINS = 100;

export function WalletProvider({ children }) {
    const { user } = useAuth();
    const [coins, setCoins] = useState(STARTING_COINS);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Sync wallet from server when user changes
    useEffect(() => {
        const syncWallet = async () => {
            if (user?.id) {
                setLoading(true);
                try {
                    const data = await walletAPI.getWallet(user.id);
                    setCoins(data.coins);
                    setTransactions(data.transactions || []);
                } catch (error) {
                    // Fallback to localStorage
                    const savedCoins = localStorage.getItem('bingo_coins');
                    const savedTransactions = localStorage.getItem('bingo_transactions');
                    setCoins(savedCoins ? parseInt(savedCoins, 10) : STARTING_COINS);
                    setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
                }
                setLoading(false);
            }
        };
        syncWallet();
    }, [user?.id]);

    // Save to localStorage as backup
    useEffect(() => {
        localStorage.setItem('bingo_coins', coins.toString());
    }, [coins]);

    useEffect(() => {
        localStorage.setItem('bingo_transactions', JSON.stringify(transactions));
    }, [transactions]);

    const addTransaction = (type, amount, description) => {
        const transaction = {
            id: Date.now().toString(),
            type,
            amount,
            description,
            timestamp: new Date().toISOString(),
        };
        setTransactions(prev => [transaction, ...prev].slice(0, 100));
    };

    const earnCoins = async (amount, reason = 'Reward') => {
        // Optimistic update
        setCoins(prev => prev + amount);
        addTransaction('earn', amount, reason);

        // Sync to server
        if (user?.id) {
            try {
                const data = await walletAPI.earnCoins(user.id, amount, reason);
                setCoins(data.coins);
            } catch (error) {
                console.warn('Failed to sync earn to server');
            }
        }
        return true;
    };

    const spendCoins = async (amount, reason = 'Purchase') => {
        if (coins < amount) {
            return false;
        }

        // Optimistic update
        setCoins(prev => prev - amount);
        addTransaction('spend', amount, reason);

        // Sync to server
        if (user?.id) {
            try {
                const data = await walletAPI.spendCoins(user.id, amount, reason);
                if (!data.success) {
                    // Revert if server says insufficient funds
                    setCoins(prev => prev + amount);
                    return false;
                }
                setCoins(data.coins);
            } catch (error) {
                console.warn('Failed to sync spend to server');
            }
        }
        return true;
    };

    const canAfford = (amount) => coins >= amount;

    const resetWallet = () => {
        setCoins(STARTING_COINS);
        setTransactions([]);
        localStorage.removeItem('bingo_coins');
        localStorage.removeItem('bingo_transactions');
    };

    return (
        <WalletContext.Provider value={{
            coins,
            transactions,
            loading,
            earnCoins,
            spendCoins,
            canAfford,
            resetWallet,
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
