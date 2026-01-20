// Leagues data with localStorage persistence

// Generate a unique league code
const generateLeagueCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Get leagues from localStorage
const getStoredLeagues = () => {
    try {
        const stored = localStorage.getItem('bingo_leagues');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save leagues to localStorage
const saveLeagues = (leagues) => {
    localStorage.setItem('bingo_leagues', JSON.stringify(leagues));
};

// Sample leagues data (will be merged with stored)
const DEFAULT_LEAGUES = [
    {
        id: 'league_1',
        name: 'Friday Night Crew',
        code: 'FNC2026',
        description: 'Weekly bingo battles with friends!',
        isPrivate: true,
        members: [
            { id: 'user_1', name: 'You', wins: 12, gamesPlayed: 20, coins: 1200, isOwner: true },
            { id: 'user_2', name: 'Sarah', wins: 10, gamesPlayed: 18, coins: 980 },
            { id: 'user_3', name: 'Mike', wins: 8, gamesPlayed: 20, coins: 850 },
            { id: 'user_4', name: 'Alex', wins: 7, gamesPlayed: 15, coins: 720 },
        ],
        gamesPlayed: 20,
        createdAt: '2026-01-01',
        lastPlayed: '2026-01-19',
    },
    {
        id: 'league_2',
        name: 'Office Champions',
        code: 'OFC2026',
        description: 'The ultimate workplace competition.',
        isPrivate: false,
        members: [
            { id: 'user_5', name: 'Boss', wins: 15, gamesPlayed: 25, coins: 1500, isOwner: true },
            { id: 'user_1', name: 'You', wins: 8, gamesPlayed: 20, coins: 800 },
            { id: 'user_6', name: 'Jake', wins: 5, gamesPlayed: 15, coins: 500 },
        ],
        gamesPlayed: 25,
        createdAt: '2025-12-15',
        lastPlayed: '2026-01-18',
    },
];

// Get all leagues (default + stored)
export const getAllLeagues = () => {
    const stored = getStoredLeagues();
    const defaultIds = DEFAULT_LEAGUES.map(l => l.id);
    const uniqueStored = stored.filter(l => !defaultIds.includes(l.id));
    return [...DEFAULT_LEAGUES, ...uniqueStored];
};

// For backwards compatibility
export const SAMPLE_LEAGUES = getAllLeagues();

// Create a new league
export const createLeague = ({ name, description, isPrivate, creatorId, creatorName }) => {
    const leagues = getStoredLeagues();

    // Generate unique code
    let code;
    const existingCodes = [...DEFAULT_LEAGUES, ...leagues].map(l => l.code);
    do {
        code = generateLeagueCode();
    } while (existingCodes.includes(code));

    const newLeague = {
        id: `league_${Date.now()}`,
        name,
        code,
        description: description || '',
        isPrivate,
        members: [
            {
                id: creatorId || 'user_1',
                name: creatorName || 'You',
                wins: 0,
                gamesPlayed: 0,
                coins: 0,
                isOwner: true,
            },
        ],
        gamesPlayed: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastPlayed: new Date().toISOString().split('T')[0],
    };

    leagues.push(newLeague);
    saveLeagues(leagues);

    // Update SAMPLE_LEAGUES reference
    SAMPLE_LEAGUES.length = 0;
    SAMPLE_LEAGUES.push(...getAllLeagues());

    return newLeague;
};

// Join a league by code
export const joinLeague = (code, userId, userName) => {
    const allLeagues = getAllLeagues();
    const league = allLeagues.find(l => l.code.toUpperCase() === code.toUpperCase());

    if (!league) {
        return { success: false, error: 'League not found' };
    }

    // Check if already a member
    if (league.members.some(m => m.id === userId)) {
        return { success: false, error: 'Already a member' };
    }

    // Add member
    league.members.push({
        id: userId || 'user_1',
        name: userName || 'You',
        wins: 0,
        gamesPlayed: 0,
        coins: 0,
        isOwner: false,
    });

    // Update stored leagues
    const stored = getStoredLeagues();
    const idx = stored.findIndex(l => l.id === league.id);
    if (idx >= 0) {
        stored[idx] = league;
        saveLeagues(stored);
    }

    return { success: true, league };
};

export const getLeagueById = (id) => getAllLeagues().find(l => l.id === id);

export const getLeagueByCode = (code) =>
    getAllLeagues().find(l => l.code.toUpperCase() === code.toUpperCase());

export const getLeaderboard = (league) => {
    return [...league.members].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.coins - a.coins;
    });
};
