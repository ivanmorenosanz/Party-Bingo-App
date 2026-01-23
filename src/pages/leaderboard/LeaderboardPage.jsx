import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Target, Flame, ChevronRight, User, Medal, Crown } from 'lucide-react';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { getRankTier, TIMEFRAMES } from '../../utils/leaderboard';

const API_BASE = 'http://localhost:3001/api';

export default function LeaderboardPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('weekly');
    const [entries, setEntries] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // Fetch leaderboard
                const res = await fetch(`${API_BASE}/leaderboard?timeframe=${activeTab}`);
                const data = await res.json();
                setEntries(data.entries || []);

                // Fetch user's rank
                if (user?.id) {
                    const userRes = await fetch(`${API_BASE}/leaderboard/user/${user.id}?timeframe=${activeTab}`);
                    const userData = await userRes.json();
                    setUserRank(userData);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            }
            setLoading(false);
        };

        fetchLeaderboard();
    }, [activeTab, user?.id]);

    const tabs = [
        { id: 'daily', label: '🕒 Daily' },
        { id: 'weekly', label: '📅 Weekly' },
        { id: 'all_time', label: '🏆 All-Time' },
    ];

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="text-yellow-500" size={20} />;
        if (rank === 2) return <Medal className="text-gray-400" size={20} />;
        if (rank === 3) return <Medal className="text-amber-600" size={20} />;
        return <span className="text-gray-500 font-bold">#{rank}</span>;
    };

    return (
        <div className="min-h-screen pb-24">
            <div className="gradient-header p-6 pb-4 rounded-b-3xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <Trophy className="text-yellow-300" size={28} />
                    <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* User's Rank Card */}
                {userRank?.rank && (
                    <div className="card bg-gradient-to-r from-primary-500 to-accent-500 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm">Your Rank</p>
                                    <p className="text-2xl font-bold">#{userRank.rank}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white/80 text-sm">Score</p>
                                <p className="text-xl font-bold">{userRank.entry?.score || 0}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Rankings Yet</h3>
                        <p className="text-gray-500">Be the first to place predictions!</p>
                    </div>
                ) : (
                    /* Leaderboard List */
                    <div className="space-y-2">
                        {entries.map((entry, index) => {
                            const tier = getRankTier(entry.rank);
                            const isCurrentUser = entry.userId === user?.id;

                            return (
                                <button
                                    key={entry.userId}
                                    onClick={() => navigate(`/profile/${entry.userId}`)}
                                    className={`w-full card flex items-center gap-4 transition-all hover:scale-[1.01] ${isCurrentUser ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                                        } ${index < 3 ? tier.bg : ''}`}
                                >
                                    {/* Rank */}
                                    <div className="w-10 flex items-center justify-center">
                                        {getRankIcon(entry.rank)}
                                    </div>

                                    {/* Avatar & Name */}
                                    <div className="flex-1 text-left">
                                        <p className={`font-bold ${isCurrentUser ? 'text-primary-600' : 'text-gray-800'}`}>
                                            {entry.username}
                                            {isCurrentUser && <span className="text-xs ml-2">(You)</span>}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Target size={12} /> {entry.totalPredictions}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <TrendingUp size={12} /> {entry.winRate?.toFixed(1)}%
                                            </span>
                                            {entry.currentStreak > 0 && (
                                                <span className="flex items-center gap-1 text-orange-500">
                                                    <Flame size={12} /> {entry.currentStreak}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-800">{entry.score}</p>
                                        <p className="text-xs text-gray-400">Score</p>
                                    </div>

                                    <ChevronRight className="text-gray-300" size={18} />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
