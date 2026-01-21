import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Crown, Medal, Users, Calendar, Copy, Check, Play, X, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import Header from '../../components/navigation/Header';
import { getLeagueById, getLeaderboard } from '../../data/leagues';
import { COMMUNITY_BINGOS } from '../../data/bingos';
import { useAuth } from '../../context/AuthContext';

export default function LeagueDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    const [league, setLeague] = useState(null);
    const [showStartGameModal, setShowStartGameModal] = useState(false);
    const [selectedBingo, setSelectedBingo] = useState(null);

    const [loading, setLoading] = useState(true);

    // Refresh league data periodically
    useEffect(() => {
        const loadLeague = () => {
            const foundLeague = getLeagueById(id);
            if (foundLeague) {
                setLeague({ ...foundLeague });
            }
            setLoading(false);
        };

        loadLeague();

        // Refresh every 2 seconds to pick up score updates
        const interval = setInterval(loadLeague, 2000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-primary-600 font-semibold">Loading league...</div>
            </div>
        );
    }

    if (!league) {
        return (
            <div className="min-h-screen bg-gray-50 pb-6">
                <Header title="League Not Found" showBack backPath="/leagues" />
                <div className="p-6 text-center text-gray-500">
                    <p>This league could not be found.</p>
                    <p className="text-xs mt-2">ID: {id}</p>
                </div>
            </div>
        );
    }

    const leaderboard = getLeaderboard(league);

    const copyCode = async () => {
        await navigator.clipboard.writeText(league.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStartGame = () => {
        // Navigate to create room page with league context
        navigate(`/create?leagueId=${league.id}&leagueName=${encodeURIComponent(league.name)}`);
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="text-yellow-500" size={24} />;
        if (rank === 2) return <Medal className="text-gray-400" size={24} />;
        if (rank === 3) return <Medal className="text-orange-400" size={24} />;
        return <span className="text-gray-500 font-bold">#{rank}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            <Header title={league.name} showBack backPath="/leagues" />

            <div className="p-6 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="card text-center">
                        <Users className="mx-auto text-primary-600 mb-2" size={24} />
                        <p className="text-2xl font-bold text-gray-800">{league.members.length}</p>
                        <p className="text-xs text-gray-500">Members</p>
                    </div>
                    <div className="card text-center">
                        <Trophy className="mx-auto text-yellow-500 mb-2" size={24} />
                        <p className="text-2xl font-bold text-gray-800">{league.gamesPlayed || 0}</p>
                        <p className="text-xs text-gray-500">Games</p>
                    </div>
                    <div className="card text-center">
                        <Calendar className="mx-auto text-accent-500 mb-2" size={24} />
                        <p className="text-sm font-bold text-gray-800">{league.lastPlayed ? new Date(league.lastPlayed).toLocaleDateString() : 'Never'}</p>
                        <p className="text-xs text-gray-500">Last Played</p>
                    </div>
                </div>

                {/* Invite Code */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">League Code</p>
                            <p className="text-2xl font-bold text-primary-600 tracking-wider">{league.code}</p>
                        </div>
                        <button
                            onClick={copyCode}
                            className="bg-primary-100 p-3 rounded-xl"
                        >
                            {copied ? (
                                <Check className="text-green-600" size={20} />
                            ) : (
                                <Copy className="text-primary-600" size={20} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="card">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={20} />
                        Leaderboard
                    </h3>

                    {/* Top 3 Podium */}
                    {leaderboard.length >= 1 && (
                        <div className="flex items-end justify-center gap-2 mb-6">
                            {/* 2nd Place */}
                            {leaderboard[1] && (
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                                        {leaderboard[1].name[0]}
                                    </div>
                                    <p className="font-semibold text-sm text-gray-800">{leaderboard[1].name}</p>
                                    <p className="text-xs text-primary-600 font-bold">{leaderboard[1].totalScore || 0} pts</p>
                                    <div className="bg-gray-200 h-16 w-16 rounded-t-lg mt-2 flex items-center justify-center">
                                        <span className="text-xl">🥈</span>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place */}
                            {leaderboard[0] && (
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2 ring-4 ring-yellow-200">
                                        {leaderboard[0].name[0]}
                                    </div>
                                    <p className="font-bold text-gray-800">{leaderboard[0].name}</p>
                                    <p className="text-xs text-primary-600 font-bold">{leaderboard[0].totalScore || 0} pts</p>
                                    <div className="bg-yellow-400 h-24 w-20 rounded-t-lg mt-2 flex items-center justify-center">
                                        <span className="text-2xl">🥇</span>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {leaderboard[2] && (
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                                        {leaderboard[2].name[0]}
                                    </div>
                                    <p className="font-semibold text-sm text-gray-800">{leaderboard[2].name}</p>
                                    <p className="text-xs text-primary-600 font-bold">{leaderboard[2].totalScore || 0} pts</p>
                                    <div className="bg-orange-300 h-12 w-16 rounded-t-lg mt-2 flex items-center justify-center">
                                        <span className="text-xl">🥉</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Full List */}
                    <div className="space-y-2">
                        {leaderboard.map((member, index) => (
                            <div
                                key={member.id}
                                className={`flex items-center justify-between p-3 rounded-xl ${member.id === user?.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 flex justify-center">
                                        {getRankIcon(index + 1)}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                                        {member.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{member.name}</p>
                                        <p className="text-xs text-gray-500">{member.gamesPlayed || 0} games played</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary-600">{member.totalScore || 0} pts</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Coins size={12} className="text-yellow-500" /> {member.coins || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {leaderboard.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No members yet</p>
                    )}
                </div>

                {/* Actions */}
                <button
                    onClick={() => setShowStartGameModal(true)}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                >
                    <Play size={20} />
                    Start League Game
                </button>
            </div>

            {/* Start Game Modal */}
            {showStartGameModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                    onClick={() => setShowStartGameModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Start League Game</h3>
                            <button
                                onClick={() => setShowStartGameModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">Select a bingo template for this game:</p>

                        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                            {COMMUNITY_BINGOS.map(bingo => (
                                <button
                                    key={bingo.id}
                                    onClick={() => setSelectedBingo(bingo)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedBingo?.id === bingo.id
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${bingo.type === 'fun' ? 'bg-yellow-100' : 'bg-blue-100'
                                            }`}>
                                            {bingo.type === 'fun' ? '🎉' : '🎯'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800">{bingo.title}</h4>
                                            <p className="text-sm text-gray-500">
                                                {bingo.gridSize}×{bingo.gridSize} • {bingo.type === 'fun' ? 'Fun' : 'Competitive'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">{bingo.plays} plays</p>
                                            <p className="text-xs text-yellow-500">★ {bingo.rating}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                onClick={() => setShowStartGameModal(false)}
                                className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartGame}
                                disabled={!selectedBingo}
                                className={`flex-1 btn-primary py-3 flex items-center justify-center gap-2 ${!selectedBingo ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <Play size={18} />
                                Start Game
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
