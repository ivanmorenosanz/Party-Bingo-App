import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Coins, Eye, Banknote, Sparkles, Grid3X3, CheckSquare, Target } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useAuth } from '../../context/AuthContext';
import { useBingo } from '../../context/BingoContext';

const GRID_SIZES = [
    { value: 3, label: '3×3', squares: 9 },
    { value: 4, label: '4×4', squares: 16 },
    { value: 5, label: '5×5', squares: 25 },
];

const GAME_MODES = [
    { id: 'first_to_line', label: 'Classic', description: 'First to verify a line wins', icon: Grid3X3 },
    { id: 'blackout', label: 'Blackout', description: 'Cover all squares to win', icon: CheckSquare },
];

export default function CreateBingoPage() {
    const navigate = useNavigate();
    const { addReward, user } = useAuth();
    const { addBingo } = useBingo();
    const [title, setTitle] = useState('');
    const [gridSize, setGridSize] = useState(3);
    const [bingoType, setBingoType] = useState('fun'); // fun, coins, cash
    const [gameMode, setGameMode] = useState('first_to_line');
    const [price, setPrice] = useState(0);
    const [bingoItems, setBingoItems] = useState(Array(9).fill(''));
    const [tags, setTags] = useState('');
    const [endsAt, setEndsAt] = useState('');

    const handleGridSizeChange = (size) => {
        setGridSize(size);
        const squareCount = size * size;
        // Adjust existing items or create new array
        const newItems = Array(squareCount).fill('');
        bingoItems.forEach((item, i) => {
            if (i < squareCount) newItems[i] = item;
        });
        setBingoItems(newItems);
    };

    const handleTypeChange = (type) => {
        setBingoType(type);
        if (type === 'fun') setPrice(0);
    };

    const handleItemChange = (index, value) => {
        const newItems = [...bingoItems];
        newItems[index] = value;
        setBingoItems(newItems);
    };

    const handlePublish = () => {
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }
        if (!bingoItems.every(item => item.trim())) {
            alert('Please fill in all squares');
            return;
        }
        if ((bingoType === 'coins' || bingoType === 'cash') && price <= 0) {
            alert('Please set a valid entry fee');
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
            type: bingoType,
            price: bingoType === 'fun' ? 0 : price,
            gameMode,
            gridSize,
            items: bingoItems,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            endsAt: endsAt || null, // Add deadline
        };

        addBingo(newBingo);
        navigate('/community');
    };

    const requiredSquares = gridSize * gridSize;
    const creatorEarnings = bingoType === 'cash'
        ? (price * 0.7).toFixed(2)
        : Math.floor(price * 0.7);

    return (
        <div className="min-h-screen">
            <Header title="Create Bingo" showBack backPath="/community" />

            <div className="p-6 space-y-6 pb-32">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bingo Title
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Movie Night Predictions"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Bingo Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Game Category
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'fun', label: 'Fun', icon: Sparkles, color: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-50' },
                            { id: 'coins', label: 'Coins', icon: Coins, color: 'text-yellow-500', border: 'border-yellow-500', bg: 'bg-yellow-50' },
                            { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-green-500', border: 'border-green-500', bg: 'bg-green-50' }
                        ].map(type => {
                            const Icon = type.icon;
                            const isSelected = bingoType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => handleTypeChange(type.id)}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${isSelected ? `${type.border} ${type.bg}` : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <Icon className={type.color} size={24} />
                                    <span className={`font-bold text-sm ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {type.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        {bingoType === 'fun' ? 'Free for everyone to play.' :
                            bingoType === 'coins' ? 'Players pay Coins to enter.' :
                                'Players pay Real Money to enter.'}
                    </p>
                </div>

                {/* Entry Fee (if not fun) */}
                {bingoType !== 'fun' && (
                    <div className="animate-fade-in-up">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Entry Fee ({bingoType === 'cash' ? 'Real Money' : 'Coins'})
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                {bingoType === 'cash' ? <span className="font-bold text-lg">$</span> : <Coins size={20} />}
                            </div>
                            <input
                                type="number"
                                placeholder={bingoType === 'cash' ? "5.00" : "50"}
                                value={price}
                                onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="input-field pl-12"
                                step={bingoType === 'cash' ? "0.50" : "10"}
                            />
                        </div>
                        {price > 0 && (
                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1 bg-gray-50 p-2 rounded-lg">
                                <Info size={12} />
                                <span>You earn <strong>70%</strong>:
                                    {bingoType === 'cash' ? ` $${creatorEarnings}` : ` ${creatorEarnings} coins`} per player
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Game Mode */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Game Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {GAME_MODES.map(mode => {
                            const Icon = mode.icon;
                            const isSelected = gameMode === mode.id;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setGameMode(mode.id)}
                                    className={`p-3 rounded-xl border-2 transition-all text-left flex items-start gap-3 ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{mode.label}</h4>
                                        <p className="text-xs text-gray-400 leading-tight mt-0.5">{mode.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid Size */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Grid Size
                    </label>
                    <div className="flex gap-3">
                        {GRID_SIZES.map(({ value, label, squares }) => (
                            <button
                                key={value}
                                onClick={() => handleGridSizeChange(value)}
                                className={`flex-1 p-3 rounded-xl border-2 transition-all ${gridSize === value
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <span className="font-bold text-gray-800">{label}</span>
                                <span className="text-xs text-gray-500 block">
                                    {squares} squares
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., party, friends, weekend"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="input-field"
                    />
                </div>

                {/* Deadline */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Closing Time (Optional)
                    </label>
                    <input
                        type="datetime-local"
                        className="input-field"
                        onChange={(e) => setEndsAt(e.target.value)} // Need to add state
                    />
                    <p className="text-xs text-gray-400 mt-1">If set, the bingo will stop accepting entries after this time.</p>
                </div>

                {/* Bingo Squares */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bingo Squares ({requiredSquares} required)
                    </label>
                    <div className="space-y-2">
                        {bingoItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-400 w-6">#{index + 1}</span>
                                <input
                                    type="text"
                                    placeholder={`Square ${index + 1}`}
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
                        Publish Bingo
                    </button>
                </div>
            </div>
        </div>
    );
}
