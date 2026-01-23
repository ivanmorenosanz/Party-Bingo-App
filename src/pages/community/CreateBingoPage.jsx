import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Eye, Banknote, Timer as TimerIcon } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useAuth } from '../../context/AuthContext';
import { useBingo } from '../../context/BingoContext';
import { bingosAPI } from '../../api/client';

export default function CreateBingoPage() {
    const navigate = useNavigate();
    const { addReward, user } = useAuth();
    const { addBingo } = useBingo();

    const [title, setTitle] = useState('');
    const [currency, setCurrency] = useState('coins'); // coins or cash
    const [bingoItems, setBingoItems] = useState(Array(9).fill(''));
    const [tags, setTags] = useState('');
    const [endsAt, setEndsAt] = useState('');

    // Redirect non-verified users
    useEffect(() => {
        if (user && !user.isVerified) {
            navigate('/community');
        }
    }, [user, navigate]);

    const handleItemChange = (index, value) => {
        const newItems = [...bingoItems];
        newItems[index] = value;
        setBingoItems(newItems);
    };

    const handlePublish = async () => {
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }
        if (!bingoItems.every(item => item.trim())) {
            alert('Please fill in all 9 squares');
            return;
        }
        if (!endsAt) {
            alert('Please set a closing time');
            return;
        }

        // Give creator reward if first time
        if (!user?.rewards?.includes('creator')) {
            addReward('creator');
        }

        const newBingo = {
            title,
            creator: user?.username || 'Anonymous',
            creatorId: user?.id || 'anon',
            type: currency, // 'coins' or 'cash'
            currency: currency,
            price: 0, // No entry fee
            gameMode: 'tradeable', // Always tradeable market
            gridSize: 3, // Always 3x3
            items: bingoItems,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            endsAt: endsAt,
            tradeable: true,
        };

        try {
            // Save to backend so all users can see it
            const apiData = {
                title: newBingo.title,
                category: 'community',
                creatorId: newBingo.creatorId,
                currency: newBingo.currency,
                endsAt: newBingo.endsAt,
                tags: newBingo.tags,
                squares: bingoItems.map((item, i) => ({
                    description: item,
                    initialProbability: 0.5,
                    position: i
                }))
            };
            const result = await bingosAPI.createBingo(apiData);

            // Also add to local context with the real ID from backend
            addBingo({ ...newBingo, id: result.id });
            navigate('/community');
        } catch (error) {
            console.error('Failed to create bingo:', error);
            alert('Failed to create market: ' + error.message);
        }
    };

    // Don't render if not verified (safety net while redirect happens)
    if (!user?.isVerified) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <Header title="Create Market" showBack backPath="/community" />

            <div className="p-6 space-y-6 pb-32">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Market Title
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Super Bowl LXII Predictions"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Currency Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Currency
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'coins', label: 'Coins', icon: Coins, color: 'text-yellow-500', border: 'border-yellow-500', bg: 'bg-yellow-50', desc: 'Players trade with coins' },
                            { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-green-500', border: 'border-green-500', bg: 'bg-green-50', desc: 'Players trade with real money' }
                        ].map(type => {
                            const Icon = type.icon;
                            const isSelected = currency === type.id;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setCurrency(type.id)}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${isSelected ? `${type.border} ${type.bg}` : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <Icon className={type.color} size={28} />
                                    <span className={`font-bold text-sm ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {type.label}
                                    </span>
                                    <span className="text-xs text-gray-400 text-center">{type.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Closing Time (Required) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <TimerIcon size={16} className="text-red-500" />
                        Closing Time <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        className="input-field"
                        value={endsAt}
                        onChange={(e) => setEndsAt(e.target.value)}
                        required
                    />
                    <p className="text-xs text-gray-400 mt-1">Trading will stop at this time and results will be determined.</p>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., sports, football, superbowl"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Bingo Squares - Fixed 3x3 */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prediction Squares (9 required)
                    </label>
                    <p className="text-xs text-gray-400 mb-3">Enter 9 predictions/outcomes that players will bet on.</p>

                    {/* 3x3 Grid Preview */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {bingoItems.map((item, index) => (
                            <div
                                key={index}
                                className={`aspect-square rounded-lg border-2 flex items-center justify-center p-2 text-center text-xs ${item.trim() ? 'border-primary-300 bg-primary-50 text-gray-700' : 'border-dashed border-gray-200 bg-gray-50 text-gray-400'}`}
                            >
                                {item.trim() || `#${index + 1}`}
                            </div>
                        ))}
                    </div>

                    {/* Input Fields */}
                    <div className="space-y-2">
                        {bingoItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-400 w-6">#{index + 1}</span>
                                <input
                                    type="text"
                                    placeholder={`Prediction ${index + 1}`}
                                    value={item}
                                    onChange={(e) => handleItemChange(index, e.target.value)}
                                    className="input-field flex-1 text-sm py-2"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-10 safe-area-bottom">
                <div className="flex gap-3">
                    <button
                        onClick={() => alert('Preview coming soon!')}
                        className="flex-1 py-4 rounded-xl font-semibold text-primary-600 border-2 border-primary-200 flex items-center justify-center gap-2"
                    >
                        <Eye size={18} />
                        Preview
                    </button>
                    <button
                        onClick={handlePublish}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                        Create Market
                    </button>
                </div>
            </div>
        </div>
    );
}
