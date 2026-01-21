// News and Updates Data
export const NEWS_ITEMS = [
    {
        id: 'welcome-1',
        type: 'update',
        title: '🎉 Welcome to Party Bingo!',
        summary: 'The ultimate party game is here. Create rooms, invite friends, and play bingo together!',
        date: '2026-01-21',
        content: `We're excited to launch Party Bingo! Here's what you can do:\n\n• Create private rooms for friends\n• Play multiple game modes\n• Earn coins and customize your avatar\n• Compete in leagues`,
        featured: true,
    },
    {
        id: 'crowd-shuffle',
        type: 'feature',
        title: '✨ New: Crowd Shuffle Mode',
        summary: 'Players now contribute their own squares after joining!',
        date: '2026-01-21',
        content: 'In Crowd Shuffle mode, everyone adds their own predictions to the pool. The game creates unique boards from all contributions!',
        featured: false,
    },
    {
        id: 'reactions',
        type: 'feature',
        title: '😂 Quick Reactions Added',
        summary: 'Send animated emoji reactions during games!',
        date: '2026-01-21',
        content: 'Tap the 😊 button during gameplay to send reactions that all players can see. Make games more fun with 🔥, 👏, 🎉 and more!',
        featured: false,
    },
];

export const BUG_FIXES = [
    { id: 1, text: "Fixed issue where Host View only showed 9 items instad of all.", date: "2026-01-21" },
    { id: 2, text: "Fixed Classic Mode not awarding Bingo for full house.", date: "2026-01-21" },
    { id: 3, text: "Improved coin icon visibility across all screens.", date: "2026-01-20" },
    { id: 4, text: "Fixed back button behavior to keep games in background.", date: "2026-01-21" },
];

export const CONTACT_INFO = {
    x: { handle: '@ivanms', url: 'https://twitter.com/ivanms' },
    instagram: { handle: '@ivanms', url: 'https://instagram.com/ivanms' },
    email: 'ivanmorenosanz2@gmail.com',
};

// App links
export const APP_LINKS = {
    playStore: 'https://play.google.com/store/apps/details?id=com.partybingo.app',
    appStore: 'https://apps.apple.com/app/party-bingo/id123456789',
    website: 'https://partybingo.app',
    support: 'mailto:ivanmorenosanz2@gmail.com',
};

// Get featured news
export const getFeaturedNews = () => NEWS_ITEMS.filter(n => n.featured);

// Get news by type
export const getNewsByType = (type) => {
    if (type === 'all') return NEWS_ITEMS;
    return NEWS_ITEMS.filter(n => n.type === type);
};
