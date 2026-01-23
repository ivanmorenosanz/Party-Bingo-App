import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Info, Sparkles, Users, PenTool, LayoutGrid } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { useBingo } from '../../context/BingoContext';

const GRID_SIZES = [
    { value: 3, label: '3×3', squares: 9 },
    { value: 4, label: '4×4', squares: 16 },
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
        icon: LayoutGrid,
        description: 'Large pool, unique boards',
        details: 'Enter many items (pool). Players get random unique subsets. Best for large groups.',
        color: 'blue',
    },
    {
        id: 'first_to_line',
        name: 'First to Line',
        icon: PenTool,
        description: 'Fixed board, shuffled order',
        details: 'You define the exact squares. Everyone gets the same items, but in random order.',
        color: 'primary',
    },
    {
        id: 'crowd_shuffle',
        name: 'Crowd Shuffle',
        icon: Sparkles,
        description: 'Everyone contributes squares',
        details: 'Each player adds squares. Boards are random. Game continues until you decide to stop or time runs out.',
        color: 'accent',
    },
];

export default function CreateRoomPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { getBingoById } = useBingo();

    const [gameMode, setGameMode] = useState('classic');
    const [roomName, setRoomName] = useState('');
    const [gridSize, setGridSize] = useState(3);
    const [bingoType, setBingoType] = useState('fun'); // fun or serious
    const [entryFee, setEntryFee] = useState(0);
    const [squaresPerPlayer, setSquaresPerPlayer] = useState(3);
    const [timeLimit, setTimeLimit] = useState(15);
    const [customTime, setCustomTime] = useState('');

    // Inputs for First to Line (Fixed Array)
    const [fixedItems, setFixedItems] = useState(Array(9).fill(''));

    // Inputs for Classic (Textarea Pool)
    const [rawItems, setRawItems] = useState('');

    // Pre-fill from Bingo ID
    useEffect(() => {
        const bingoId = searchParams.get('bingoId');
        if (bingoId) {
            const bingo = getBingoById(bingoId);
            if (bingo) {
                setRoomName(bingo.title);
                setGridSize(bingo.gridSize || 3);

                // If the bingo has fixed items (like usual), switch to first_to_line
                // Or if it's a large pool, maybe classic.
                // Assuming "Community Bingos" are usually fixed templates for now.
                // Most are "first_to_line" style templates.
                setGameMode(bingo.gameMode || 'first_to_line');

                if (bingo.gameMode === 'first_to_line' || !bingo.gameMode) {
                    // Ensure fixedItems array matches size
                    const size = bingo.gridSize || 3;
                    const items = [...bingo.items];
                    // Pad if needed
                    while (items.length < size * size) items.push('');
                    setFixedItems(items.slice(0, size * size));
                } else if (bingo.gameMode === 'classic') {
                    setRawItems(bingo.items.join('\n'));
                }
            }
        }
    }, [searchParams, getBingoById]);

    // Derived for Classic
    const parsedItems = rawItems.split('\n').filter(s => s.trim().length > 0);
    const calculatedGridSize = Math.max(3, Math.floor(Math.sqrt(parsedItems.length)));
    const effectiveItemCount = calculatedGridSize * calculatedGridSize;

    // For Classic, Grid Size is derived OR selected? User said "if you want a 4x4... enter 17".
    // Implies Grid Size is CHOSEN, but Item Count must be > Grid^2.
    // So I will let user pick Grid Size for Classic too.

    const handleGridSizeChange = (size) => {
        setGridSize(size);
        // Reset fixed items array if mode is first_to_line
        if (gameMode === 'first_to_line') {
            setFixedItems(Array(size * size).fill(''));
        }
    };

    const handleFixedItemChange = (index, value) => {
        const newItems = [...fixedItems];
        newItems[index] = value;
        setFixedItems(newItems);
    };

    const [isCreating, setIsCreating] = useState(false);
    const { createRoom, activeGames } = useGame();

    useEffect(() => {
        if (isCreating && activeGames.length > 0) {
            const room = activeGames[0];
            navigate(`/room/${room.code}`);
        }
    }, [activeGames, isCreating, navigate]);

    const handleCreateRoom = () => {
        if (!roomName.trim()) {
            alert('Please enter a room name');
            return;
        }

        let finalTimeLimit = timeLimit;
        if (timeLimit === -1) {
            const parsed = parseInt(customTime);
            if (!customTime || isNaN(parsed) || parsed <= 0) {
                alert('Please enter a valid custom duration in minutes');
                return;
            }
            finalTimeLimit = parsed;
        }

        if (bingoType === 'serious' && entryFee <= 0) {
            alert('Please enter a valid entry fee for competitive mode');
            return;
        }

        const roomData = {
            name: roomName,
            gridSize,
            type: bingoType,
            entryFee: bingoType === 'serious' ? parseInt(entryFee) : 0,
            gameMode,
            timeLimit: finalTimeLimit,
            leagueId: searchParams.get('leagueId'),
            leagueName: searchParams.get('leagueName'),
        };

        if (gameMode === 'first_to_line') {
            if (!fixedItems.every(item => item.trim())) {
                alert(`Please fill in all ${gridSize * gridSize} squares.`);
                return;
            }
            roomData.items = fixedItems;
        } else if (gameMode === 'classic') {
            const minItems = (gridSize * gridSize) + 1;
            if (parsedItems.length < minItems) {
                alert(`For a ${gridSize}x${gridSize} grid in Classic mode, you need at least ${minItems} items (so boards are different). You have ${parsedItems.length}.`);
                return;
            }
            roomData.items = parsedItems;
        } else {
            // Crowd Shuffle
            roomData.items = [];
            roomData.squaresPerPlayer = squaresPerPlayer;
        }

        setIsCreating(true);
        const player = {
            name: user?.username || 'Host',
            id: user?.id,
            isHost: true
        };
        createRoom(roomData, player);
    };

    return (
        <div className="min-h-screen">
            <Header title="Create Room" showBack />

            <div className="p-6 space-y-6 pb-32">
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

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Game Mode
                    </label>
                    <div className="space-y-3">
                        {GAME_MODES.map((mode) => {
                            const Icon = mode.icon;
                            const isSelected = gameMode === mode.id;
                            const activeColor = mode.color === 'blue' ? 'blue' : mode.color === 'primary' ? 'primary' : 'accent';
                            // Tailwind dynamic colors workaround:
                            const borderColor = isSelected
                                ? (mode.color === 'primary' ? 'border-primary-500' : mode.color === 'blue' ? 'border-blue-500' : 'border-accent-500')
                                : 'border-gray-200';
                            const bgColor = isSelected
                                ? (mode.color === 'primary' ? 'bg-primary-50' : mode.color === 'blue' ? 'bg-blue-50' : 'bg-accent-50')
                                : 'bg-white';

                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setGameMode(mode.id)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${borderColor} ${bgColor} hover:border-gray-300`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected
                                            ? (mode.color === 'primary' ? 'bg-primary-500 text-white' : mode.color === 'blue' ? 'bg-blue-500 text-white' : 'bg-accent-500 text-white')
                                            : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800">{mode.name}</h4>
                                            <p className="text-sm text-gray-500">{mode.description}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                            ? (mode.color === 'primary' ? 'border-primary-500 bg-primary-500' : mode.color === 'blue' ? 'border-blue-500 bg-blue-500' : 'border-accent-500 bg-accent-500')
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

                {/* Grid Size - Applicable for First to Line AND Classic */}
                {gameMode !== 'crowd_shuffle' && (
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
                )}

                {/* Bingo Types (Items Input) */}
                {gameMode === 'first_to_line' && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Bingo Predictions ({gridSize * gridSize} squares)
                        </label>
                        <div
                            className="grid gap-2"
                            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                        >
                            {fixedItems.map((item, index) => (
                                <textarea
                                    key={index}
                                    placeholder={`#${index + 1}`}
                                    value={item}
                                    onChange={(e) => handleFixedItemChange(index, e.target.value)}
                                    className="p-2 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-sm resize-none h-16 text-center"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {gameMode === 'classic' && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Bingo Predictions (One per line)
                        </label>
                        <div className="relative">
                            <textarea
                                value={rawItems}
                                onChange={(e) => setRawItems(e.target.value)}
                                placeholder="Enter your predictions here...&#10;Prediction 1&#10;Prediction 2&#10;..."
                                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 min-h-[200px] text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-200"
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 backdrop-blur px-2 py-1 rounded-lg">
                                {parsedItems.length} items
                            </div>
                        </div>

                        <div className="mt-3 bg-blue-50 p-3 rounded-xl flex items-start gap-3">
                            <PenTool size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-800">
                                    Grid Size: {calculatedGridSize}×{calculatedGridSize}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Each player will get {effectiveItemCount} random items from your list of {parsedItems.length}.
                                    {parsedItems.length > effectiveItemCount ? ` (${parsedItems.length - effectiveItemCount} items left out per board)` : ''}
                                </p>
                            </div>
                        </div>

                        {parsedItems.length < 9 && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                                <Info size={16} />
                                Add at least {9 - parsedItems.length} more items for a 3x3 grid.
                            </p>
                        )}
                    </div>
                )}

                {/* Bingo Type (Fun vs Competitive) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Game Format
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
                            <h4 className="font-bold text-gray-800">Just for Fun</h4>
                            <p className="text-xs text-gray-500 mt-1">Free to play</p>
                        </button>
                        <button
                            onClick={() => setBingoType('serious')}
                            className={`p-4 rounded-xl border-2 transition-all ${bingoType === 'serious'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 bg-white'
                                }`}
                        >
                            <span className="text-2xl mb-2 block">💰</span>
                            <h4 className="font-bold text-gray-800">Competitive</h4>
                            <p className="text-xs text-gray-500 mt-1">With entry fee</p>
                        </button>
                    </div>

                    {bingoType === 'serious' && (
                        <div className="mt-3 animate-fade-in space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Entry Fee (Coins)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={entryFee}
                                    onChange={(e) => setEntryFee(e.target.value)}
                                    className="input-field"
                                    placeholder="e.g. 50"
                                />
                            </div>
                            <div className="bg-blue-50 p-3 rounded-xl flex items-start gap-2">
                                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-700">
                                    Players will need to pay {entryFee > 0 ? entryFee : 'coins'} to enter. Winner takes the pot!
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-3 bg-indigo-50 p-3 rounded-xl flex items-start gap-2">
                        <Info size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-indigo-700">
                            <strong>Note:</strong> Boards are always randomized for every player to ensure fairness.
                        </p>
                    </div>
                </div>

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
