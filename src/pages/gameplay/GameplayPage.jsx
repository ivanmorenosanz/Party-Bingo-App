import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Share2, Check, Trophy, ArrowLeft, Crown } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { REWARDS } from '../../data/rewards';

export default function GameplayPage() {
    const navigate = useNavigate();
    const { code } = useParams();
    const { currentRoom, markedSquares, toggleSquare, checkWin, checkFullHouse, leaveRoom } = useGame();
    const { earnCoins } = useWallet();
    const { addReward, user } = useAuth();
    const [hasBingo, setHasBingo] = useState(false);
    const [hasFullHouse, setHasFullHouse] = useState(false);
    const [showReward, setShowReward] = useState(null);
    const [gameStartTime] = useState(Date.now());

    const gridSize = currentRoom?.gridSize || 3;

    // Check for wins
    useEffect(() => {
        const won = checkWin(gridSize);
        const full = checkFullHouse(gridSize);

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
    }, [markedSquares, gridSize, checkWin, checkFullHouse, hasBingo, hasFullHouse, earnCoins, addReward, user?.rewards, gameStartTime]);

    // Mock leaderboard
    const leaderboard = [
        { name: 'You', squares: markedSquares.size, bingo: hasBingo },
        { name: 'Sarah', squares: Math.min(markedSquares.size - 1, gridSize * gridSize), bingo: false },
        { name: 'Mike', squares: Math.max(0, markedSquares.size - 2), bingo: false },
        { name: 'Alex', squares: Math.max(0, markedSquares.size - 3), bingo: false },
    ].sort((a, b) => {
        if (a.bingo !== b.bingo) return b.bingo - a.bingo;
        return b.squares - a.squares;
    });

    const handleEndGame = () => {
        leaveRoom();
        navigate('/');
    };

    if (!currentRoom) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            {/* Header */}
            <div className="gradient-header p-6 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleEndGame}
                            className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">{currentRoom?.name}</h1>
                            <p className="text-white/80 text-sm">Room: {code}</p>
                        </div>
                    </div>
                    <button className="bg-white/20 backdrop-blur p-2 rounded-lg">
                        <Share2 className="text-white" size={20} />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Bingo Alert */}
                {hasBingo && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-2xl shadow-lg text-center animate-scale-in">
                        <h2 className="text-3xl font-bold text-white mb-2">🎉 BINGO! 🎉</h2>
                        <p className="text-white">You completed a line!</p>
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
                                onClick={() => toggleSquare(index)}
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
                                className={`flex items-center justify-between p-3 rounded-xl ${player.name === 'You' ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
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
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        {player.squares}/{gridSize * gridSize}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* End Game Button */}
                <button
                    onClick={handleEndGame}
                    className="w-full text-gray-500 font-semibold py-3"
                >
                    End Game
                </button>
            </div>
        </div>
    );
}
