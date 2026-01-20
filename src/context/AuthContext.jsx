import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_AVATAR = {
    character: 'warrior',
    frame: 'default',
    background: 'purple',
    badge: null,
    effect: null,
};

const INITIAL_COSMETICS = ['default', 'purple', 'warrior', 'mage'];

// Generate a 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('bingo_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [pendingVerification, setPendingVerification] = useState(null);

    useEffect(() => {
        if (user) {
            localStorage.setItem('bingo_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('bingo_user');
        }
    }, [user]);

    // Check if user is a guest
    const isGuest = user?.isGuest || false;

    // Check if user is verified
    const isVerified = user?.isVerified || false;

    const signup = (username, email, password) => {
        // Generate verification code
        const verificationCode = generateVerificationCode();

        // Store pending verification
        setPendingVerification({
            username,
            email,
            password,
            code: verificationCode,
            createdAt: Date.now(),
        });

        // In a real app, send email with code
        // For demo, we'll show the code to the user
        console.log('Verification code:', verificationCode);

        return { needsVerification: true, code: verificationCode };
    };

    const verifyEmail = (code) => {
        if (!pendingVerification) {
            return { success: false, error: 'No pending verification' };
        }

        if (code !== pendingVerification.code) {
            return { success: false, error: 'Invalid verification code' };
        }

        // Code is correct, create the user
        const newUser = {
            id: Date.now().toString(),
            username: pendingVerification.username,
            email: pendingVerification.email,
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
        setPendingVerification(null);

        return { success: true, user: newUser };
    };

    const resendVerificationCode = () => {
        if (!pendingVerification) {
            return { success: false };
        }

        const newCode = generateVerificationCode();
        setPendingVerification(prev => ({ ...prev, code: newCode }));
        console.log('New verification code:', newCode);

        return { success: true, code: newCode };
    };

    const loginAsGuest = () => {
        const guestUser = {
            id: `guest_${Date.now()}`,
            username: `Guest_${Math.floor(Math.random() * 9999)}`,
            email: null,
            isGuest: true,
            isVerified: false,
            avatar: { ...DEFAULT_AVATAR, character: 'warrior' },
            ownedCosmetics: ['default', 'warrior'], // Limited cosmetics
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
    };

    const login = (email, password) => {
        // Mock login - in production, would verify with backend
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
    };

    const logout = () => {
        setUser(null);
        setPendingVerification(null);
        localStorage.removeItem('bingo_user');
    };

    const upgradeFromGuest = () => {
        // Clear guest state and redirect to signup
        logout();
        return { needsSignup: true };
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
