import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Share2, Check, Trophy, ArrowLeft, Crown, Timer, StopCircle, Coins, Send, Sparkles, Smile, Eye, Grid } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { REWARDS } from '../../data/rewards';
import { getSkinById } from '../../data/skins';
import ReactionPicker from '../../components/reactions/ReactionPicker';
import ReactionContainer from '../../components/reactions/ReactionContainer';

// Funny messages based on score
const FUNNY_MESSAGES = {
    zero: [
        "🎯 Best prediction ever! (not)",
        "📊 Statistically impressive failure!",
        "🔮 Your crystal ball needs new batteries",
        "🎪 The circus called, they want their fortune teller back",
    ],
    low: [
        "🐌 Slow and steady... goes nowhere",
        "🎲 Next time, just roll dice",
        "🤔 Did you even watch the event?",
    ],
    medium: [
        "😊 Not bad, not great, just meh",
        "🌤️ You're warming up!",
        "📈 Room for improvement",
    ],
    high: [
        "🔥 You're on fire!",
        "🎯 Sharp shooter!",
        "✨ The prophecy is real!",
    ],
    perfect: [
        "🏆 ABSOLUTE LEGEND!",
        "👑 All hail the prediction king/queen!",
        "🎰 Buy a lottery ticket NOW!",
    ],
};

const getFunnyMessage = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    let category;
    if (score === 0) category = 'zero';
    else if (percentage < 25) category = 'low';
    else if (percentage < 60) category = 'medium';
    else if (percentage < 100) category = 'high';
    else category = 'perfect';

    const messages = FUNNY_MESSAGES[category];
    return messages[Math.floor(Math.random() * messages.length)];
};

// Calculate score based on marked squares
const calculateScore = (markedSquares, gridSize) => {
    const size = gridSize || 3;
    let score = 0;
    let rowsCompleted = 0;
    let colsCompleted = 0;

    // Points for each marked square (1 point each)
    const squarePoints = markedSquares.size;
    score += squarePoints;

    // Check for completed lines (3 points each)
    const checkLine = (indices) => indices.every(i => markedSquares.has(i));

    // Rows (3 points each)
    for (let i = 0; i < size; i++) {
        const row = Array.from({ length: size }, (_, j) => i * size + j);
        if (checkLine(row)) {
            rowsCompleted++;
        }
    }

    // Columns (3 points each)
    for (let i = 0; i < size; i++) {
        const col = Array.from({ length: size }, (_, j) => j * size + i);
        if (checkLine(col)) {
            colsCompleted++;
        }
    }

    const linesCompleted = rowsCompleted + colsCompleted;

    // Add line points (3 points per line - rows and columns only)
    score += linesCompleted * 3;

    // Full house / Bingo bonus (9 points if all squares marked)
    const isFullHouse = markedSquares.size === size * size;
    if (isFullHouse) {
        score += 9;
    }

    // Has bingo if at least one line completed
    const hasBingo = linesCompleted > 0;

    return { score, squarePoints, linesCompleted, rowsCompleted, colsCompleted, hasBingo, isFullHouse };
};

