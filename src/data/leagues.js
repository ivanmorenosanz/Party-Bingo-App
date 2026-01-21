// Leagues data with per-user localStorage persistence

// Generate a unique league code
const generateLeagueCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Get storage key for a user
const getStorageKey = (userId) => `bingo_leagues_${userId || 'global'}`;
const getGlobalStorageKey = () => 'bingo_all_leagues';

// Get all leagues from global storage
const getGlobalLeagues = () => {
    try {
        const stored = localStorage.getItem(getGlobalStorageKey());
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

// Save leagues to global storage
const saveGlobalLeagues = (leagues) => {
    localStorage.setItem(getGlobalStorageKey(), JSON.stringify(leagues));
};

// Get user's league memberships (just league IDs)
const getUserLeagueIds = (userId) => {
    try {
        const stored = localStorage.getItem(getStorageKey(userId));
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

// Save user's league memberships
const saveUserLeagueIds = (userId, leagueIds) => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(leagueIds));
};

// Get leagues for a specific user (only leagues they are a member of)
export const getUserLeagues = (userId) => {
    const userLeagueIds = getUserLeagueIds(userId);
    const allLeagues = getGlobalLeagues();
    return allLeagues.filter(l => userLeagueIds.includes(l.id));
};

// Get all leagues (for admin/discovery)
export const getAllLeagues = () => {
    return getGlobalLeagues();
};

// For backwards compatibility - but now returns empty array
// Components should use getUserLeagues(userId) instead
export const SAMPLE_LEAGUES = [];

// Create a new league
export const createLeague = ({ name, description, isPrivate, creatorId, creatorName }) => {
    const leagues = getGlobalLeagues();

    // Generate unique code
    let code;
    const existingCodes = leagues.map(l => l.code);
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
    saveGlobalLeagues(leagues);

    // Add to creator's league list
    if (creatorId) {
        const userLeagueIds = getUserLeagueIds(creatorId);
        if (!userLeagueIds.includes(newLeague.id)) {
            userLeagueIds.push(newLeague.id);
            saveUserLeagueIds(creatorId, userLeagueIds);
        }
    }

    return newLeague;
};

// Join a league by code
export const joinLeague = (code, userId, userName) => {
    const allLeagues = getGlobalLeagues();
    const leagueIndex = allLeagues.findIndex(l => l.code.toUpperCase() === code.toUpperCase());

    if (leagueIndex === -1) {
        return { success: false, error: 'League not found' };
    }

    const league = allLeagues[leagueIndex];

    // Check if already a member
    if (league.members.some(m => m.id === userId)) {
        return { success: false, error: 'Already a member' };
    }

    // Add member
    league.members.push({
        id: userId,
        name: userName || 'Player',
        wins: 0,
        gamesPlayed: 0,
        coins: 0,
        isOwner: false,
    });

    // Update stored leagues
    allLeagues[leagueIndex] = league;
    saveGlobalLeagues(allLeagues);

    // Add to user's league list
    if (userId) {
        const userLeagueIds = getUserLeagueIds(userId);
        if (!userLeagueIds.includes(league.id)) {
            userLeagueIds.push(league.id);
            saveUserLeagueIds(userId, userLeagueIds);
        }
    }

    return { success: true, league };
};

// Leave a league
export const leaveLeague = (leagueId, userId) => {
    const allLeagues = getGlobalLeagues();
    const leagueIndex = allLeagues.findIndex(l => l.id === leagueId);

    if (leagueIndex === -1) {
        return { success: false, error: 'League not found' };
    }

    const league = allLeagues[leagueIndex];
    league.members = league.members.filter(m => m.id !== userId);

    // Remove league if no members left
    if (league.members.length === 0) {
        allLeagues.splice(leagueIndex, 1);
    } else {
        allLeagues[leagueIndex] = league;
    }

    saveGlobalLeagues(allLeagues);

    // Remove from user's league list
    if (userId) {
        const userLeagueIds = getUserLeagueIds(userId).filter(id => id !== leagueId);
        saveUserLeagueIds(userId, userLeagueIds);
    }

    return { success: true };
};

export const getLeagueById = (id) => getGlobalLeagues().find(l => l.id === id);

export const getLeagueByCode = (code) =>
    getGlobalLeagues().find(l => l.code.toUpperCase() === code.toUpperCase());

// Update a member's score after a game
export const updateMemberScore = (leagueId, userId, gameResult) => {
    const allLeagues = getGlobalLeagues();
    const leagueIndex = allLeagues.findIndex(l => l.id === leagueId);

    if (leagueIndex === -1) {
        return { success: false, error: 'League not found' };
    }

    const league = allLeagues[leagueIndex];
    const memberIndex = league.members.findIndex(m => m.id === userId);

    if (memberIndex === -1) {
        return { success: false, error: 'Member not found' };
    }

    // Update member stats
    const member = league.members[memberIndex];
    member.gamesPlayed = (member.gamesPlayed || 0) + 1;
    member.totalScore = (member.totalScore || 0) + (gameResult.score || 0);
    member.coins = (member.coins || 0) + (gameResult.coinsEarned || 0);

    if (gameResult.won) {
        member.wins = (member.wins || 0) + 1;
    }

    // Update league stats
    league.gamesPlayed = (league.gamesPlayed || 0) + 1;
    league.lastPlayed = new Date().toISOString().split('T')[0];

    allLeagues[leagueIndex] = league;
    saveGlobalLeagues(allLeagues);

    return { success: true, member };
};

// Get leaderboard sorted by total score then wins
export const getLeaderboard = (league) => {
    if (!league || !league.members) return [];

    return [...league.members].sort((a, b) => {
        // Sort by total score first
        const scoreA = a.totalScore || 0;
        const scoreB = b.totalScore || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;

        // Then by wins
        if (b.wins !== a.wins) return b.wins - a.wins;

        // Then by coins
        return (b.coins || 0) - (a.coins || 0);
    });
};

