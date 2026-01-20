import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useGame } from '../../context/GameContext';

const GRID_SIZES = [
    { value: 3, label: '3×3', squares: 9 },
    { value: 4, label: '4×4', squares: 16 },
    { value: 5, label: '5×5', squares: 25 },
];

export default function CreateRoomPage() {
    const navigate = useNavigate();
    const { createRoom } = useGame();
    const [roomName, setRoomName] = useState('');
    const [gridSize, setGridSize] = useState(3);
    const [bingoType, setBingoType] = useState('fun'); // fun or serious
    const [bingoItems, setBingoItems] = useState(Array(9).fill(''));

    const handleGridSizeChange = (size) => {
        setGridSize(size);
        setBingoItems(Array(size * size).fill(''));
    };

    const handleItemChange = (index, value) => {
        const newItems = [...bingoItems];
        newItems[index] = value;
        setBingoItems(newItems);
    };

    const handleCreateRoom = () => {
        if (!roomName.trim()) {
            alert('Please enter a room name');
            return;
        }
        if (!bingoItems.every(item => item.trim())) {
            alert('Please fill in all bingo squares');
            return;
        }

        const room = createRoom({
            name: roomName,
            gridSize,
            type: bingoType,
            items: bingoItems,
        });

        navigate(`/room/${room.code}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Create Room" showBack />

            <div className="p-6 space-y-6 pb-32">
                {/* Room Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Room Name
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Friday Night Party"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
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
                            onClick={() => setBingoType('fun')}
                            className={`p-4 rounded-xl border-2 transition-all ${bingoType === 'fun'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                        >
                            <span className="text-2xl mb-2 block">🎉</span>
                            <h4 className="font-bold text-gray-800">Fun</h4>
                            <p className="text-xs text-gray-500 mt-1">Same board for everyone</p>
                        </button>
                        <button
                            onClick={() => setBingoType('serious')}
                            className={`p-4 rounded-xl border-2 transition-all ${bingoType === 'serious'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                        >
                            <span className="text-2xl mb-2 block">🎯</span>
                            <h4 className="font-bold text-gray-800">Competitive</h4>
                            <p className="text-xs text-gray-500 mt-1">Random distribution</p>
                        </button>
                    </div>

                    {bingoType === 'serious' && (
                        <div className="mt-3 bg-blue-50 p-3 rounded-xl flex items-start gap-2">
                            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700">
                                In competitive mode, you mark squares as completed and each player gets a randomized board.
                            </p>
                        </div>
                    )}
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
                                <span className="text-xs text-gray-500 block">{squares} squares</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bingo Items */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bingo Predictions ({bingoItems.length} squares)
                    </label>
                    <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                    >
                        {bingoItems.map((item, index) => (
                            <textarea
                                key={index}
                                placeholder={`#${index + 1}`}
                                value={item}
                                onChange={(e) => handleItemChange(index, e.target.value)}
                                className="p-2 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-sm resize-none h-16 text-center"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
                <button
                    onClick={handleCreateRoom}
                    className="w-full btn-primary"
                >
                    Create Room
                </button>
            </div>
        </div>
    );
}
