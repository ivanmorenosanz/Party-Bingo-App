// Reward definitions with coin values and unlock conditions
export const REWARDS = {
    first_bingo: {
        id: 'first_bingo',
        name: 'First Bingo!',
        description: 'Complete your first bingo line',
        icon: '🎯',
        coins: 100,
        rarity: 'common',
    },
    speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a bingo in under 5 minutes',
        icon: '⚡',
        coins: 50,
        rarity: 'uncommon',
    },
    full_house: {
        id: 'full_house',
        name: 'Full House',
        description: 'Mark all squares on a bingo board',
        icon: '🏠',
        coins: 200,
        rarity: 'rare',
    },
    winning_streak_3: {
        id: 'winning_streak_3',
        name: 'Hot Streak',
        description: 'Win 3 games in a row',
        icon: '🔥',
        coins: 150,
        rarity: 'uncommon',
    },
    winning_streak_7: {
        id: 'winning_streak_7',
        name: 'Perfect Week',
        description: 'Win 7 games in a row',
        icon: '👑',
        coins: 500,
        rarity: 'legendary',
    },
    league_champion: {
        id: 'league_champion',
        name: 'League Champion',
        description: 'Win first place in a league',
        icon: '🏆',
        coins: 1000,
        rarity: 'legendary',
    },
    social_butterfly: {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Play in 5 different rooms',
        icon: '🦋',
        coins: 75,
        rarity: 'common',
    },
    creator: {
        id: 'creator',
        name: 'Content Creator',
        description: 'Create your first community bingo',
        icon: '✨',
        coins: 100,
        rarity: 'uncommon',
    },
    popular_creator: {
        id: 'popular_creator',
        name: 'Popular Creator',
        description: 'Have 100 people play your bingo',
        icon: '🌟',
        coins: 500,
        rarity: 'rare',
    },
    collector: {
        id: 'collector',
        name: 'Collector',
        description: 'Own 10 different cosmetics',
        icon: '💎',
        coins: 250,
        rarity: 'rare',
    },
};

export const RARITY_COLORS = {
    common: 'bg-gray-100 text-gray-700 border-gray-300',
    uncommon: 'bg-green-100 text-green-700 border-green-300',
    rare: 'bg-blue-100 text-blue-700 border-blue-300',
    legendary: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-yellow-500',
};

export const getRewardById = (id) => REWARDS[id];

export const getRewardsByRarity = (rarity) =>
    Object.values(REWARDS).filter(r => r.rarity === rarity);
