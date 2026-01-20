// Sample leagues data
export const SAMPLE_LEAGUES = [
    {
        id: 'league_1',
        name: 'Friday Night Crew',
        code: 'FNC2026',
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

export const getLeagueById = (id) => SAMPLE_LEAGUES.find(l => l.id === id);

export const getLeagueByCode = (code) =>
    SAMPLE_LEAGUES.find(l => l.code.toUpperCase() === code.toUpperCase());

export const getLeaderboard = (league) => {
    return [...league.members].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.coins - a.coins;
    });
};
