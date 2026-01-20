// Avatar cosmetics catalog
export const COSMETICS = {
    // Frames
    frames: [
        { id: 'default', name: 'Default', price: 0, rarity: 'common', preview: '⭕' },
        { id: 'gold_ring', name: 'Gold Ring', price: 200, rarity: 'rare', preview: '💛' },
        { id: 'rainbow', name: 'Rainbow', price: 350, rarity: 'rare', preview: '🌈' },
        { id: 'fire', name: 'Burning', price: 500, rarity: 'legendary', preview: '🔥' },
        { id: 'diamond', name: 'Diamond', price: 800, rarity: 'legendary', preview: '💎' },
        { id: 'crown', name: 'Royal Crown', price: 1000, rarity: 'legendary', preview: '👑' },
    ],

    // Backgrounds
    backgrounds: [
        { id: 'purple', name: 'Purple', price: 0, rarity: 'common', color: 'from-purple-400 to-pink-400' },
        { id: 'blue', name: 'Ocean Blue', price: 100, rarity: 'common', color: 'from-blue-400 to-cyan-400' },
        { id: 'green', name: 'Forest', price: 100, rarity: 'common', color: 'from-green-400 to-emerald-400' },
        { id: 'sunset', name: 'Sunset', price: 200, rarity: 'uncommon', color: 'from-orange-400 to-red-400' },
        { id: 'galaxy', name: 'Galaxy', price: 400, rarity: 'rare', color: 'from-indigo-500 via-purple-500 to-pink-500' },
        { id: 'aurora', name: 'Aurora', price: 600, rarity: 'legendary', color: 'from-green-400 via-cyan-400 to-blue-400' },
    ],

    // Badges
    badges: [
        { id: 'star', name: 'Star', price: 150, rarity: 'uncommon', icon: '⭐' },
        { id: 'heart', name: 'Heart', price: 150, rarity: 'uncommon', icon: '❤️' },
        { id: 'trophy', name: 'Trophy', price: 300, rarity: 'rare', icon: '🏆' },
        { id: 'lightning', name: 'Lightning', price: 300, rarity: 'rare', icon: '⚡' },
        { id: 'verified', name: 'Verified', price: 500, rarity: 'legendary', icon: '✅' },
        { id: 'vip', name: 'VIP', price: 750, rarity: 'legendary', icon: '💫' },
    ],

    // Special Effects
    effects: [
        { id: 'sparkle', name: 'Sparkle', price: 250, rarity: 'uncommon', animation: 'animate-pulse' },
        { id: 'glow', name: 'Glow', price: 350, rarity: 'rare', animation: 'animate-pulse-glow' },
        { id: 'bounce', name: 'Bounce', price: 400, rarity: 'rare', animation: 'animate-bounce-slow' },
    ],
};

export const RARITY_COLORS = {
    common: 'text-gray-600 bg-gray-100',
    uncommon: 'text-green-600 bg-green-100',
    rare: 'text-blue-600 bg-blue-100',
    legendary: 'text-yellow-600 bg-gradient-to-r from-yellow-100 to-orange-100',
};

export const getCosmeticById = (category, id) =>
    COSMETICS[category]?.find(c => c.id === id);

export const getCosmeticsByCategory = (category) => COSMETICS[category] || [];

export const getAllCosmetics = () => {
    const all = [];
    Object.entries(COSMETICS).forEach(([category, items]) => {
        items.forEach(item => all.push({ ...item, category }));
    });
    return all;
};