const formatTime = (ms) => {
    if (!ms || ms < 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function GameplayPage() {
    const navigate = useNavigate();
    const { code } = useParams();
    const { activeGames, toggleSquare, checkWin, checkFullHouse, leaveRoom, backgroundGame, socket, notification, gameResult, submitSquares, focusGame, removeFinishedGame } = useGame();
    const { earnCoins } = useWallet();
    const { addReward, user } = useAuth();

    // Crowd Shuffle contribution state
    const [mySquares, setMySquares] = useState(['', '', '', '', '']);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Reaction picker state
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    // User's selected bingo skin (from user settings or default)
    const activeSkin = getSkinById(user?.activeSkin || 'default');

    // Host view mode: 'host' = see all items to call, 'player' = see own board
    const [hostViewMode, setHostViewMode] = useState('player');

    if (!socket) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const currentRoom = activeGames.find(g => g.code === code);
    const markedSquares = new Set(currentRoom?.markedSquares?.[socket.id] || []);

    const [hasBingo, setHasBingo] = useState(false);
    const [hasFullHouse, setHasFullHouse] = useState(false);
    const [showReward, setShowReward] = useState(null);
    const gameStartTime = currentRoom?.startTime || Date.now();
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);
    const [finalScore, setFinalScore] = useState(null);
    const [funnyMessage, setFunnyMessage] = useState('');

    const gridSize = currentRoom?.gridSize || 3;
    const timeLimit = currentRoom?.timeLimit || 0; // in minutes
    // ...

    // React to server game end signal (triggered by socket event -> context -> gameResult)
    useEffect(() => {
        if (currentRoom?.status === 'finished' && !gameEnded) {
            handleGameEnd();
        }
    }, [currentRoom?.status, gameEnded]);

    // ... (timer effects)

    const handleGameEnd = useCallback(() => {
        if (gameEnded) return;

        setGameEnded(true);

        // Check for prize
        if (gameResult?.prizeAmount > 0) {
            const isWinner = gameResult.winnerId === socket.id || (user?.id && gameResult.winnerId === user.id);
            if (isWinner) {
                earnCoins(gameResult.prizeAmount, `Prize for winning ${currentRoom?.name || 'Bingo'}`);
            }
        }
    }, [gameEnded, gameResult, socket.id, user, earnCoins, currentRoom]);

    // ...

    // Put game in background (navigate away without leaving)
    const handleBackToHome = () => {
        backgroundGame();
        navigate('/');
    };

    // Permanently leave the game
    const handleLeaveGame = () => {
        if (gameEnded) {
            removeFinishedGame(code);
        } else {
            leaveRoom(code);
        }
        navigate('/');
    };

    if (!currentRoom) {
        navigate('/');
        return null;
    }

    // Consolidated Leaderboard Data
    // If gameResult exists (Server authoritative), use it. Else fall back to local (legacy/single player)
    const displayLeaderboard = gameResult?.leaderboard?.map(p => ({
        name: p.name,
        score: p.score,
        squares: p.squares,
        bingo: p.isWinner // Approximation
    })) || [
            { name: user?.username || 'You', squares: markedSquares.size, score: 0, bingo: hasBingo } // Placeholder if no result
        ];

    // Find my result in server data if available
    const myResult = gameResult?.leaderboard?.find(p => p.id === socket.id || p.id === user?.id);
    const myScore = myResult ? myResult.score : 0;

    // Game End Screen
    if (gameEnded) {
        const isWinner = gameResult?.winnerId === socket.id || (user?.id && gameResult?.winnerId === user.id);

        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500 p-6 flex flex-col items-center">
                <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-6 animate-bounce-in">
                        {isWinner ? '👑' : '🏁'}
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-2">
                        {isWinner ? 'You Won!' : 'Game Over!'}
                    </h1>
                    <p className="text-white/80 text-lg mb-6">
                        {gameResult?.winnerName ? `${gameResult.winnerName} took the crown!` : 'Well played!'}
                    </p>

                    <div className="bg-white/20 backdrop-blur rounded-3xl p-6 w-full mb-6">
                        <div className="text-6xl font-bold text-white mb-2">{myScore}</div>
                        <p className="text-white/80 mb-4">Your Points</p>

                        {/* Stats if available */}
                        {myResult && (
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-white/10 rounded-xl p-3">
                                    <p className="text-2xl font-bold text-white">{myResult.squares}</p>
                                    <p className="text-xs text-white/70">Squares</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-3">
                                    <p className="text-2xl font-bold text-white">{myResult.lines}</p>
                                    <p className="text-xs text-white/70">Lines</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Final Leaderboard */}
                    <div className="bg-white rounded-2xl p-4 w-full mb-6 flex-1 max-h-[40vh] overflow-y-auto">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-center gap-2 sticky top-0 bg-white pb-2 border-b border-gray-100 z-10">
                            <Trophy className="text-yellow-500" size={20} />
                            Final Standings
                        </h3>
                        <div className="space-y-2">
                            {displayLeaderboard.map((player, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-xl ${player.name === (user?.username || 'You') ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold ${index === 0 ? 'text-yellow-500' :
                                            index === 1 ? 'text-gray-400' :
                                                index === 2 ? 'text-orange-400' : 'text-gray-500'
                                            }`}>
                                            {index === 0 ? <Crown size={18} /> : `#${index + 1}`}
                                        </span>
                                        <span className="font-semibold text-gray-700 truncate max-w-[120px]">{player.name}</span>
                                    </div>
                                    <div className="font-bold text-primary-600">{player.score} pts</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleLeaveGame}
                        className="w-full bg-white text-primary-600 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Crowd Shuffle: Collecting Phase
    if (currentRoom?.status === 'collecting') {
        const minSquares = currentRoom?.minSquaresPerPlayer || 3;
        const progress = currentRoom?.contributionProgress || { playersSubmitted: 0, totalPlayers: currentRoom?.players?.length || 1 };
        const myPlayerId = user?.id || socket.id;
        const alreadySubmitted = currentRoom?.contributions?.[myPlayerId]?.length > 0 || hasSubmitted;

        const handleSquareChange = (index, value) => {
            const newSquares = [...mySquares];
            newSquares[index] = value;
            setMySquares(newSquares);
        };

        const handleAddSquare = () => {
            setMySquares(prev => [...prev, '']);
        };

        const handleSubmitSquares = () => {
            const validSquares = mySquares.filter(s => s.trim());
            if (validSquares.length < minSquares) {
                alert(`Please enter at least ${minSquares} squares`);
                return;
            }
            submitSquares(code, validSquares);
            setHasSubmitted(true);
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 p-6">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={handleBackToHome}
                            className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">{currentRoom?.name}</h1>
                            <p className="text-white/80 text-sm">Crowd Shuffle</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold flex items-center gap-2">
                                <Sparkles size={18} />
                                Collecting Squares
                            </span>
                            <span className="text-white/80 text-sm">
                                {progress.playersSubmitted}/{progress.totalPlayers} submitted
                            </span>
                        </div>
                        <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${(progress.playersSubmitted / progress.totalPlayers) * 100}%` }}
                            />
                        </div>
                    </div>

                    {alreadySubmitted ? (
                        <div className="bg-white rounded-2xl p-6 text-center">
                            <div className="text-4xl mb-3">✅</div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Squares Submitted!</h2>
                            <p className="text-gray-500">Waiting for other players...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-6">
                            <h2 className="font-bold text-gray-800 mb-1">Add Your Squares</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Enter at least {minSquares} predictions for the bingo board
                            </p>

                            <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto">
                                {mySquares.map((square, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        placeholder={`Square ${index + 1}`}
                                        value={square}
                                        onChange={(e) => handleSquareChange(index, e.target.value)}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleAddSquare}
                                className="w-full py-2 text-purple-600 font-semibold border-2 border-dashed border-purple-300 rounded-xl mb-4 hover:bg-purple-50"
                            >
                                + Add Another Square
                            </button>

                            <button
                                onClick={handleSubmitSquares}
                                disabled={mySquares.filter(s => s.trim()).length < minSquares}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Send size={18} />
                                Submit Squares ({mySquares.filter(s => s.trim()).length}/{minSquares} min)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            {/* Header */}
            <div className="gradient-header p-6 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackToHome}
                            className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">{currentRoom?.name}</h1>
                            <p className="text-white/80 text-sm">Room: {code}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Timer */}
                        {timeLimit > 0 && (
                            <div className={`bg-white/20 backdrop-blur px-3 py-2 rounded-lg flex items-center gap-2 ${timeRemaining && timeRemaining < 60000 ? 'animate-pulse bg-red-500/50' : ''
                                }`}>
                                <Timer size={16} className="text-white" />
                                <span className="text-white font-mono font-bold">{formatTime(timeRemaining)}</span>
                            </div>
                        )}
                        {/* Reaction Button */}
                        <button
                            onClick={() => setShowReactionPicker(true)}
                            className="bg-white/20 backdrop-blur p-2 rounded-lg hover:bg-white/30 transition-colors"
                        >
                            <Smile className="text-white" size={20} />
                        </button>
                        <button className="bg-white/20 backdrop-blur p-2 rounded-lg">
                            <Share2 className="text-white" size={20} />
                        </button>
                    </div>
                </div>

                {/* Score Display */}
                {/* Note: In host-driven mode, score is server side. We can display local approx or hide */}
                <div className="flex items-center justify-center gap-4 mt-3">
                    <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
                        <span className="text-white/80 text-sm">Valid Marks: </span>
                        <span className="text-white font-bold text-xl">{markedSquares.size}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4 max-w-lg mx-auto">
                {/* Bingo Alert */}
                {hasBingo && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-2xl shadow-lg text-center animate-scale-in">
                        <h2 className="text-3xl font-bold text-white mb-2">🎉 BINGO! 🎉</h2>
                        <p className="text-white">You completed a line!</p>
                    </div>
                )}

                {/* Reward Popup */}
                {showReward && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                        onClick={() => setShowReward(null)}
                    >
                        <div className="bg-white p-8 rounded-3xl text-center animate-scale-in max-w-sm w-full">
                            <div className="text-6xl mb-4">{showReward.icon}</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{showReward.name}</h3>
                            <p className="text-gray-600 mb-4">{showReward.description}</p>
                            <div className="bg-green-100 text-green-700 py-3 px-6 rounded-xl inline-flex items-center gap-2 font-bold justify-center">
                                +{showReward.coins} <Coins size={16} />
                            </div>
                            <button className="block w-full mt-6 text-primary-600 font-semibold">
                                Tap to continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Notification Toast */}
                {notification && (
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl animate-bounce-in flex items-center gap-3
                        ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-primary-600 text-white'}
                    `}>
                        {notification.type === 'bingo' ? <Trophy size={20} className="text-yellow-300" /> : null}
                        <span className="font-bold">{notification.message}</span>
                    </div>
                )}

                {/* Bingo Grid Section */}
                {(() => {
                    const myPlayer = currentRoom?.players?.find(p => p.id === socket.id);
                    const isHost = myPlayer?.isHost;
                    const masterItems = currentRoom?.items || [];
                    const calledSquares = currentRoom?.calledSquares || [];

                    // For Host View: show ALL master items
                    // For Player View: show randomized board (using boardMapping)
                    const showHostView = isHost && hostViewMode === 'host';

                    return (
                        <>
                            {/* Host View Toggle (only for host) */}
                            {isHost && (
                                <div className="flex justify-center gap-2 mb-4">
                                    <button
                                        onClick={() => setHostViewMode('host')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${hostViewMode === 'host'
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Crown size={18} />
                                        Host View
                                    </button>
                                    <button
                                        onClick={() => setHostViewMode('player')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${hostViewMode === 'player'
                                            ? 'bg-accent-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Eye size={18} />
                                        My Board
                                    </button>
                                </div>
                            )}

                            {/* Host View: All Master Items Grid */}
                            {showHostView && (
                                <div className="card w-full max-w-md mx-auto">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            <Crown className="text-yellow-500" size={18} />
                                            Call Numbers
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {calledSquares.length}/{masterItems.length} called
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Tap a square to call it for all players
                                    </p>
                                    <div
                                        className="grid gap-2"
                                        style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(masterItems.length))}, 1fr)` }}
                                    >
                                        {masterItems.map((item, masterIndex) => {
                                            const isCalled = calledSquares.includes(masterIndex);

                                            return (
                                                <button
                                                    key={masterIndex}
                                                    onClick={() => toggleSquare(code, masterIndex, masterIndex)}
                                                    className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center text-center font-bold relative p-1
                                                        cursor-pointer hover:scale-105
                                                        ${isCalled
                                                            ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white shadow-lg'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'
                                                        }`}
                                                >
                                                    {isCalled && (
                                                        <Check className="absolute opacity-50" size={32} strokeWidth={4} />
                                                    )}
                                                    <span className="break-words text-xs">
                                                        {item}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Player View: Personal Bingo Board */}
                            {!showHostView && (
                                <div className="card w-full max-w-md mx-auto aspect-square flex flex-col justify-center">
                                    <p className="text-center text-sm text-gray-500 mb-4">
                                        {isHost
                                            ? 'Your randomized board - switch to Host View to call numbers!'
                                            : calledSquares.length > 0
                                                ? `${calledSquares.length} numbers called`
                                                : 'Waiting for host to call numbers...'}
                                    </p>
                                    <div
                                        className="grid gap-2 w-full h-full"
                                        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                                    >
                                        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                                            // Get master index from player's board mapping
                                            const masterIndex = myPlayer?.boardMapping ? myPlayer.boardMapping[index] : index;
                                            const itemContent = masterItems[masterIndex] || "Free";
                                            const isCalled = calledSquares.includes(masterIndex);
                                            const isMarked = isCalled;

                                            return (
                                                <button
                                                    key={index}
                                                    disabled={true}
                                                    className={`w-full h-full rounded-lg border-2 transition-all flex items-center justify-center text-center font-bold relative cursor-default
                                                        ${isMarked
                                                            ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white shadow-lg'
                                                            : 'bg-gray-50 border-gray-200 text-gray-700'
                                                        }`}
                                                    style={{ fontSize: `clamp(0.5rem, ${50 / gridSize}cqw, 1rem)` }}
                                                >
                                                    {isMarked && (
                                                        <Check className="absolute opacity-50" size={40} strokeWidth={4} />
                                                    )}
                                                    <span className={`break-words p-1 text-xs sm:text-sm ${isMarked ? 'opacity-100' : ''}`}>
                                                        {itemContent}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    );
                })()}

                {/* Leaderboard */}
                {/* Optional: could hide during game for suspense? Or show live standings if calculated */}
                {/* For now keeping plain list */}
            </div>

            {/* Floating Reactions Container */}
            <ReactionContainer />

            {/* Reaction Picker Modal */}
            {showReactionPicker && (
                <ReactionPicker
                    roomCode={code}
                    onClose={() => setShowReactionPicker(false)}
                />
            )}
        </div>
    );
}
