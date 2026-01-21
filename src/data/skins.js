// Bingo Skin Definitions
export const BINGO_SKINS = [
    {
        id: 'default',
        name: 'Classic',
        description: 'Clean and simple',
        cssClass: 'skin-default',
        icon: '🎯',
        premium: false,
        price: 0,
    },
    {
        id: 'neon',
        name: 'Neon Party',
        description: 'Glowing cyberpunk vibes',
        cssClass: 'skin-neon',
        icon: '✨',
        premium: true,
        price: 50,
        soundPack: 'neon',
    },
    {
        id: 'retro',
        name: 'Retro TV',
        description: '80s broadcast style',
        cssClass: 'skin-retro',
        icon: '📺',
        premium: true,
        price: 75,
        soundPack: 'retro',
    },
    {
        id: 'sports',
        name: 'Sports Broadcast',
        description: 'Stadium atmosphere',
        cssClass: 'skin-sports',
        icon: '🏈',
        premium: true,
        price: 100,
        soundPack: 'sports',
    },
];

// Sound Effects for Skins
export const SKIN_SOUNDS = {
    default: {
        mark: '/sounds/pop.mp3',
        bingo: '/sounds/win.mp3',
    },
    neon: {
        mark: '/sounds/synth-blip.mp3',
        bingo: '/sounds/synth-fanfare.mp3',
    },
    retro: {
        mark: '/sounds/tv-click.mp3',
        bingo: '/sounds/retro-jingle.mp3',
    },
    sports: {
        mark: '/sounds/whistle.mp3',
        bingo: '/sounds/crowd-cheer.mp3',
    },
};

// Audio Reactions
export const REACTIONS = [
    {
        id: 'laugh',
        emoji: '😂',
        name: 'Laughing',
        sound: '/sounds/laugh.mp3',
        animation: 'shake',
    },
    {
        id: 'fire',
        emoji: '🔥',
        name: 'Fire',
        sound: '/sounds/fire.mp3',
        animation: 'pulse',
    },
    {
        id: 'clap',
        emoji: '👏',
        name: 'Applause',
        sound: '/sounds/applause.mp3',
        animation: 'bounce',
    },
    {
        id: 'shocked',
        emoji: '😱',
        name: 'Shocked',
        sound: '/sounds/gasp.mp3',
        animation: 'zoom',
    },
    {
        id: 'party',
        emoji: '🎉',
        name: 'Party',
        sound: '/sounds/party.mp3',
        animation: 'confetti',
    },
    {
        id: 'skull',
        emoji: '💀',
        name: 'Dead',
        sound: '/sounds/skull.mp3',
        animation: 'fade',
    },
];

// Get skin by ID
export const getSkinById = (skinId) => {
    return BINGO_SKINS.find(s => s.id === skinId) || BINGO_SKINS[0];
};

// Get reaction by ID
export const getReactionById = (reactionId) => {
    return REACTIONS.find(r => r.id === reactionId);
};
