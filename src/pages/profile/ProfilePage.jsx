import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, LogOut, Trophy, Coins, Gift, User, Edit2 } from 'lucide-react';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { getCosmeticById } from '../../data/cosmetics';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { coins, transactions } = useWallet();

    const avatar = user?.avatar || {};
    const background = getCosmeticById('backgrounds', avatar.background);
    const frame = getCosmeticById('frames', avatar.frame);

    const handleLogout = () => {
        logout();
        navigate('/welcome');
    };

    const menuItems = [
        { icon: <Trophy size={20} />, label: 'My Rewards', count: user?.rewards?.length || 0, path: '/rewards' },
        { icon: <Coins size={20} />, label: 'Transaction History', path: null, onClick: () => alert('Coming soon!') },
        { icon: <Gift size={20} />, label: 'Invite Friends', path: null, onClick: () => alert('Share link coming soon!') },
        { icon: <Settings size={20} />, label: 'Settings', path: null, onClick: () => alert('Settings coming soon!') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <Header title="Profile" showCoins />

            <div className="p-6 space-y-6">
                {/* Avatar & User Info */}
                <div className="card text-center">
                    <div className="relative inline-block">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto ${background ? `bg-gradient-to-br ${background.color}` : 'bg-gradient-to-br from-primary-400 to-accent-400'
                            } ${frame?.id === 'fire' ? 'ring-4 ring-orange-400 animate-pulse' : ''}`}>
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {avatar.badge && (
                            <div className="absolute -bottom-1 -right-1 text-2xl">
                                {getCosmeticById('badges', avatar.badge)?.icon}
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/shop')}
                            className="absolute -bottom-1 -right-1 bg-primary-500 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg"
                        >
                            <Edit2 size={14} />
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mt-4">{user?.username}</h2>
                    <p className="text-gray-500">{user?.email}</p>

                    <div className="flex justify-center gap-2 mt-3">
                        {user?.rewards?.slice(0, 3).map(rewardId => (
                            <span key={rewardId} className="text-2xl">
                                {rewardId === 'first_bingo' ? '🎯' :
                                    rewardId === 'speed_demon' ? '⚡' :
                                        rewardId === 'full_house' ? '🏠' : '🏆'}
                            </span>
                        ))}
                        {(user?.rewards?.length || 0) > 3 && (
                            <span className="text-sm text-gray-500 self-center">
                                +{(user?.rewards?.length || 0) - 3} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="card text-center py-4">
                        <p className="text-2xl font-bold text-primary-600">{user?.stats?.gamesWon || 0}</p>
                        <p className="text-xs text-gray-500">Wins</p>
                    </div>
                    <div className="card text-center py-4">
                        <p className="text-2xl font-bold text-accent-600">{user?.stats?.totalBingos || 0}</p>
                        <p className="text-xs text-gray-500">Bingos</p>
                    </div>
                    <div className="card text-center py-4">
                        <p className="text-2xl font-bold text-yellow-500">{user?.stats?.bestStreak || 0}</p>
                        <p className="text-xs text-gray-500">Best Streak</p>
                    </div>
                </div>

                {/* Wallet Preview */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-100 w-12 h-12 rounded-xl flex items-center justify-center text-2xl">
                                🪙
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Balance</p>
                                <p className="text-2xl font-bold text-gray-800">{coins}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/shop')}
                            className="btn-primary py-2 px-4 text-sm"
                        >
                            Shop
                        </button>
                    </div>

                    {/* Recent Transactions */}
                    {transactions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Recent</p>
                            {transactions.slice(0, 2).map(tx => (
                                <div key={tx.id} className="flex justify-between text-sm py-1">
                                    <span className="text-gray-600">{tx.description}</span>
                                    <span className={tx.type === 'earn' ? 'text-green-600' : 'text-red-500'}>
                                        {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Menu Items */}
                <div className="card p-0 overflow-hidden">
                    {menuItems.map((item, index) => (
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

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-semibold"
                >
                    <LogOut size={18} />
                    <span>Log Out</span>
                </button>
            </div>

            <BottomNav />
        </div>
    );
}
