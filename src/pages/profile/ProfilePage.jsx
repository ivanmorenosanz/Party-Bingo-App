import { useNavigate, useParams } from 'react-router-dom';
import { Settings, ChevronRight, LogOut, Trophy, Coins, Gift, User, Edit2, Copy, BarChart2, Star, Shield, Newspaper, Briefcase } from 'lucide-react';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { usePositions } from '../../context/PositionsContext';
import { userAPI, tradeAPI } from '../../api/client';
import { getCosmeticById } from '../../data/cosmetics';
import PixelAvatar from '../../components/avatar/PixelAvatar';
import { calculateURS, calculateAS, calculatePS, getURSTier, formatScore } from '../../utils/reputation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { user: currentUser, logout } = useAuth();
    const { coins, transactions: walletTransactions, earnCoins } = useWallet();
    const { positions } = usePositions();

    // State for public profile
    const [profileUser, setProfileUser] = useState(null);
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(false);

    const isOwnProfile = !userId || userId === currentUser?.id;
    const user = isOwnProfile ? currentUser : profileUser;

    // Load public profile data
    useEffect(() => {
        const loadProfile = async () => {
            if (!userId || userId === currentUser?.id) return;

            setLoading(true);
            try {
                const fetchedUser = await userAPI.getUser(userId);
                setProfileUser(fetchedUser);

                // Fetch public trade history
                const fetchedTrades = await tradeAPI.getTrades(userId);
                setTrades(fetchedTrades);
            } catch (error) {
                console.error('Failed to load profile:', error);
            }
            setLoading(false);
        };

        loadProfile();
    }, [userId, currentUser?.id]);

    // URS Calculation
    // Use stats urs metrics if available, otherwise default to 0
    const ursMetrics = user?.stats?.urs || { correctTrades: 0, totalTrades: 0, resolvedTrades: 0 };
    const AS = calculateAS(ursMetrics.correctTrades, ursMetrics.resolvedTrades); // AS based on resolved
    const PS = calculatePS(ursMetrics.resolvedTrades);
    const URS = calculateURS(ursMetrics);
    const tier = getURSTier(URS);

    const avatar = user?.avatar || {};
    const badgeData = getCosmeticById('badges', avatar.badge);

    const handleLogout = () => {
        logout();
        navigate('/welcome');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading profile...</div>;
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center text-white">User not found</div>;
    }

    // Determine transactions to show
    // Own profile: Wallet transactions (Coins spent/earned) from Context
    // Public profile: Trade transactions (Bets placed) from API
    // Requirement: "latest transactions will appear"
    // For MVP public profile, we show TRADES. For own profile, we show Wallet Activity.
    // Let's standardize on showing TRADES if available, or fallback to wallet activity for own profile if needed.
    // Actually, user requirement says "latest transactions will appear". 
    // For Public Profile -> Show Trades (Prediction history).
    // For My Profile -> I probably want to see my Trade history too, or mixed. 
    // Let's show Coin transactions for Own Profile (as before) AND Trades list below if available.
    // But for Public Profile, ONLY Trades.

    const displayTransactions = isOwnProfile ? walletTransactions : trades;

    return (
        <div className="min-h-screen pb-24">
            <Header title={isOwnProfile ? "My Profile" : "User Profile"} showCoins={isOwnProfile} />

            <div className="p-6 space-y-6">
                {/* Avatar & User Info */}
                <div className="card text-center relative overflow-hidden">
                    {/* Tier Background Effect? Optional */}
                    <div className="relative inline-block">
                        <PixelAvatar
                            character={avatar.character || 'warrior'}
                            size={96}
                            frame={avatar.frame || 'default'}
                            badge={badgeData?.icon}
                        />
                        {isOwnProfile && (
                            <button
                                onClick={() => navigate('/shop')}
                                className="absolute -bottom-1 -right-1 bg-primary-500 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg"
                            >
                                <Edit2 size={14} />
                            </button>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mt-4 flex items-center justify-center gap-2">
                        {user.username}
                        {user.isVerified && <span className="text-blue-500" title="Verified">✓</span>}
                    </h2>

                    {/* URS Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 mt-2 ${tier.color}`}>
                        <span className="text-lg">{tier.icon}</span>
                        <span className="font-bold">{formatScore(URS)} URS</span>
                        <span className="text-xs text-gray-500">• {tier.label}</span>
                    </div>

                    {/* ID Copy */}
                    <button
                        onClick={() => {
                            if (user?.id) {
                                navigator.clipboard.writeText(user.id);
                                alert('ID copied to clipboard!');
                            }
                        }}
                        className="flex items-center justify-center gap-1.5 mt-2 mx-auto px-3 py-1 rounded-full transition-colors group opacity-60 hover:opacity-100"
                        title="Click to copy ID"
                    >
                        <span className="text-xs text-gray-400 font-mono">ID: {user?.id}</span>
                        <Copy size={12} className="text-gray-400" />
                    </button>
                </div>

                {/* Reputation Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="card p-4 flex flex-col items-center justify-center bg-gray-50 border-gray-100">
                        <div className="flex items-center gap-2 mb-1 text-gray-500">
                            <Shield size={16} />
                            <span className="text-xs font-semibold">ACCURACY (70%)</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{formatScore(AS)}%</p>
                        <p className="text-[10px] text-gray-400">{ursMetrics.correctTrades} / {ursMetrics.resolvedTrades || 0} Correct</p>
                    </div>
                    <div className="card p-4 flex flex-col items-center justify-center bg-gray-50 border-gray-100">
                        <div className="flex items-center gap-2 mb-1 text-gray-500">
                            <Star size={16} />
                            <span className="text-xs font-semibold">ACTIVITY (30%)</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{formatScore(PS)}</p>
                        <p className="text-[10px] text-gray-400 text-center">Participation Score</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="card text-center py-4">
                        <p className="text-xl font-bold text-primary-600">{user.stats?.gamesWon || 0}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Wins</p>
                    </div>
                    <div className="card text-center py-4">
                        <p className="text-xl font-bold text-accent-600">{user.stats?.totalBingos || 0}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Bingos</p>
                    </div>
                    <div className="card text-center py-4">
                        <p className="text-xl font-bold text-yellow-500">{user.stats?.bestStreak || 0}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Streak</p>
                    </div>
                </div>



                {/* Portfolio Section using Real Positions */}
                {isOwnProfile && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <Briefcase size={18} className="text-amber-500" />
                                My Portfolio
                            </h3>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">
                                {positions.length} Positions
                            </span>
                        </div>

                        {positions.length > 0 ? (
                            <div className="space-y-3">
                                {positions.map((pos) => (
                                    <div key={pos.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors cursor-pointer" onClick={() => navigate(`/community`)}>
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm line-clamp-1">{pos.bingoTitle || 'Unknown Bingo'}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{pos.squareDescription}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${pos.direction === 'YES' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {pos.direction}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs relative z-10 pt-2 border-t border-gray-100 mt-2">
                                            <span className="font-medium text-gray-600 flex items-center gap-1">
                                                <Briefcase size={12} />
                                                {pos.shares} Share{pos.shares > 1 ? 's' : ''}
                                            </span>
                                            <span className="font-bold text-gray-800 flex items-center gap-1">
                                                Invested: <span className="text-amber-600">🪙 {pos.cost}</span>
                                            </span>
                                        </div>
                                        {/* Background accent */}
                                        <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 ${pos.direction === 'YES' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="mb-2">No active positions found.</p>
                                <button
                                    onClick={() => navigate('/community')}
                                    className="btn-secondary text-xs px-4 py-2"
                                >
                                    Explore Markets
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Transactions / History */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            {isOwnProfile ? <Coins size={18} className="text-yellow-500" /> : <BarChart2 size={18} className="text-blue-500" />}
                            {isOwnProfile ? 'Wallet Activity' : 'Recent Trades'}
                        </h3>
                        {isOwnProfile && (
                            <span className="text-sm font-bold text-gray-800">{coins} Coins</span>
                        )}
                    </div>

                    <div className="space-y-3">
                        {displayTransactions.length > 0 ? (
                            displayTransactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-700">
                                            {isOwnProfile ? tx.description :
                                                // Check if it's a trade object (has square_description) or transaction object
                                                (tx.square_description ? `${tx.direction} on ${tx.square_description}` : tx.description)
                                            }
                                        </span>
                                        <span className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`font-bold ${(tx.type === 'earn' || tx.amount > 0 && isOwnProfile) ? 'text-green-600' : 'text-gray-600'
                                        }`}>
                                        {/* For trades, show amount wagered */}
                                        {isOwnProfile
                                            ? (tx.type === 'earn' ? '+' : '-') + tx.amount
                                            : `${tx.amount} coins`
                                        }
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-4 text-sm">No activity yet</p>
                        )}
                    </div>
                </div>

                {/* Own Profile Menu Items */}
                {isOwnProfile && (
                    <>
                        <div className="card p-0 overflow-hidden">
                            {[
                                { icon: <Trophy size={20} />, label: 'My Rewards', count: user?.rewards?.length || 0, path: '/rewards' },
                                { icon: <Newspaper size={20} />, label: 'News & Updates', path: '/news' },
                                {
                                    icon: <Gift size={20} />, label: 'Invite Friends (+50 coins)', path: null, onClick: async () => {
                                        const inviteLink = `${window.location.origin}?ref=${user?.id}`;
                                        await navigator.clipboard.writeText(inviteLink);
                                        // Award 50 coins for sharing (MVP: instant reward, no verification)
                                        if (earnCoins) {
                                            await earnCoins(50, 'Referral Share Bonus');
                                        }
                                        alert('Link copied! You earned 50 coins for sharing!');
                                    }
                                },
                                { icon: <Settings size={20} />, label: 'Settings', path: null, onClick: () => alert('Settings coming soon!') },
                            ].map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => item.path ? navigate(item.path) : item.onClick?.()}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-gray-500">{item.icon}</div>
                                        <span className="font-semibold text-gray-700">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.count !== undefined && (
                                            <span className="badge-primary">{item.count}</span>
                                        )}
                                        <ChevronRight className="text-gray-400" size={18} />
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-semibold"
                        >
                            <LogOut size={18} />
                            <span>Log Out</span>
                        </button>
                    </>
                )}
            </div>

            <BottomNav />
        </div >
    );
}
