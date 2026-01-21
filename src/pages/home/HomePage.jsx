import { useNavigate } from 'react-router-dom';
import { Plus, Users, Trophy, Sparkles, Play, Timer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useGame } from '../../context/GameContext';
import BottomNav from '../../components/navigation/BottomNav';
import { COMMUNITY_BINGOS } from '../../data/bingos';
import { getUserLeagues, getLeaderboard } from '../../data/leagues';

export default function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { coins } = useWallet();
    const { activeGames } = useGame();

    const featuredBingos = COMMUNITY_BINGOS.slice(0, 3);
    const myActiveGames = activeGames.filter(g => g.status !== 'finished');

    // Get user's leagues
    const myLeagues = user?.id ? getUserLeagues(user.id) : [];
    const featuredLeague = myLeagues[0];
    const featuredLeagueRank = featuredLeague
        ? getLeaderboard(featuredLeague).findIndex(m => m.id === user.id) + 1
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="gradient-header p-6 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Hey, {user?.username}! 👋</h1>
                        <p className="text-white/80">Ready to predict?</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="text-lg">🪙</span>
                        <span className="text-white font-bold">{coins}</span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-white">{user?.stats?.gamesWon || 0}</p>
                        <p className="text-white/80 text-xs">Wins</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-white">{user?.stats?.currentStreak || 0}</p>
                        <p className="text-white/80 text-xs">Streak 🔥</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-white">{user?.rewards?.length || 0}</p>
                        <p className="text-white/80 text-xs">Badges</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Active Games */}
                {myActiveGames.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Play size={24} className="text-primary-600" />
                            Active Games
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

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/create-room')}
                        className="card hover:scale-[1.02] transition-transform"
                    >
                        <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                            <Plus className="text-primary-600" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800">Create Room</h3>
                        <p className="text-sm text-gray-500 mt-1">Start a new game</p>
                    </button>

                    <button
                        onClick={() => navigate('/join-room')}
                        className="card hover:scale-[1.02] transition-transform"
                    >
                        <div className="bg-accent-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                            <Users className="text-accent-600" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800">Join Room</h3>
                        <p className="text-sm text-gray-500 mt-1">Enter room code</p>
                    </button>
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
                        <h2 className="text-xl font-bold text-gray-800">Trending Bingos</h2>
                        <button
                            onClick={() => navigate('/community')}
                            className="text-primary-600 font-semibold text-sm"
                        >
                            Browse All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {featuredBingos.map(bingo => (
                            <button
                                key={bingo.id}
                                onClick={() => navigate(`/community/${bingo.id}`)}
                                className="w-full card flex items-center gap-4 text-left"
                            >
                                <div className="bg-gradient-to-br from-primary-400 to-accent-400 w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl">
                                    {bingo.type === 'serious' ? '🎯' : '🎉'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800">{bingo.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-gray-500">by {bingo.creator}</span>
                                        {bingo.type === 'serious' && (
                                            <span className="badge-primary text-xs">Competitive</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-primary-600 font-bold">{bingo.plays}</p>
                                    <p className="text-xs text-gray-500">plays</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Create Your Own */}
                <button
                    onClick={() => navigate('/create-bingo')}
                    className="w-full bg-gradient-to-r from-primary-500 to-accent-500 p-6 rounded-2xl shadow-lg text-white flex items-center gap-4"
                >
                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center">
                        <Sparkles size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className="font-bold text-lg">Create Your Own Bingo</h3>
                        <p className="text-white/80 text-sm">Share with the community & earn coins!</p>
                    </div>
                </button>
            </div>

            <BottomNav />
        </div>
    );
}
