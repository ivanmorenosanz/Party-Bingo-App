import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_AVATAR = {
    frame: 'default',
    background: 'purple',
    badge: null,
    effect: null,
};

const INITIAL_COSMETICS = ['default', 'purple'];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('bingo_user');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('bingo_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('bingo_user');
        }
    }, [user]);

    const signup = (username, email, password) => {
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            avatar: DEFAULT_AVATAR,
            ownedCosmetics: INITIAL_COSMETICS,
            rewards: [],
            stats: {
                gamesPlayed: 0,
                gamesWon: 0,
                totalBingos: 0,
                currentStreak: 0,
                bestStreak: 0,
            },
            leagues: [],
            createdAt: new Date().toISOString(),
        };
        setUser(newUser);
        return newUser;
    };

    const login = (email, password) => {
        // Mock login - in production, would verify with backend
        const mockUser = {
            id: Date.now().toString(),
            username: email.split('@')[0],
            email,
            avatar: DEFAULT_AVATAR,
            ownedCosmetics: INITIAL_COSMETICS,
            rewards: ['first_bingo', 'speed_demon'],
            stats: {
                gamesPlayed: 15,
                gamesWon: 8,
                totalBingos: 24,
                currentStreak: 3,
                bestStreak: 7,
            },
            leagues: ['league_1'],
            createdAt: new Date().toISOString(),
        };
        setUser(mockUser);
        return mockUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('bingo_user');
    };

    const updateAvatar = (cosmetic) => {
        setUser(prev => ({
            ...prev,
            avatar: { ...prev.avatar, ...cosmetic },
        }));
    };

    const addCosmetic = (cosmeticId) => {
        setUser(prev => ({
            ...prev,
            ownedCosmetics: [...prev.ownedCosmetics, cosmeticId],
        }));
    };

    const addReward = (rewardId) => {
        if (!user.rewards.includes(rewardId)) {
            setUser(prev => ({
                ...prev,
                rewards: [...prev.rewards, rewardId],
            }));
        }
    };

    const updateStats = (stats) => {
        setUser(prev => ({
            ...prev,
            stats: { ...prev.stats, ...stats },
        }));
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            signup,
            login,
            logout,
            updateAvatar,
            addCosmetic,
            addReward,
            updateStats,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
