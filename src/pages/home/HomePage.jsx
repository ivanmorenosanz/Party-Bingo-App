import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Trophy, Sparkles, Play, Timer, Coins, X, TrendingUp } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useGame } from '../../context/GameContext';
import { useBingo } from '../../context/BingoContext';
import BottomNav from '../../components/navigation/BottomNav';
import { getUserLeagues, getLeaderboard } from '../../data/leagues';

export default function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { coins, cash, transactions } = useWallet();
    const { bingos } = useBingo();
    const { activeGames } = useGame();
    const [showBuyCoinsModal, setShowBuyCoinsModal] = useState(false);
    const [showBuyCashModal, setShowBuyCashModal] = useState(false);

    // Countdown Logic
    const [timeLeft, setTimeLeft] = useState({});

    const calculateTimeLeft = (endTime) => {
        const difference = new Date(endTime) - new Date();
        if (difference <= 0) return null;

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = {};
            bingos.forEach(bingo => {
                if (bingo.endsAt) {
                    const left = calculateTimeLeft(bingo.endsAt);
                    if (left) newTimeLeft[bingo.id] = left;
                }
            });
            setTimeLeft(newTimeLeft);
        }, 60000); // Update every minute

        // Initial calculation
        const initialTimeLeft = {};
        bingos.forEach(bingo => {
            if (bingo.endsAt) {
                const left = calculateTimeLeft(bingo.endsAt);
                if (left) initialTimeLeft[bingo.id] = left;
            }
        });
        setTimeLeft(initialTimeLeft);

        return () => clearInterval(timer);
    }, [bingos]);

    const featuredBingos = bingos.filter(b => b.featured && (!b.endsAt || calculateTimeLeft(b.endsAt)));
    const trendingBingos = bingos.filter(b => !b.featured).slice(0, 5); // Show top 5 trending non-featured
    const myActiveGames = activeGames.filter(g => g.status !== 'finished');

    // Get user's leagues
    const myLeagues = user?.id ? getUserLeagues(user.id) : [];
    const featuredLeague = myLeagues[0];
    const featuredLeagueRank = featuredLeague
        ? getLeaderboard(featuredLeague).findIndex(m => m.id === user.id) + 1
        : 0;

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="gradient-header p-4 pb-2 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-white">Hey, {user?.username}! 👋</h1>
                        <p className="text-white/80 text-xs">Ready to predict?</p>
                    </div>
                    <div className="flex items-center gap-1">
                        {/* Cash Badge with + Button */}
                        <div className="bg-white/20 backdrop-blur px-2 py-1.5 rounded-l-full flex items-center gap-1.5">
                            <span className="bg-green-500 rounded-full w-4 h-4 flex items-center justify-center text-white font-bold text-[10px]">$</span>
                            <span className="text-white font-bold text-sm">${(cash || 0).toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => setShowBuyCashModal(true)}
                            className="bg-green-400 hover:bg-green-500 p-1.5 rounded-r-full transition-colors mr-2"
                        >
                            <Plus size={14} className="text-green-900" />
                        </button>

                        {/* Coins Badge with + Button */}
                        <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-l-full flex items-center gap-1.5">
                            <Coins className="text-yellow-300" size={14} />
                            <span className="text-white font-bold text-sm">{coins}</span>
                        </div>
                        <button
                            onClick={() => setShowBuyCoinsModal(true)}
                            className="bg-yellow-400 hover:bg-yellow-500 p-1.5 rounded-r-full transition-colors"
                        >
                            <Plus size={14} className="text-yellow-900" />
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-2 mb-2">
                    {/* Compact Wins */}
                    <div className="flex-1 bg-white/20 backdrop-blur rounded-xl p-1.5 flex items-center justify-between px-3">
                        <span className="text-white/80 text-[10px] font-medium uppercase tracking-wider">Wins</span>
                        <span className="text-lg font-bold text-white leading-none">{user?.stats?.gamesWon || 0}</span>
                    </div>

                    {/* Compact Streak */}
                    <div className="flex-1 bg-white/20 backdrop-blur rounded-xl p-1.5 flex items-center justify-between px-3">
                        <span className="text-white/80 text-[10px] font-medium uppercase tracking-wider">Streak 🔥</span>
                        <span className="text-lg font-bold text-white leading-none">{user?.stats?.currentStreak || 0}</span>
                    </div>
                </div>

                {/* Bottom Row Removed (Moved to Profile) */}
            </div>


            {/* Content */}
            <div className="p-6 space-y-6">

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/create-room')}
                        className="relative h-48 rounded-3xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/90 to-primary-600/90 z-10"></div>
                        <div
                            className="absolute inset-0 opacity-20 z-0 bg-repeat bg-[length:100px_100px]"
                            style={{ backgroundImage: 'url(/bingo_pattern.png)' }}
                        ></div>

                        <div className="relative z-20 h-full flex flex-col items-center justify-center text-white p-4">
                            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <Plus className="text-white" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-1">Create Room</h3>
                            <p className="text-primary-100 text-sm">Start a new game</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/join-room')}
                        className="relative h-48 rounded-3xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/90 to-accent-600/90 z-10"></div>
                        <div
                            className="absolute inset-0 opacity-20 z-0 bg-repeat bg-[length:100px_100px]"
                            style={{ backgroundImage: 'url(/bingo_pattern.png)' }}
                        ></div>

                        <div className="relative z-20 h-full flex flex-col items-center justify-center text-white p-4">
                            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <Users className="text-white" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-1">Join Room</h3>
                            <p className="text-accent-100 text-sm">Enter room code</p>
                        </div>
                    </button>
                </div>

                {/* Active Bingos */}
                {myActiveGames.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Play size={24} className="text-primary-600" />
                            Active Bingos
                        </h2>
                        <div className="space-y-3">
                            {myActiveGames.map(game => (
                                <button
                                    key={game.code}
                                    onClick={() => navigate(game.status === 'playing' ? `/play/${game.code}` : `/room/${game.code}`)}
                                    className="w-full card border-l-4 border-l-primary-500 flex items-center justify-between group"
                                >
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                                            {game.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                            <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-mono">
                                                {game.code}
                                            </span>
                                            {game.status === 'playing' && game.timeLimit > 0 && (
                                                <span className="flex items-center gap-1 text-orange-500">
                                                    <Timer size={12} />
                                                    Timed
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="bg-primary-50 p-2 rounded-full text-primary-600">
                                        <Play size={20} fill="currentColor" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Featured Bingos */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Sparkles size={24} className="text-yellow-500" />
                        Featured Bingos
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                        {featuredBingos.map(bingo => (
                            <button
                                key={bingo.id}
                                onClick={() => navigate(`/community/${bingo.id}`)}
                                className="min-w-[260px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-shrink-0 text-left relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 z-10 flex flex-col items-end gap-1">
                                    {bingo.seasonal && (
                                        <div className="bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                            {bingo.badge || 'Seasonal'}
                                        </div>
                                    )}
                                    {/* Timer Badge */}
                                    {bingo.endsAt && timeLeft[bingo.id] && (
                                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-l-xl flex items-center gap-1 animate-pulse">
                                            <Timer size={12} />
                                            {timeLeft[bingo.id]}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3 pt-6"> {/* Added padding top if badges overlap */}
                                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary-600 transition-colors line-clamp-1">
                                        {bingo.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{bingo.tags[0]}</span>
                                        <span>• {bingo.plays} plays</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-1 opacity-60">
                                    {(bingo.items || []).slice(0, 3).map((item, i) => (
                                        <div key={i} className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-1 text-[8px] text-center border border-gray-100">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leagues Preview */}
                {featuredLeague && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Your Leagues</h2>
                            <button
                                onClick={() => navigate('/leagues')}
                                className="text-primary-600 font-semibold text-sm"
                            >
                                View All
                            </button>
                        </div>
                        <button
                            onClick={() => navigate(`/leagues/${featuredLeague.id}`)}
                            className="w-full card flex items-center gap-4"
                        >
                            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                                <Trophy className="text-yellow-600" size={24} />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-bold text-gray-800">{featuredLeague.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {featuredLeague.members.length} members • #{featuredLeagueRank} on leaderboard
                                </p>
                            </div>
                            <span className="text-primary-600 font-bold">#{featuredLeagueRank}</span>
                        </button>
                    </div>
                )}

                {/* Trending Bingos */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp size={24} className="text-primary-600" />
                            Trending Bingos
                        </h2>
                        <button
                            onClick={() => navigate('/community')}
                            className="text-primary-600 font-semibold text-sm"
                        >
                            Browse All
                        </button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                        {trendingBingos.map(bingo => (
                            <button
                                key={bingo.id}
                                onClick={() => navigate(`/community/${bingo.id}`)}
                                className="min-w-[220px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-shrink-0 text-left relative overflow-hidden group"
                            >
                                <div className="mb-3">
                                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary-600 transition-colors line-clamp-1">
                                        {bingo.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{bingo.tags?.[0] || 'Bingo'}</span>
                                        <span>• {bingo.plays || 0} plays</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-1 opacity-60">
                                    {(bingo.items || []).slice(0, 3).map((item, i) => (
                                        <div key={i} className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-1 text-[8px] text-center border border-gray-100">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Create Your Own */}

            </div>

            <BottomNav />

            {/* Buy Coins Modal with Watch Ad */}
            {
                showBuyCoinsModal && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                        onClick={() => setShowBuyCoinsModal(false)}
                    >
                        <div
                            className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Get More Coins</h3>
                                <button
                                    onClick={() => setShowBuyCoinsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Watch Ad Option */}
                                <button
                                    onClick={() => {
                                        // Simulate watching ad - in production integrate AdMob/Unity Ads
                                        alert('🎬 Watching ad... (In production, this would show a real ad)');
                                        // Award coins after "ad"
                                        setTimeout(() => {
                                            alert('🎉 You earned 10 coins!');
                                            // TODO: Call earnCoins(10, 'Watched Ad') when wallet context is available
                                            setShowBuyCoinsModal(false);
                                        }, 500);
                                    }}
                                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-xl text-white flex items-center gap-4 hover:scale-[1.02] transition-transform"
                                >
                                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl">🎬</span>
                                    </div>
                                    <div className="text-left flex-1">
                                        <h4 className="font-bold">Watch Ad</h4>
                                        <p className="text-white/80 text-sm">Earn 10 coins for free!</p>
                                    </div>
                                    <span className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm">
                                        +10 🪙
                                    </span>
                                </button>

                                {/* Coming Soon */}
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-sm text-gray-500 mb-2">More options coming soon!</p>
                                    <p className="text-xs text-gray-400">Win predictions to earn more coins</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowBuyCoinsModal(false)}
                                className="w-full btn-secondary mt-4"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Buy Cash Modal (Coming Soon) */}
            {
                showBuyCashModal && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                        onClick={() => setShowBuyCashModal(false)}
                    >
                        <div
                            className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Add Cash</h3>
                                <button
                                    onClick={() => setShowBuyCashModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="text-center py-8">
                                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl">💵</span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 mb-2">Coming Soon!</h4>
                                <p className="text-gray-600 mb-4">
                                    Cash deposits will be available in a future update. You'll be able to add real money to trade in cash markets.
                                </p>
                                <div className="bg-green-50 rounded-xl p-4">
                                    <p className="text-sm text-green-700 font-medium">
                                        💡 For now, use Coins markets to practice!
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowBuyCashModal(false)}
                                className="w-full btn-primary"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
