// Sample community bingos for browsing
export const COMMUNITY_BINGOS = [
    {
        id: 'party_night',
        title: 'Party Night Classics',
        creator: 'PartyKing',
        creatorId: 'user_1',
        plays: 1234,
        rating: 4.8,
        type: 'fun', // fun or serious
        price: 0, // Free for fun bingos
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
        endsAt: '2026-01-25T23:59:59', // Sunday night
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
    {
        id: 'game_night',
        title: 'Game Night Bingo',
        creator: 'BoardGameFan',
        creatorId: 'user_3',
        plays: 642,
        rating: 4.7,
        type: 'fun',
        price: 0,
        gameMode: 'first_to_line',
        gridSize: 3,
        items: [
            'Rules argument',
            'Sore loser',
            'Unexpected winner',
            'Snack break',
            'Phone distraction',
            'Comeback victory',
            'Bad dice roll',
            'Alliance formed',
            'Table flip threat'
        ],
        tags: ['games', 'board games', 'tabletop'],
        createdAt: '2026-01-08',
        featured: false,
    },
    {
        id: 'football_match',
        title: 'Football Match Predictor',
        creator: 'SportsGuru',
        creatorId: 'user_4',
        plays: 2341,
        rating: 4.9,
        type: 'serious',
        price: 25,
        gameMode: 'first_to_line',
        gridSize: 5,
        items: [
            'First goal before 15min',
            'Yellow card',
            'Red card',
            'Penalty kick',
            'Header goal',
            'Free kick goal',
            'Corner goal',
            'VAR review',
            'Injury timeout',
            'Substitution before halftime',
            'Goal after 80min',
            'Own goal',
            'Goalkeeper save',
            'Post/crossbar hit',
            'Offside call',
            'Hat trick',
            'Clean sheet',
            'Player celebration',
            'Fan pitch invasion',
            'Manager sent off',
            'Extra time',
            'Penalty shootout',
            'Final score draw',
            'Home team wins',
            'Away team wins',
        ],
        tags: ['sports', 'football', 'soccer', 'predictions'],
        createdAt: '2026-01-18',
        featured: true,
        seasonal: true,
        badge: 'Champions League Special',
        endsAt: '2026-01-23T20:45:00', // Upcoming match
    },
    {
        id: 'wedding_bingo',
        title: 'Wedding Reception',
        creator: 'EventPro',
        creatorId: 'user_5',
        plays: 521,
        rating: 4.6,
        type: 'serious',
        price: 15,
        gameMode: 'first_to_line',
        gridSize: 4,
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
            'Garter toss',
            'Late arrival',
        ],
        tags: ['wedding', 'events', 'celebration'],
        createdAt: '2026-01-12',
        featured: true,
        seasonal: true,
        badge: 'Season Special',
        endsAt: '2026-02-01T00:00:00', // End of month
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
