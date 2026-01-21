import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Info, Sparkles, Users, PenTool } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

const GRID_SIZES = [
    { value: 3, label: '3×3', squares: 9 },
    { value: 4, label: '4×4', squares: 16 },
    { value: 5, label: '5×5', squares: 25 },
];

const TIME_LIMITS = [
    { value: 0, label: 'No limit', icon: '♾️' },
    { value: 15, label: '15 min', icon: '⏰' },
    { value: 30, label: '30 min', icon: '🕐' },
    { value: -1, label: 'Custom', icon: '✏️' },
];

const GAME_MODES = [
    {
        id: 'classic',
        name: 'Classic',
        icon: PenTool,
        description: 'You create all the squares',
        details: 'Perfect for planned events. You design the entire bingo board.',
        color: 'primary',
    },
    {
        id: 'crowd_shuffle',
        name: 'Crowd Shuffle',
        icon: Sparkles,
        description: 'Everyone contributes squares',
        details: 'Each player adds squares, then boards are randomly generated. Same squares can appear on different players\' boards!',
        color: 'accent',
    },
];

export default function CreateRoomPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { createRoom } = useGame();
    const { user } = useAuth();

    const [gameMode, setGameMode] = useState('classic');
    const [roomName, setRoomName] = useState('');
    const [gridSize, setGridSize] = useState(3);
    const [bingoType, setBingoType] = useState('fun'); // fun or serious
    const [bingoItems, setBingoItems] = useState(Array(9).fill(''));
    const [squaresPerPlayer, setSquaresPerPlayer] = useState(3);
    const [timeLimit, setTimeLimit] = useState(15); // minutes, 0 = no limit, -1 = custom
    const [customTime, setCustomTime] = useState('');

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

        // Determine final time limit
        let finalTimeLimit = timeLimit;
        if (timeLimit === -1) {
            const parsed = parseInt(customTime);
            if (!customTime || isNaN(parsed) || parsed <= 0) {
                alert('Please enter a valid custom duration in minutes');
                return;
            }
            finalTimeLimit = parsed;
        }

        const leagueId = searchParams.get('leagueId');
        const leagueName = searchParams.get('leagueName');

        const roomData = {
            name: roomName,
            gridSize,
            type: bingoType,
            gameMode,
            timeLimit: finalTimeLimit,
            leagueId: leagueId || undefined,
            leagueName: leagueName || undefined,
        };

        if (gameMode === 'classic') {
            // Classic mode: creator fills all squares
            if (!bingoItems.every(item => item.trim())) {
                alert('Please fill in all bingo squares');
                return;
            }

            roomData.items = bingoItems;
        } else {
            // Crowd Shuffle mode
            roomData.items = [];
            roomData.squaresPerPlayer = squaresPerPlayer;
            roomData.contributedSquares = [];
            roomData.playerContributions = {};
        }

        const room = createRoom(roomData);
        navigate(`/room/${room.code}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Create Room" showBack />

            <div className="p-6 space-y-6 pb-32">
                {/* ... (Room Name and Game Mode sections remain the same) */}
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

                {/* Game Mode Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Game Mode
                    </label>
                    <div className="space-y-3">
                        {GAME_MODES.map((mode) => {
                            const Icon = mode.icon;
                            const isSelected = gameMode === mode.id;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setGameMode(mode.id)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                        ? `border-${mode.color}-500 bg-${mode.color}-50`
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    style={isSelected ? {
                                        borderColor: mode.color === 'primary' ? '#8b5cf6' : '#ec4899',
                                        backgroundColor: mode.color === 'primary' ? '#f5f3ff' : '#fdf2f8',
                                    } : {}}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected
                                            ? mode.color === 'primary' ? 'bg-primary-500 text-white' : 'bg-accent-500 text-white'
                                            : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800">{mode.name}</h4>
                                            <p className="text-sm text-gray-500">{mode.description}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                            ? mode.color === 'primary' ? 'border-primary-500 bg-primary-500' : 'border-accent-500 bg-accent-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <p className="mt-3 text-sm text-gray-600 pl-15">{mode.details}</p>
                                    )}
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
                                <span className="text-xs text-gray-500 block">{squares} squares</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Limit */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ⏱️ Game Duration
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {TIME_LIMITS.map(({ value, label, icon }) => (
                            <button
                                key={value}
                                onClick={() => setTimeLimit(value)}
                                className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all ${timeLimit === value
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <span className="text-lg block mb-1">{icon}</span>
                                <span className="font-bold text-gray-800 text-sm whitespace-nowrap">{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Time Input */}
                    {timeLimit === -1 && (
                        <div className="mt-3 animate-fade-in">
                            <label className="block text-xs text-gray-500 mb-1">Enter duration in minutes:</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="180"
                                    placeholder="e.g. 45"
                                    value={customTime}
                                    onChange={(e) => setCustomTime(e.target.value)}
                                    className="flex-1 input-field"
                                />
                                <span className="flex items-center text-gray-500 font-semibold">min</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Crowd Shuffle Settings */}
                {gameMode === 'crowd_shuffle' && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Squares per Player
                        </label>
                        <div className="flex gap-3">
                            {[2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setSquaresPerPlayer(num)}
                                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${squaresPerPlayer === num
                                        ? 'border-accent-500 bg-accent-50'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    <span className="font-bold text-gray-800">{num}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 bg-pink-50 p-3 rounded-xl flex items-start gap-2">
                            <Sparkles size={16} className="text-pink-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-pink-700">
                                Each player will submit {squaresPerPlayer} squares. Boards will be randomly generated from the pool - the same square can appear on multiple players' boards!
                            </p>
                        </div>
                    </div>
                )}

                {/* Bingo Type (only for Classic) */}
                {gameMode === 'classic' && (
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
                                    In competitive mode, each player gets a randomized board from your squares.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Bingo Items (only for Classic mode) */}
                {gameMode === 'classic' && (
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
                )}

                {/* Crowd Shuffle Info */}
                {gameMode === 'crowd_shuffle' && (
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200">
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Users size={18} />
                            How Crowd Shuffle Works
                        </h4>
                        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                            <li>Create the room and share the code</li>
                            <li>Each player submits {squaresPerPlayer} squares in the lobby</li>
                            <li>When everyone's ready, boards are randomly generated</li>
                            <li>Same squares can appear on different boards</li>
                        </ol>
                    </div>
                )}
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
