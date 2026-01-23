// Sample community bingos for browsing
export const COMMUNITY_BINGOS = [
    {
        id: 'party_night',
        title: 'Party Night Classics',
        creator: 'PartyKing',
        creatorId: 'user_1',
        plays: 1234,
        rating: 4.8,
        type: 'fun',
        price: 0,
        gameMode: 'first_to_line',
        gridSize: 3,
        items: [
            'Someone spills a drink',
            'Bad karaoke',
            'Pizza arrives',
            'Group selfie',
            'Dance battle',
            'Someone falls asleep',
            'Impromptu game',
            'Late arrival',
            'Epic story told'
        ],
        tags: ['party', 'friends', 'weekend'],
        createdAt: '2026-01-15',
        featured: true,
        seasonal: false,
        badge: 'Weekend Special',
        endsAt: '2026-01-25T23:59:59',
    },
    {
        id: 'movie_night',
        title: 'Movie Night Predictions',
        creator: 'FilmBuff',
        creatorId: 'user_2',
        plays: 856,
        rating: 4.5,
        type: 'fun',
        price: 0,
        gameMode: 'first_to_line',
        gridSize: 3,
        items: [
            'Someone cries',
            'Bathroom break',
            'Phone rings',
            'Snack refill',
            'Plot twist called',
            'Quote the movie',
            'Someone snores',
            'Pause for debate',
            'Rewind scene'
        ],
        tags: ['movies', 'cinema', 'netflix'],
        createdAt: '2026-01-10',
        featured: false,
    },
    // COIN TRADING GAMES (LMSR Markets - no entry fee, buy YES/NO shares)
    {
        id: 'football_predictor',
        title: 'Champions League Predictions',
        creator: 'SportsGuru',
        creatorId: 'user_4',
        plays: 2341,
        rating: 4.9,
        type: 'coins', // Coin game = prediction market
        price: 0, // NO ENTRY FEE - users trade shares instead
        tradeable: true, // Flag for LMSR trading
        gameMode: 'first_to_line',
        gridSize: 3,
        items: [
            'First goal before 15min',
            'Yellow card shown',
            'Penalty kick awarded',
            'Header goal scored',
            'VAR review called',
            'Goal after 80min',
            'Clean sheet',
            'Player substituted',
            'Corner goal scored'
        ],
        tags: ['sports', 'football', 'soccer', 'predictions'],
        createdAt: '2026-01-18',
        featured: true,
        seasonal: true,
        badge: 'Champions League',
        endsAt: '2026-01-22T20:45:00', // Ended yesterday
        status: 'ended',
        results: [true, true, true, true, true, true, true, true, true], // All YES
    },
    {
        id: 'tv_show_bets',
        title: 'Reality TV Predictions',
        creator: 'TVFanatic',
        creatorId: 'user_6',
        plays: 789,
        rating: 4.6,
        type: 'coins', // Prediction market
        price: 0, // No entry fee
        tradeable: true,
        gameMode: 'first_to_line',
        gridSize: 3,
        items: [
            'Someone cries',
            'Dramatic exit',
            'Plot twist reveal',
            'Villain moment',
            'Love confession',
            'Elimination shocker',
            'Backstabbing move',
            'Underdog wins',
            'Cliffhanger ending'
        ],
        tags: ['tv', 'reality', 'entertainment'],
        createdAt: '2026-01-20',
        featured: true,
        badge: 'Hot Picks',
        endsAt: '2026-02-01T22:00:00',
    },
    {
        id: 'stock_market',
        title: 'Market Movers Bingo',
        creator: 'WallStreetPro',
        creatorId: 'user_7',
        plays: 456,
        rating: 4.4,
        type: 'coins', // Prediction market
        price: 0, // No entry fee
        tradeable: true,
        gameMode: 'blackout',
        gridSize: 3,
        items: [
            'Tech stock rallies 5%+',
            'Fed rate announcement',
            'Crypto pump',
            'Oil price spike',
            'Earnings beat',
            'Market opens green',
            'Midday reversal',
            'Gold price rises',
            'Volume record broken'
        ],
        tags: ['stocks', 'finance', 'trading'],
        createdAt: '2026-01-22',
        featured: false,
        endsAt: '2026-01-31T16:00:00',
    },
    {
        id: 'wedding_bingo',
        title: 'Wedding Reception',
        creator: 'EventPro',
        creatorId: 'user_5',
        plays: 521,
        rating: 4.6,
        type: 'fun', // Free game with 4x4
        price: 0,
        gameMode: 'first_to_line',
        gridSize: 4, // 4x4 allowed for free games
        items: [
            'Someone cries during speech',
            'Cake cutting',
            'First dance',
            'Bouquet toss',
            'Drunk relative',
            'Kid on dance floor',
            'Best man joke fails',
            'Someone catches bouquet',
            'Couple kiss',
            'Toast cheers',
            'Someone trips',
            'Food complaint',
            'DJ plays requests',
            'Guest leaves early',
            'Photo booth visit',
            'Garter toss'
        ],
        tags: ['wedding', 'events', 'celebration'],
        createdAt: '2026-01-12',
        featured: true,
        seasonal: true,
        badge: 'Season Special',
    },
];

export const BINGO_CATEGORIES = [
    { id: 'all', name: 'All', icon: '🎲' },
    { id: 'party', name: 'Party', icon: '🎉' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'movies', name: 'Movies', icon: '🎬' },
    { id: 'games', name: 'Games', icon: '🎮' },
    { id: 'events', name: 'Events', icon: '📅' },
];

export const getBingoById = (id) => COMMUNITY_BINGOS.find(b => b.id === id);

export const getBingosByType = (type) =>
    type === 'all' ? COMMUNITY_BINGOS : COMMUNITY_BINGOS.filter(b => b.type === type);

export const searchBingos = (query) => {
    const q = query.toLowerCase();
    return COMMUNITY_BINGOS.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.tags.some(t => t.includes(q)) ||
        b.creator.toLowerCase().includes(q)
    );
};

export const getFeaturedBingos = () => COMMUNITY_BINGOS.filter(b => b.featured);
