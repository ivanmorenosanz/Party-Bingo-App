import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { walletAPI } from '../api/client';

const WalletContext = createContext(null);

const STARTING_COINS = 100;

export function WalletProvider({ children }) {
    const { user } = useAuth();
    const [coins, setCoins] = useState(STARTING_COINS);
    const [cash, setCash] = useState(10.00); // Real money balance
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
                    setCash(data.cash || 0.00);
                    setTransactions(data.transactions || []);
                } catch (error) {
                    console.warn('Failed to fetch wallet:', error);
                    // Fallback to localStorage
                    const savedCoins = localStorage.getItem('bingo_coins');
                    const savedCash = localStorage.getItem('bingo_cash');
                    const savedTransactions = localStorage.getItem('bingo_transactions');
                    setCoins(savedCoins ? parseInt(savedCoins, 10) : STARTING_COINS);
                    setCash(savedCash ? parseFloat(savedCash) : 0.00);
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
        localStorage.setItem('bingo_cash', cash.toString());
    }, [cash]);

    useEffect(() => {
        localStorage.setItem('bingo_transactions', JSON.stringify(transactions));
    }, [transactions]);

    const addTransaction = (type, amount, description, currency = 'coins') => {
        const transaction = {
            id: Date.now().toString(),
            type, // 'earn' or 'spend'
            amount,
            description,
            currency, // 'coins' or 'cash'
            timestamp: new Date().toISOString(),
        };
        setTransactions(prev => [transaction, ...prev].slice(0, 100));
    };

    const earnCoins = async (amount, reason = 'Reward') => {
        // Optimistic update
        setCoins(prev => prev + amount);
        addTransaction('earn', amount, reason, 'coins');

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
        addTransaction('spend', amount, reason, 'coins');

        // Sync to server only if real user
        if (user?.id && !user.id.toString().startsWith('guest_')) {
            try {
                const data = await walletAPI.spendCoins(user.id, amount, reason);
                if (!data.success) {
                    // Revert if server says insufficient funds
                    setCoins(prev => prev + amount);
                    return false;
                }
                setCoins(data.coins);
            } catch (error) {
                console.warn('Failed to sync spend to server', error);
                // Don't revert for 404s if we are in a weird state, trust local?
                // Actually if server 404s (wallet not found), we should probably revert or ignore
                if (error.message.includes('404')) {
                    console.error('Wallet not found on server');
                }
            }
        }
        return true;
    };

    const earnCash = async (amount, reason = 'Deposit') => {
        setCash(prev => prev + amount);
        addTransaction('earn', amount, reason, 'cash');
        // Server sync would go here
        return true;
    };

    const spendCash = async (amount, reason = 'Withdrawal') => {
        if (cash < amount) return false;
        setCash(prev => prev - amount);
        addTransaction('spend', amount, reason, 'cash');
        return true;
    };

    const canAfford = (amount) => coins >= amount; // Defaults to checking coins

    const resetWallet = () => {
        setCoins(STARTING_COINS);
        setCash(0.00);
        setTransactions([]);
        localStorage.removeItem('bingo_coins');
        localStorage.removeItem('bingo_cash');
        localStorage.removeItem('bingo_transactions');
    };

    return (
        <WalletContext.Provider value={{
            coins,
            cash,
            transactions,
            loading,
            earnCoins,
            spendCoins,
            earnCash,
            spendCash,
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
