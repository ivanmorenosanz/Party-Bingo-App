import { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext(null);

const STARTING_COINS = 100;

export function WalletProvider({ children }) {
    const [coins, setCoins] = useState(() => {
        const saved = localStorage.getItem('bingo_coins');
        return saved ? parseInt(saved, 10) : STARTING_COINS;
    });

    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('bingo_transactions');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('bingo_coins', coins.toString());
    }, [coins]);

    useEffect(() => {
        localStorage.setItem('bingo_transactions', JSON.stringify(transactions));
    }, [transactions]);

    const addTransaction = (type, amount, description) => {
        const transaction = {
            id: Date.now().toString(),
            type, // 'earn' or 'spend'
            amount,
            description,
            timestamp: new Date().toISOString(),
        };
        setTransactions(prev => [transaction, ...prev].slice(0, 100)); // Keep last 100
    };

    const earnCoins = (amount, reason = 'Reward') => {
        setCoins(prev => prev + amount);
        addTransaction('earn', amount, reason);
        return true;
    };

    const spendCoins = (amount, reason = 'Purchase') => {
        if (coins >= amount) {
            setCoins(prev => prev - amount);
            addTransaction('spend', amount, reason);
            return true;
        }
        return false;
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
