import { Trophy, Lock, Coins } from 'lucide-react';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { REWARDS, RARITY_COLORS } from '../../data/rewards';

export default function RewardsPage() {
    const { user } = useAuth();

    const allRewards = Object.values(REWARDS);
    const unlockedRewards = user?.rewards || [];

    const groupedByRarity = {
        common: allRewards.filter(r => r.rarity === 'common'),
        uncommon: allRewards.filter(r => r.rarity === 'uncommon'),
        rare: allRewards.filter(r => r.rarity === 'rare'),
        legendary: allRewards.filter(r => r.rarity === 'legendary'),
    };

    const isUnlocked = (rewardId) => unlockedRewards.includes(rewardId);

    return (
        <div className="min-h-screen pb-24">
            <Header title="My Rewards" showBack backPath="/profile" />

            <div className="p-6 space-y-6">
                {/* Progress */}
                <div className="card">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-800">Collection Progress</span>
                        <span className="text-primary-600 font-bold">
                            {unlockedRewards.length}/{allRewards.length}
                        </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                            style={{ width: `${(unlockedRewards.length / allRewards.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Rewards by Rarity */}
                {Object.entries(groupedByRarity).map(([rarity, rewards]) => (
                    <div key={rarity}>
                        <h2 className="text-lg font-bold text-gray-800 mb-3 capitalize flex items-center gap-2">
                            {rarity === 'legendary' && '👑'}
                            {rarity === 'rare' && '💎'}
                            {rarity === 'uncommon' && '⭐'}
                            {rarity === 'common' && '🎯'}
                            {rarity}
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            {rewards.map(reward => {
                                const unlocked = isUnlocked(reward.id);

                                return (
                                    <div
                                        key={reward.id}
                                        className={`card relative transition-all ${unlocked
                                            ? ''
                                            : 'opacity-60 grayscale'
                                            }`}
                                    >
                                        {!unlocked && (
                                            <div className="absolute top-3 right-3">
                                                <Lock className="text-gray-400" size={16} />
                                            </div>
                                        )}

                                        <div className="text-4xl mb-2">{reward.icon}</div>
                                        <h3 className="font-bold text-gray-800 text-sm">{reward.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {reward.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-3">
                                            <span className={`badge text-xs ${RARITY_COLORS[reward.rarity]}`}>
                                                {unlocked ? 'Unlocked' : 'Locked'}
                                            </span>
                                            <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                                                +{reward.coins} <Coins size={12} className="text-yellow-500" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <BottomNav />
        </div>
    );
}
