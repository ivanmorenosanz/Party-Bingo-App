import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Crown, Medal, Users, Calendar, Copy, Check, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Header from '../../components/navigation/Header';
import { getLeagueById, getLeaderboard } from '../../data/leagues';

// Simulated users for testing invites
const SIMULATED_USERS = [
    { name: 'Emma', avatar: '👩' },
    { name: 'James', avatar: '👨' },
    { name: 'Sofia', avatar: '👧' },
    { name: 'Liam', avatar: '👦' },
    { name: 'Olivia', avatar: '👩‍🦰' },
];

export default function LeagueDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [showSimulateModal, setShowSimulateModal] = useState(false);
    const [simulatedJoins, setSimulatedJoins] = useState([]);
    const [league, setLeague] = useState(null);

    useEffect(() => {
        const foundLeague = getLeagueById(id);
        if (foundLeague) {
            setLeague({ ...foundLeague });
        }
    }, [id]);

    if (!league) {
        return null;
    }

    // Combine original members with simulated joins
    const allMembers = [...league.members, ...simulatedJoins];
    const leaderboard = [...allMembers].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.coins - a.coins;
    });

    const copyCode = async () => {
        await navigator.clipboard.writeText(league.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const simulateJoin = () => {
        // Pick a random user that hasn't joined yet
        const availableUsers = SIMULATED_USERS.filter(
            u => !simulatedJoins.some(j => j.name === u.name)
        );

        if (availableUsers.length === 0) {
            alert('All simulated users have already joined!');
            return;
        }

        const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];

        const newMember = {
            id: `sim_${Date.now()}`,
            name: randomUser.name,
            wins: 0,
            gamesPlayed: 0,
            coins: 0,
            isOwner: false,
            isSimulated: true,
        };

        setSimulatedJoins(prev => [...prev, newMember]);
        setShowSimulateModal(false);
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
                        <p className="text-2xl font-bold text-gray-800">{allMembers.length}</p>
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

                {/* Simulate Join Button for Testing */}
                <button
                    onClick={() => setShowSimulateModal(true)}
                    className="w-full card flex items-center justify-center gap-3 bg-green-50 border-2 border-green-200 text-green-700 font-semibold"
                >
                    <UserPlus size={20} />
                    <span>Simulate Friend Joining</span>
                </button>

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
                                className={`flex items-center justify-between p-3 rounded-xl ${member.name === 'You' ? 'bg-primary-50 border border-primary-200' :
                                        member.isSimulated ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
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
                                        <p className="font-semibold text-gray-800">
                                            {member.name}
                                            {member.isSimulated && (
                                                <span className="ml-2 text-xs text-green-600">(simulated)</span>
                                            )}
                                        </p>
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

            {/* Simulate Join Modal */}
            {showSimulateModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                    onClick={() => setShowSimulateModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-5xl text-center mb-4">🧪</div>
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                            Simulate Join
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            This will simulate a friend joining your league using the invite code.
                        </p>
                        <div className="bg-gray-100 p-4 rounded-xl mb-6 text-center">
                            <p className="text-xs text-gray-500 mb-1">Available test users:</p>
                            <div className="flex justify-center gap-2 flex-wrap">
                                {SIMULATED_USERS.filter(u => !simulatedJoins.some(j => j.name === u.name)).map(u => (
                                    <span key={u.name} className="text-sm">{u.avatar} {u.name}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSimulateModal(false)}
                                className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={simulateJoin}
                                className="flex-1 btn-primary py-3"
                            >
                                Add Random User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
