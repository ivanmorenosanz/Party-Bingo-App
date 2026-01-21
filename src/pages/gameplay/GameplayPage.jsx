import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Share2, Check, Trophy, ArrowLeft, Crown, Timer, StopCircle } from 'lucide-react';
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
        "🌟 You're a natural... at being wrong",
    ],
    low: [
        "🐌 Slow and steady... goes nowhere",
        "🎲 Next time, just roll dice",
        "🤔 Did you even watch the event?",
        "📺 Maybe try watching first next time",
    ],
    medium: [
        "😊 Not bad, not great, just meh",
        "🌤️ You're warming up!",
        "📈 Room for improvement (a lot of it)",
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
        "🧙 Are you a wizard?!",
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
    const size = gridSize;
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

export default function GameplayPage() {
    const navigate = useNavigate();
    const { code } = useParams();
    const { activeGames, toggleSquare, checkWin, checkFullHouse, leaveRoom } = useGame();
    const { earnCoins } = useWallet();
    const { addReward, user } = useAuth();

    const currentRoom = activeGames.find(g => g.code === code);
    const markedSquares = new Set(currentRoom?.markedSquares || []);

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
    const maxScore = (gridSize * gridSize) + (gridSize * 2 + 2) * 3 + 9; // squares + all possible lines + bingo

    // Timer effect
    useEffect(() => {
        if (timeLimit > 0 && !gameEnded) {
            const endTime = gameStartTime + (timeLimit * 60 * 1000);

            const interval = setInterval(() => {
                const remaining = Math.max(0, endTime - Date.now());
                setTimeRemaining(remaining);

                if (remaining === 0) {
                    clearInterval(interval);
                    handleGameEnd();
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [timeLimit, gameStartTime, gameEnded]);

    // Format time remaining
    const formatTime = (ms) => {
        if (!ms) return '--:--';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Check for wins
    useEffect(() => {
        if (gameEnded || !currentRoom) return;

        // checkWin/FullHouse now expect the game object or handle internally?
        // Actually context functions checkWin(game)
        const won = checkWin(currentRoom);
        const full = checkFullHouse(currentRoom);

        if (won && !hasBingo) {
            setHasBingo(true);

            // First bingo reward
            if (!user?.rewards?.includes('first_bingo')) {
                addReward('first_bingo');
                earnCoins(REWARDS.first_bingo.coins, 'First Bingo! 🎯');
                setShowReward(REWARDS.first_bingo);
            } else {
                earnCoins(50, 'Bingo completed!');
            }

            // Speed demon check (under 5 minutes)
            const elapsed = Date.now() - gameStartTime;
            if (elapsed < 5 * 60 * 1000 && !user?.rewards?.includes('speed_demon')) {
                setTimeout(() => {
                    addReward('speed_demon');
                    earnCoins(REWARDS.speed_demon.coins, 'Speed Demon! ⚡');
                }, 2000);
            }
        }

        if (full && !hasFullHouse) {
            setHasFullHouse(true);
            if (!user?.rewards?.includes('full_house')) {
                setTimeout(() => {
                    addReward('full_house');
                    earnCoins(REWARDS.full_house.coins, 'Full House! 🏠');
                    setShowReward(REWARDS.full_house);
                }, hasBingo ? 3000 : 0);
            }
        }
    }, [markedSquares, gridSize, checkWin, checkFullHouse, hasBingo, hasFullHouse, earnCoins, addReward, user?.rewards, gameStartTime, gameEnded]);

    const handleGameEnd = useCallback(() => {
        if (gameEnded) return;

        const scoreData = calculateScore(markedSquares, gridSize);
        setFinalScore(scoreData);
        setFunnyMessage(getFunnyMessage(scoreData.score, maxScore));
        setGameEnded(true);

        // Award coins based on score
        const coinsEarned = scoreData.score * 2;
        if (scoreData.score > 0) {
            earnCoins(coinsEarned, `Game finished! Score: ${scoreData.score}`);
        }

        // Update league score if this is a league game
        if (currentRoom?.leagueId && user?.id) {
            import('../../data/leagues').then(({ updateMemberScore }) => {
                updateMemberScore(currentRoom.leagueId, user.id, {
                    score: scoreData.score,
                    coinsEarned,
                    won: scoreData.hasBingo || scoreData.isFullHouse,
                });
            });
        }
    }, [markedSquares, gridSize, maxScore, earnCoins, gameEnded, currentRoom, user]);

    // Only show current player in leaderboard (no mock players)
    const scoreData = calculateScore(markedSquares, gridSize);
    const leaderboard = [
        { name: user?.username || 'You', squares: markedSquares.size, score: scoreData.score, bingo: hasBingo },
    ];

    const handleLeaveGame = () => {
        leaveRoom(code);
        navigate('/');
    };

    if (!currentRoom) {
        navigate('/');
        return null;
    }

    // Game End Screen
    if (gameEnded && finalScore) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-500 to-accent-500 p-6 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-6">
                        {finalScore.score === 0 ? '🤡' : finalScore.isFullHouse ? '👑' : finalScore.hasBingo ? '🎉' : '🎲'}
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-2">Game Over!</h1>
                    <p className="text-white/80 text-lg mb-6">{funnyMessage}</p>

                    <div className="bg-white/20 backdrop-blur rounded-3xl p-6 w-full max-w-sm mb-6">
                        <div className="text-6xl font-bold text-white mb-2">{finalScore.score}</div>
                        <p className="text-white/80 mb-4">Total Points</p>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-white/10 rounded-xl p-3">
                                <p className="text-2xl font-bold text-white">{finalScore.squarePoints}</p>
                                <p className="text-xs text-white/70">Squares</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3">
                                <p className="text-2xl font-bold text-white">{finalScore.linesCompleted}</p>
                                <p className="text-xs text-white/70">Lines ×3</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3">
                                <p className="text-2xl font-bold text-white">{finalScore.isFullHouse ? '+9' : '0'}</p>
                                <p className="text-xs text-white/70">Bingo</p>
                            </div>
                        </div>
                    </div>

                    {/* Final Leaderboard */}
                    <div className="bg-white rounded-2xl p-4 w-full max-w-sm mb-6">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
                            <Trophy className="text-yellow-500" size={20} />
                            Final Standings
                        </h3>
                        <div className="space-y-2">
                            {leaderboard.map((player, index) => (
                                <div
                                    key={player.name}
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
                                        <span className="font-semibold text-gray-700">{player.name}</span>
                                    </div>
                                    <div className="font-bold text-primary-600">{player.score} pts</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleLeaveGame}
                        className="w-full max-w-sm bg-white text-primary-600 py-4 rounded-xl font-bold text-lg shadow-lg"
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
                <div className="flex items-center justify-center gap-4 mt-3">
                    <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
                        <span className="text-white/80 text-sm">Score: </span>
                        <span className="text-white font-bold text-xl">{scoreData.score}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
                        <span className="text-white/80 text-sm">Lines: </span>
                        <span className="text-white font-bold text-xl">{scoreData.linesCompleted}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Bingo Alert */}
                {hasBingo && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-2xl shadow-lg text-center animate-scale-in">
                        <h2 className="text-3xl font-bold text-white mb-2">🎉 BINGO! 🎉</h2>
                        <p className="text-white">You completed a line! +9 bonus points!</p>
                        {hasFullHouse && (
                            <p className="text-white/90 mt-2 font-semibold">🏠 Full House!</p>
                        )}
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
                            <div className="bg-green-100 text-green-700 py-3 px-6 rounded-xl inline-block font-bold">
                                +{showReward.coins} 🪙
                            </div>
                            <button className="block w-full mt-6 text-primary-600 font-semibold">
                                Tap to continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Bingo Grid */}
                <div className="card">
                    <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                    >
                        {currentRoom?.items.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => toggleSquare(code, index)}
                                className={`aspect-square p-2 rounded-xl border-2 transition-all flex items-center justify-center text-center text-xs font-semibold relative
                  ${markedSquares.has(index)
                                        ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white shadow-lg scale-95'
                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                                    }`}
                            >
                                {markedSquares.has(index) && (
                                    <Check className="absolute" size={28} strokeWidth={3} />
                                )}
                                <span className={markedSquares.has(index) ? 'opacity-40' : ''}>
                                    {item}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="card">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={20} />
                        Leaderboard
                    </h3>
                    <div className="space-y-2">
                        {leaderboard.map((player, index) => (
                            <div
                                key={player.name}
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
                                    <span className="font-semibold text-gray-700">{player.name}</span>
                                    {player.bingo && <span className="badge-success">BINGO!</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">
                                        {player.squares}/{gridSize * gridSize}
                                    </span>
                                    <span className="font-bold text-primary-600">{player.score} pts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* End Game Button */}
                <button
                    onClick={handleGameEnd}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                >
                    <StopCircle size={20} />
                    End Game & See Results
                </button>
            </div>
        </div>
    );
}
