import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Star, TrendingUp, Coins, Banknote } from 'lucide-react';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import { COMMUNITY_BINGOS, BINGO_CATEGORIES, getBingosByType, searchBingos } from '../../data/bingos';

export default function CommunityPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all'); // all, fun, serious
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    let bingos = getBingosByType(activeTab);

    if (searchQuery) {
        bingos = searchBingos(searchQuery);
    }

    if (selectedCategory !== 'all') {
        bingos = bingos.filter(b => b.tags.includes(selectedCategory));
    }

    return (
        <div className="min-h-screen pb-24">
            <div className="gradient-header p-6 pb-4 rounded-b-3xl shadow-lg">
                <h1 className="text-2xl font-bold text-white mb-4">Community Bingos</h1>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                    <input
                        type="text"
                        placeholder="Search bingos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-glass pl-12"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                    {[
                        { id: 'all', label: 'All', icon: null },
                        { id: 'fun', label: 'Fun (Free)', icon: Sparkles },
                        { id: 'coins', label: 'In-Game Money', icon: Coins },
                        { id: 'cash', label: 'Real Money', icon: Banknote }, // Need to import Banknote
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                            >
                                {Icon && <Icon size={16} />}
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
                    {BINGO_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === cat.id
                                ? 'bg-primary-100 text-primary-700 font-semibold'
                                : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Create Your Own CTA */}
                <button
                    onClick={() => navigate('/create-bingo')}
                    className="w-full bg-gradient-to-r from-primary-500 to-accent-500 p-4 rounded-2xl text-white flex items-center gap-4"
                >
                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center">
                        <Sparkles size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold">Create & Earn</h3>
                        <p className="text-white/80 text-sm">Make bingos, earn coins!</p>
                    </div>
                </button>

                {/* Bingo List */}
                <div className="space-y-3">
                    {bingos.map(bingo => (
                        <button
                            key={bingo.id}
                            onClick={() => navigate(`/community/${bingo.id}`)}
                            className="w-full card text-left transform transition-transform hover:scale-[1.01]"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon / Type Identifier */}
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-inner ${bingo.type === 'cash' ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
                                    bingo.type === 'coins' ? 'bg-gradient-to-br from-yellow-300 to-amber-500' :
                                        'bg-gradient-to-br from-primary-400 to-purple-500'
                                    }`}>
                                    {bingo.type === 'cash' ? '💵' : bingo.type === 'coins' ? '🪙' : '🎉'}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-800 line-clamp-1">{bingo.title}</h3>
                                        {/* Type Badges */}
                                        {bingo.type === 'cash' && (
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-green-200">
                                                Real Money
                                            </span>
                                        )}
                                        {bingo.type === 'coins' && (
                                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-yellow-200">
                                                Coins
                                            </span>
                                        )}
                                        {bingo.type === 'fun' && (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-blue-200">
                                                Free
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-500">by {bingo.creator}</p>

                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1 text-sm text-gray-500">
                                            <TrendingUp size={14} />
                                            {bingo.plays}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm text-yellow-500">
                                            <Star size={14} fill="currentColor" />
                                            {bingo.rating}
                                        </span>

                                        {/* Price Display */}
                                        <div className="flex-1 text-right">
                                            {bingo.type === 'cash' ? (
                                                <span className="text-sm font-bold text-green-600 flex items-center justify-end gap-1">
                                                    💵 ${bingo.price.toFixed(2)}
                                                </span>
                                            ) : bingo.type === 'coins' ? (
                                                <span className="text-sm font-bold text-yellow-600 flex items-center justify-end gap-1">
                                                    🪙 {bingo.price}
                                                </span>
                                            ) : (
                                                <span className="text-sm font-bold text-blue-500">
                                                    Free
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {bingos.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Bingos Found</h3>
                        <p className="text-gray-500">Try a different search or category</p>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
