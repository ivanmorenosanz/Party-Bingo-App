import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Coins, Eye } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useAuth } from '../../context/AuthContext';

const GRID_SIZES = [
    { value: 3, label: '3×3', squares: 9 },
    { value: 4, label: '4×4', squares: 16 },
    { value: 5, label: '5×5', squares: 25 },
];

export default function CreateBingoPage() {
    const navigate = useNavigate();
    const { addReward, user } = useAuth();
    const [title, setTitle] = useState('');
    const [gridSize, setGridSize] = useState(3);
    const [bingoType, setBingoType] = useState('fun');
    const [price, setPrice] = useState(0);
    const [bingoItems, setBingoItems] = useState(Array(9).fill(''));
    const [tags, setTags] = useState('');

    const handleGridSizeChange = (size) => {
        setGridSize(size);
        // For serious bingos, we need more squares for the pool
        const squareCount = bingoType === 'serious' ? size * size * 2 : size * size;
        setBingoItems(Array(squareCount).fill(''));
    };

    const handleTypeChange = (type) => {
        setBingoType(type);
        // Serious bingos need 2x squares for randomization pool
        const squareCount = type === 'serious' ? gridSize * gridSize * 2 : gridSize * gridSize;
        setBingoItems(Array(squareCount).fill(''));
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

        // Give creator reward if first time
        if (!user?.rewards?.includes('creator')) {
            addReward('creator');
        }

        // In production, would save to backend
        alert('Bingo published successfully! 🎉');
        navigate('/community');
    };

    const requiredSquares = bingoType === 'serious' ? gridSize * gridSize * 2 : gridSize * gridSize;
    const creatorEarnings = Math.floor(price * 0.7); // 70% to creator

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
                        Bingo Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleTypeChange('fun')}
                            className={`p-4 rounded-xl border-2 transition-all ${bingoType === 'fun'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 bg-white'
                                }`}
                        >
                            <span className="text-2xl mb-2 block">🎉</span>
                            <h4 className="font-bold text-gray-800">Fun</h4>
                            <p className="text-xs text-gray-500 mt-1">Free, same for everyone</p>
                        </button>
                        <button
                            onClick={() => handleTypeChange('serious')}
                            className={`p-4 rounded-xl border-2 transition-all ${bingoType === 'serious'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 bg-white'
                                }`}
                        >
                            <span className="text-2xl mb-2 block">🎯</span>
                            <h4 className="font-bold text-gray-800">Competitive</h4>
                            <p className="text-xs text-gray-500 mt-1">Paid, randomized</p>
                        </button>
                    </div>
                </div>

                {/* Serious Bingo Info & Price */}
                {bingoType === 'serious' && (
                    <>
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <div className="flex items-start gap-2">
                                <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-700">
                                    <p className="font-semibold mb-1">How Competitive Bingos Work:</p>
                                    <ul className="list-disc ml-4 space-y-1">
                                        <li>Create {requiredSquares} squares (2× the grid size)</li>
                                        <li>Players pay coins to buy your bingo</li>
                                        <li>Each player gets a unique, randomized board</li>
                                        <li>You mark squares as completed for everyone</li>
                                        <li>You earn 70% of each purchase!</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Price (in coins)
                            </label>
                            <div className="relative">
                                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="number"
                                    placeholder="25"
                                    value={price}
                                    onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                                    min="0"
                                    className="input-field pl-12"
                                />
                            </div>
                            {price > 0 && (
                                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                    You'll earn <strong className="flex items-center gap-1">{creatorEarnings} <Coins size={14} className="text-yellow-500" /></strong> per purchase!
                                </p>
                            )}
                        </div>
                    </>
                )}

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
                                    {bingoType === 'serious' ? `${squares * 2} squares` : `${squares} squares`}
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

                {/* Bingo Squares */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bingo Squares ({requiredSquares} required)
                    </label>
                    <div className="space-y-2">
                        {bingoItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-sm text-gray-400 w-6">#{index + 1}</span>
                                <input
                                    type="text"
                                    placeholder={`Square ${index + 1}`}
                                    value={item}
                                    onChange={(e) => handleItemChange(index, e.target.value)}
                                    className="input-field flex-1"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
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
