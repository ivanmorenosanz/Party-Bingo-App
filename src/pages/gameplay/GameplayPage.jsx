import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Share2, Check, Trophy, ArrowLeft, Crown, Timer, StopCircle, Coins } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { REWARDS } from '../../data/rewards';

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
    const { activeGames, toggleSquare, checkWin, checkFullHouse, leaveRoom, socket, notification, gameResult } = useGame();
    const { earnCoins } = useWallet();
    const { addReward, user } = useAuth();

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

    const handleLeaveGame = () => {
        leaveRoom(code);
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

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            {/* Header */}
            <div className="gradient-header p-6 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGameEnd}
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

                {/* Bingo Grid */}
                {/* Added max-w-sm to limit size and mx-auto */}
                <div className="card w-full max-w-md mx-auto aspect-square flex flex-col justify-center">
                    <p className="text-center text-sm text-gray-500 mb-4">
                        {currentRoom?.calledSquares?.length > 0 ? `${currentRoom.calledSquares.length} numbers called` : 'Waiting for host to call numbers...'}
                    </p>
                    <div
                        className="grid gap-2 w-full h-full"
                        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                    >
                        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                            // Find my mapping
                            const myPlayer = currentRoom?.players?.find(p => p.id === socket.id);
                            const isHost = myPlayer?.isHost;
                            // If no mapping (legacy or Fun mode), use index as is
                            const masterIndex = myPlayer?.boardMapping ? myPlayer.boardMapping[index] : index;

                            // Get content from master list using masterIndex
                            const itemContent = currentRoom?.items?.[masterIndex] || "Free";

                            // In "First to Line" & Host-driven modes, marking is determined by the Host's calls.
                            // If the master index is in calledSquares, it is considered marked for everyone.
                            const isCalled = currentRoom?.calledSquares?.includes(masterIndex);
                            const isMarked = isCalled;

                            return (
                                <button
                                    key={index}
                                    onClick={() => isHost && toggleSquare(code, index, masterIndex)}
                                    disabled={!isHost}
                                    className={`w-full h-full rounded-lg border-2 transition-all flex items-center justify-center text-center font-bold relative
                                        ${!isHost ? 'cursor-default' : 'cursor-pointer hover:bg-primary-50'}
                                        ${isMarked
                                            ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white shadow-lg'
                                            : 'bg-gray-50 border-gray-200 text-gray-700'
                                        }`}
                                    style={{ fontSize: `clamp(0.5rem, ${50 / gridSize}cqw, 1rem)` }} // Responsive font sizing attempt or just small text
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

                {/* Leaderboard */}
                {/* Optional: could hide during game for suspense? Or show live standings if calculated */}
                {/* For now keeping plain list */}
            </div>
        </div>
    );
}
