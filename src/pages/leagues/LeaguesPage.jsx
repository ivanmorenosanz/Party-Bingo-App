import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trophy, Users, ChevronRight } from 'lucide-react';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import { getUserLeagues, getLeaderboard, joinLeague } from '../../data/leagues';
import { useAuth } from '../../context/AuthContext';

export default function LeaguesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [leagueCode, setLeagueCode] = useState('');

    // Get leagues for the current user
    const myLeagues = getUserLeagues(user?.id);

    const handleCreateLeague = () => {
        navigate('/create-league');
    };

    const handleJoinLeague = () => {
        if (leagueCode.length >= 4 && user) {
            const result = joinLeague(leagueCode, user.id, user.username);
            if (result.success) {
                setShowJoinModal(false);
                setLeagueCode('');
                navigate(`/leagues/${result.league.id}`);
            } else {
                alert(result.error);
            }
        }
    };

    return (
        <div className="min-h-screen pb-24">
            <Header title="Leagues" showCoins />

            <div className="p-6 space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleCreateLeague}
                        className="card flex items-center gap-3 hover:scale-[1.02] transition-transform"
                    >
                        <div className="bg-primary-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <Plus className="text-primary-600" size={20} />
                        </div>
                        <span className="font-semibold text-gray-800">Create League</span>
                    </button>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="card flex items-center gap-3 hover:scale-[1.02] transition-transform"
                    >
                        <div className="bg-accent-100 w-10 h-10 rounded-full flex items-center justify-center">
                            <Users className="text-accent-600" size={20} />
                        </div>
                        <span className="font-semibold text-gray-800">Join League</span>
                    </button>
                </div>

                {/* My Leagues */}
                {myLeagues.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">My Leagues</h2>
                        <div className="space-y-3">
                            {myLeagues.map(league => {
                                const leaderboard = getLeaderboard(league);
                                const myRank = leaderboard.findIndex(m => m.id === user?.id) + 1;

                                return (
                                    <button
                                        key={league.id}
                                        onClick={() => navigate(`/leagues/${league.id}`)}
                                        className="w-full card flex items-center gap-4 text-left"
                                    >
                                        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 w-14 h-14 rounded-xl flex items-center justify-center">
                                            <Trophy className="text-white" size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800">{league.name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-sm text-gray-500">
                                                    {league.members.length} members
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {league.gamesPlayed} games
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-2xl font-bold ${myRank === 1 ? 'text-yellow-500' :
                                                myRank === 2 ? 'text-gray-400' :
                                                    myRank === 3 ? 'text-orange-400' : 'text-primary-600'
                                                }`}>
                                                #{myRank || '-'}
                                            </span>
                                            <ChevronRight className="text-gray-400 ml-auto" size={20} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {myLeagues.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Leagues Yet</h3>
                        <p className="text-gray-500 mb-6">Create or join a league to compete with friends!</p>
                        <button onClick={handleCreateLeague} className="btn-primary">
                            Create Your First League
                        </button>
                    </div>
                )}
            </div>

            {/* Join Modal */}
            {showJoinModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                    onClick={() => setShowJoinModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Join League</h3>
                        <input
                            type="text"
                            placeholder="Enter league code"
                            value={leagueCode}
                            onChange={(e) => setLeagueCode(e.target.value.toUpperCase())}
                            className="input-field mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="flex-1 py-3 rounded-xl font-semibold text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleJoinLeague}
                                className="flex-1 btn-primary py-3"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
