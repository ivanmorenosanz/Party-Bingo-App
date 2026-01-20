import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Crown, Medal, Users, Calendar, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Header from '../../components/navigation/Header';
import { getLeagueById, getLeaderboard } from '../../data/leagues';

export default function LeagueDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const league = getLeagueById(id);

    if (!league) {
        navigate('/leagues');
        return null;
    }

    const leaderboard = getLeaderboard(league);

    const copyCode = async () => {
        await navigator.clipboard.writeText(league.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                        <p className="text-2xl font-bold text-gray-800">{league.gamesPlayed}</p>
                        <p className="text-xs text-gray-500">Games</p>
                    </div>
                    <div className="card text-center">
                        <Calendar className="mx-auto text-accent-500 mb-2" size={24} />
                        <p className="text-sm font-bold text-gray-800">{new Date(league.lastPlayed).toLocaleDateString()}</p>
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
                    <div className="flex items-end justify-center gap-2 mb-6">
                        {/* 2nd Place */}
                        {leaderboard[1] && (
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                                    {leaderboard[1].name[0]}
                                </div>
                                <p className="font-semibold text-sm text-gray-800">{leaderboard[1].name}</p>
                                <p className="text-xs text-gray-500">{leaderboard[1].wins} wins</p>
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
                                <p className="text-xs text-gray-500">{leaderboard[0].wins} wins</p>
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
                                <p className="text-xs text-gray-500">{leaderboard[2].wins} wins</p>
                                <div className="bg-orange-300 h-12 w-16 rounded-t-lg mt-2 flex items-center justify-center">
                                    <span className="text-xl">🥉</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Full List */}
                    <div className="space-y-2">
                        {leaderboard.map((member, index) => (
                            <div
                                key={member.id}
                                className={`flex items-center justify-between p-3 rounded-xl ${member.name === 'You' ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
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
                                        <p className="text-xs text-gray-500">{member.gamesPlayed} games played</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">{member.wins} wins</p>
                                    <p className="text-xs text-green-600">🪙 {member.coins}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <button className="w-full btn-primary">
                    Start League Game
                </button>
            </div>
        </div>
    );
}
