import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI, setToken } from '../api/client';

const AuthContext = createContext(null);

const DEFAULT_AVATAR = {
    character: 'warrior',
    frame: 'default',
    background: 'purple',
    badge: null,
    effect: null,
};

const INITIAL_COSMETICS = ['default', 'purple', 'warrior', 'mage'];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingVerification, setPendingVerification] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('bingo_token');
            if (token) {
                try {
                    const userData = await userAPI.getSession();
                    setUser(userData);
                } catch (error) {
                    // Session invalid, clear token and check localStorage fallback
                    setToken(null);
                    const saved = localStorage.getItem('bingo_user');
                    if (saved) {
                        setUser(JSON.parse(saved));
                    }
                }
            } else {
                // No token, check localStorage fallback
                const saved = localStorage.getItem('bingo_user');
                if (saved) {
                    setUser(JSON.parse(saved));
                }
            }
            setLoading(false);
        };
        checkSession();
    }, []);

    // Sync user to localStorage as backup
    useEffect(() => {
        if (user) {
            localStorage.setItem('bingo_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('bingo_user');
        }
    }, [user]);

    const isGuest = user?.isGuest || false;
    const isVerified = user?.isVerified || false;

    const signup = async (username, email, password) => {
        try {
            const userData = await userAPI.signup(username, email, password);
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            // Fallback to local mode if API unavailable
            if (error.message === 'OFFLINE') {
                const newUser = {
                    id: Date.now().toString(),
                    username,
                    email,
                    isGuest: false,
                    isVerified: true,
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
                return { success: true, user: newUser, offline: true };
            }
            return { success: false, error: error.message };
        }
    };

    const verifyEmail = (code) => {
        if (!pendingVerification) {
            return { success: false, error: 'No pending verification' };
        }
        if (code !== pendingVerification.code) {
            return { success: false, error: 'Invalid verification code' };
        }
        // Code correct - in API mode, signup auto-verifies
        setPendingVerification(null);
        return { success: true };
    };

    const resendVerificationCode = () => {
        if (!pendingVerification) {
            return { success: false };
        }
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        setPendingVerification(prev => ({ ...prev, code: newCode }));
        console.log('New verification code:', newCode);
        return { success: true, code: newCode };
    };

    const loginAsGuest = async () => {
        try {
            const userData = await userAPI.loginAsGuest();
            setUser(userData);
            return userData;
        } catch (error) {
            // Fallback to local mode
            const guestUser = {
                id: `guest_${Date.now()}`,
                username: `Guest_${Math.floor(Math.random() * 9999)}`,
                email: null,
                isGuest: true,
                isVerified: false,
                avatar: { ...DEFAULT_AVATAR, character: 'warrior' },
                ownedCosmetics: ['default', 'warrior'],
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
            setUser(guestUser);
            return guestUser;
        }
    };

    const login = async (email, password) => {
        try {
            const userData = await userAPI.login(email, password);
            setUser(userData);
            return userData;
        } catch (error) {
            // Fallback to local mode
            if (error.message === 'OFFLINE') {
                const mockUser = {
                    id: Date.now().toString(),
                    username: email.split('@')[0],
                    email,
                    isGuest: false,
                    isVerified: true,
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
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await userAPI.logout();
        } catch (e) {
            // Ignore
        }
        setUser(null);
        setPendingVerification(null);
        localStorage.removeItem('bingo_user');
    };

    const upgradeFromGuest = () => {
        logout();
        return { needsSignup: true };
    };

    const updateAvatar = async (cosmetic) => {
        const newAvatar = { ...user.avatar, ...cosmetic };
        setUser(prev => ({ ...prev, avatar: newAvatar }));
        try {
            await userAPI.updateUser(user.id, { avatar: newAvatar });
        } catch (e) {
            console.warn('Failed to sync avatar to server');
        }
    };

    const addCosmetic = async (cosmeticId) => {
        const newCosmetics = [...user.ownedCosmetics, cosmeticId];
        setUser(prev => ({ ...prev, ownedCosmetics: newCosmetics }));
        try {
            await userAPI.updateUser(user.id, { ownedCosmetics: newCosmetics });
        } catch (e) {
            console.warn('Failed to sync cosmetics to server');
        }
    };

    const addReward = async (rewardId) => {
        if (!user.rewards.includes(rewardId)) {
            const newRewards = [...user.rewards, rewardId];
            setUser(prev => ({ ...prev, rewards: newRewards }));
            try {
                await userAPI.updateUser(user.id, { rewards: newRewards });
            } catch (e) {
                console.warn('Failed to sync rewards to server');
            }
        }
    };

    const updateStats = async (stats) => {
        const newStats = { ...user.stats, ...stats };
        setUser(prev => ({ ...prev, stats: newStats }));
        try {
            await userAPI.updateUser(user.id, { stats: newStats });
        } catch (e) {
            console.warn('Failed to sync stats to server');
        }
    };

    // Show loading state while checking session
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isGuest,
            isVerified,
            pendingVerification,
            signup,
            verifyEmail,
            resendVerificationCode,
            login,
            loginAsGuest,
            logout,
            upgradeFromGuest,
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
