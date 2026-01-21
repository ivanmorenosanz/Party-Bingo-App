import { useState } from 'react';
import { ShoppingBag, Sparkles, Check, Lock, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import { COSMETICS, RARITY_COLORS } from '../../data/cosmetics';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import PixelAvatar from '../../components/avatar/PixelAvatar';

const CATEGORIES = [
    { id: 'characters', name: 'Characters', icon: '👤' },
    { id: 'frames', name: 'Frames', icon: '⭕' },
    { id: 'backgrounds', name: 'Backgrounds', icon: '🎨' },
    { id: 'badges', name: 'Badges', icon: '🏷️' },
    { id: 'effects', name: 'Effects', icon: '✨' },
];

export default function ShopPage() {
    const navigate = useNavigate();
    const { coins, spendCoins, canAfford } = useWallet();
    const { user, addCosmetic, updateAvatar, isGuest } = useAuth();
    const [activeCategory, setActiveCategory] = useState('characters');
    const [showPurchaseModal, setShowPurchaseModal] = useState(null);
    const [showGuestModal, setShowGuestModal] = useState(false);

    // Guest restriction - show upgrade modal
    if (isGuest) {
        return (
            <div className="min-h-screen pb-24">
                <Header title="Cosmetics Shop" showCoins />

                <div className="p-6">
                    <div className="card text-center py-12">
                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="text-gray-400" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Locked</h2>
                        <p className="text-gray-500 mb-6">
                            Create a free account to access the<br />cosmetics shop and customize your avatar!
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="btn-primary"
                        >
                            Create Free Account
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="block w-full mt-3 text-primary-600 font-semibold"
                        >
                            I already have an account
                        </button>
                    </div>
                </div>

                <BottomNav />
            </div>
        );
    }

    const items = COSMETICS[activeCategory] || [];

    const isOwned = (itemId) => user?.ownedCosmetics?.includes(itemId);
    const isEquipped = (category, itemId) => {
        if (category === 'characters') return user?.avatar?.character === itemId;
        const categoryKey = category.slice(0, -1);
        return user?.avatar?.[categoryKey] === itemId;
    };

    const handlePurchase = (item) => {
        if (isOwned(item.id)) {
            if (activeCategory === 'characters') {
                updateAvatar({ character: item.id });
            } else {
                const categoryKey = activeCategory.slice(0, -1);
                updateAvatar({ [categoryKey]: item.id });
            }
            return;
        }

        if (!canAfford(item.price)) {
            alert('Not enough coins!');
            return;
        }

        setShowPurchaseModal(item);
    };

    const confirmPurchase = (item) => {
        spendCoins(item.price, `Purchased: ${item.name}`);
        addCosmetic(item.id);

        if (activeCategory === 'characters') {
            updateAvatar({ character: item.id });
        } else {
            const categoryKey = activeCategory.slice(0, -1);
            updateAvatar({ [categoryKey]: item.id });
        }

        setShowPurchaseModal(null);
    };

    const renderItemPreview = (item, size = 64) => {
        if (activeCategory === 'characters') {
            return (
                <PixelAvatar
                    character={item.id}
                    size={size}
                    frame="default"
                />
            );
        }
        if (activeCategory === 'frames') {
            return (
                <PixelAvatar
                    character={user?.avatar?.character || 'warrior'}
                    size={size}
                    frame={item.id}
                />
            );
        }
        return (
            <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-3xl ${item.color ? `bg-gradient-to-br ${item.color}` : 'bg-gray-100'
                }`}>
                {item.preview || item.icon || '🎨'}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="gradient-header p-6 pb-4 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-white">Cosmetics Shop</h1>
                    <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                        <Coins className="text-yellow-300" size={18} />
                        <span className="text-white font-bold">{coins}</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/marketplace')}
                    className="w-full bg-white/20 backdrop-blur p-4 rounded-xl flex items-center gap-4"
                >
                    <div className="bg-white/30 w-10 h-10 rounded-lg flex items-center justify-center">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-semibold text-white">Marketplace</h3>
                        <p className="text-white/70 text-xs">Coming Soon...</p>
                    </div>
                    <span className="badge-coming-soon">NEW</span>
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div className="card flex items-center gap-4">
                    <PixelAvatar
                        character={user?.avatar?.character || 'warrior'}
                        size={80}
                        frame={user?.avatar?.frame || 'default'}
                    />
                    <div>
                        <p className="text-sm text-gray-500">Your Avatar</p>
                        <p className="font-bold text-gray-800">
                            {COSMETICS.characters?.find(c => c.id === (user?.avatar?.character || 'warrior'))?.name || 'Warrior'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? 'bg-primary-100 text-primary-700 font-semibold'
                                : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {items.map(item => {
                        const owned = isOwned(item.id);
                        const equipped = isEquipped(activeCategory, item.id);

                        return (
                            <button
                                key={item.id}
                                onClick={() => handlePurchase(item)}
                                className={`card text-center relative ${equipped ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
                            >
                                {equipped && (
                                    <div className="absolute top-2 right-2 bg-primary-500 w-6 h-6 rounded-full flex items-center justify-center">
                                        <Check className="text-white" size={14} />
                                    </div>
                                )}

                                <div className="mb-3 flex justify-center">
                                    {renderItemPreview(item)}
                                </div>

                                <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>

                                <div className="mt-2">
                                    {owned ? (
                                        <span className="text-sm text-green-600 font-semibold">
                                            {equipped ? 'Equipped' : 'Owned'}
                                        </span>
                                    ) : item.price === 0 ? (
                                        <span className="text-sm text-gray-500">Free</span>
                                    ) : (
                                        <span className="text-sm font-bold text-primary-600 flex items-center gap-1 justify-center">
                                            <Coins size={14} className="text-yellow-500" /> {item.price}
                                        </span>
                                    )}
                                </div>

                                <span className={`mt-2 badge text-xs ${RARITY_COLORS[item.rarity]}`}>
                                    {item.rarity}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showPurchaseModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                    onClick={() => setShowPurchaseModal(null)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-center mb-4">
                            {renderItemPreview(showPurchaseModal, 80)}
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                            {showPurchaseModal.name}
                        </h3>

                        <p className="text-gray-600 text-center mb-4 flex items-center justify-center gap-1">
                            Purchase for <span className="font-bold text-primary-600 flex items-center gap-1">{showPurchaseModal.price} <Coins size={14} className="text-yellow-500" /></span>?
                        </p>

                        <p className="text-sm text-gray-500 text-center mb-6">
                            You have {coins} coins
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPurchaseModal(null)}
                                className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => confirmPurchase(showPurchaseModal)}
                                className="flex-1 btn-primary py-3"
                            >
                                Buy & Equip
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
