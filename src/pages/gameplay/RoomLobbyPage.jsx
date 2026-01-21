import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Copy, Check, Share2, Sparkles, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

export default function RoomLobbyPage() {
    const navigate = useNavigate();
    const { code } = useParams();
    const { activeGames, startGame, leaveRoom, updateGame, socket } = useGame();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

    const currentRoom = activeGames.find(g => g.code === code);
    const players = currentRoom?.players || [];
    const isHost = currentRoom?.players?.find(p => p.id === socket?.id)?.isHost;



    // Crowd Shuffle state
    const [mySquares, setMySquares] = useState([]);
    const [currentSquareInput, setCurrentSquareInput] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [allContributions, setAllContributions] = useState([]);

    const isCrowdShuffle = currentRoom?.gameMode === 'crowd_shuffle';
    const squaresPerPlayer = currentRoom?.squaresPerPlayer || 3;

    // ...

    const allPlayersSubmitted = players.every(p => p.hasSubmitted);
    const canStartGame = isCrowdShuffle ? (allPlayersSubmitted && isHost) : isHost;

    // Auto-navigate to game when status changes to playing
    useEffect(() => {
        if (currentRoom?.status === 'playing') {
            navigate(`/play/${code}`);
        }
    }, [currentRoom?.status, code, navigate]);
    const copyRoomCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleAddSquare = () => {
        if (currentSquareInput.trim() && mySquares.length < squaresPerPlayer) {
            setMySquares([...mySquares, currentSquareInput.trim()]);
            setCurrentSquareInput('');
        }
    };

    const handleRemoveSquare = (index) => {
        setMySquares(mySquares.filter((_, i) => i !== index));
    };

    const handleSubmitSquares = () => {
        if (mySquares.length === squaresPerPlayer) {
            setHasSubmitted(true);
            setAllContributions([{ playerId: user?.id || 'host', squares: mySquares }]);
            // Update player status
            updateGame(code, {
                players: players.map(p =>
                    p.id === (user?.id || 'host') ? { ...p, hasSubmitted: true } : p
                )
            });
        }
    };

    const handleStartGame = () => {
        if (isCrowdShuffle) {
            // Generate random boards for each player
            const allSquares = allContributions.flatMap(c => c.squares);
            const gridSize = currentRoom?.gridSize || 3;
            const totalSquares = gridSize * gridSize;

            // Create shuffled board for this player
            // Each player gets a random selection, but same squares can appear on different boards
            const shuffledItems = [];
            const availableSquares = [...allSquares];

            for (let i = 0; i < totalSquares; i++) {
                if (availableSquares.length === 0) {
                    // Reset pool if we run out
                    availableSquares.push(...allSquares);
                }
                const randomIndex = Math.floor(Math.random() * availableSquares.length);
                const square = availableSquares[randomIndex];

                // Only add if not already in our board
                if (!shuffledItems.includes(square)) {
                    shuffledItems.push(square);
                    availableSquares.splice(randomIndex, 1);
                } else {
                    // Conflict found
                    availableSquares.splice(randomIndex, 1);

                    if (availableSquares.length === 0) {
                        // Try to find any unused squares
                        const unused = allSquares.filter(s => !shuffledItems.includes(s));
                        availableSquares.push(...unused);

                        if (availableSquares.length === 0) {
                            // Not enough unique squares, fill with duplicates
                            shuffledItems.push(allSquares[Math.floor(Math.random() * allSquares.length)]);
                            // We successfully added an item, so we proceed to next index (no i--)
                        } else {
                            // We found unused squares, retry this index
                            i--;
                        }
                    } else {
                        // We still have candidates in availableSquares, retry this index
                        i--;
                    }
                }
            }

            // Update room with generated items
            updateGame(code, { items: shuffledItems.slice(0, totalSquares) });
        }

        startGame(code);
        navigate(`/play/${code}`);
    };

    const handleLeave = () => {
        if (currentRoom?.entryFee > 0) {
            setShowLeaveConfirmation(true);
        } else {
            leaveRoom(code);
            navigate('/');
        }
    };

    const confirmLeave = () => {
        leaveRoom(code);
        navigate('/');
    };

    const handleQuit = () => {
        // Use this if we want to actually leave/destroy the game
        leaveRoom(code);
        navigate('/');
    };

    if (!currentRoom) {
        navigate('/');
        return null;
    }



    return (
        <div className="min-h-screen">
            <Header
                title={currentRoom?.name || 'Room'}
                showBack
                backPath="/"
            />

            <div className="p-6 space-y-6">
                {/* Room Code Card */}
                <div className="card text-center">
                    <p className="text-sm text-gray-500 mb-2">Room Code</p>
                    <div className="flex items-center justify-center gap-3">
                        <h2 className="text-4xl font-bold text-primary-600 tracking-wider">
                            {code}
                        </h2>
                        <button
                            onClick={copyRoomCode}
                            className="bg-primary-100 p-2 rounded-lg hover:bg-primary-200 transition-colors"
                        >
                            {copied ? (
                                <Check className="text-green-600" size={20} />
                            ) : (
                                <Copy className="text-primary-600" size={20} />
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Share this code with friends</p>

                    <button className="mt-4 flex items-center gap-2 mx-auto text-primary-600 font-semibold">
                        <Share2 size={18} />
                        <span>Share Invite</span>
                    </button>
                </div>

                {/* Game Info */}
                <div className="card">
                    <h3 className="font-bold text-gray-800 mb-3">Game Settings</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Grid Size</p>
                            <p className="font-bold text-gray-800">{currentRoom?.gridSize}×{currentRoom?.gridSize}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="font-bold text-gray-800 capitalize">{currentRoom?.type}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Mode</p>
                            <p className="font-bold text-gray-800 capitalize flex items-center gap-1">
                                {isCrowdShuffle ? (
                                    <>
                                        <Sparkles size={14} className="text-pink-500" />
                                        <span className="text-sm">Shuffle</span>
                                    </>
                                ) : 'Classic'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Crowd Shuffle: Square Submission */}
                {isCrowdShuffle && !hasSubmitted && (
                    <div className="card border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Sparkles className="text-pink-500" size={20} />
                            Add Your Squares ({mySquares.length}/{squaresPerPlayer})
                        </h3>

                        <div className="space-y-3">
                            {/* Added squares */}
                            {mySquares.map((square, index) => (
                                <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                                    <span className="flex-1 text-gray-800">{square}</span>
                                    <button
                                        onClick={() => handleRemoveSquare(index)}
                                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            {/* Input for new square */}
                            {mySquares.length < squaresPerPlayer && (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter a bingo square..."
                                        value={currentSquareInput}
                                        onChange={(e) => setCurrentSquareInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSquare()}
                                        className="flex-1 input-field"
                                    />
                                    <button
                                        onClick={handleAddSquare}
                                        disabled={!currentSquareInput.trim()}
                                        className="btn-primary px-4"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            )}

                            {/* Submit button */}
                            {mySquares.length === squaresPerPlayer && (
                                <button
                                    onClick={handleSubmitSquares}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Submit My Squares
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Crowd Shuffle: Waiting for others */}
                {isCrowdShuffle && hasSubmitted && !allPlayersSubmitted && (
                    <>
                        <div className="card bg-green-50 border-2 border-green-200">
                            <div className="text-center">
                                <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                                <h3 className="font-bold text-gray-800 mb-2">Squares Submitted!</h3>
                                <p className="text-gray-600 text-sm">Waiting for other players to submit their squares...</p>
                            </div>
                        </div>

                        {/* Popup Overlay */}
                        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6 backdrop-blur-sm animate-fade-in">
                            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-scale-in shadow-2xl">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="animate-spin text-4xl">⏳</div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Waiting for Players</h3>
                                <p className="text-gray-600 mb-6">
                                    Please wait while other players finish submitting their bingo squares.
                                </p>
                                <div className="flex justify-center gap-2">
                                    {players.filter(p => !p.hasSubmitted).map(p => (
                                        <div key={p.id} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                                            {p.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Players */}
                <div className="card">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Players ({players.length})
                    </h3>
                    <div className="space-y-2">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl animate-slide-up"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                                    {player.name[0]}
                                </div>
                                <span className="font-semibold text-gray-700 flex-1">{player.name}</span>
                                {player.isHost && (
                                    <span className="badge-warning">Host</span>
                                )}
                                {isCrowdShuffle && player.hasSubmitted && (
                                    <CheckCircle className="text-green-500" size={20} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                {canStartGame ? (
                    <button
                        onClick={handleStartGame}
                        className="w-full btn-primary"
                    >
                        Start Game
                    </button>
                ) : isCrowdShuffle && !hasSubmitted ? (
                    <div className="text-center p-4 bg-pink-50 rounded-xl">
                        <p className="text-pink-700 font-semibold">Submit your squares to continue</p>
                    </div>
                ) : !isHost ? (
                    <div className="text-center p-4 bg-primary-50 rounded-xl">
                        <div className="animate-pulse flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                            <p className="text-primary-700 font-semibold">Waiting for host to start...</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-yellow-50 rounded-xl">
                        <p className="text-yellow-700 font-semibold">Waiting for all players to submit squares...</p>
                    </div>
                )}

                <button
                    onClick={handleLeave}
                    className="w-full text-gray-500 font-semibold py-3"
                >
                    Leave Room
                </button>
            </div>

            {/* Leave Confirmation Modal */}
            {showLeaveConfirmation && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center animate-scale-in shadow-2xl">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Leave Room?</h3>
                        <p className="text-gray-600 mb-6">
                            This room has an entry fee of <strong>{currentRoom?.entryFee} coins</strong>.
                            If you leave now, you might lose your stake if the game has already started or if per-game rules apply.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveConfirmation(false)}
                                className="flex-1 py-3 font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLeave}
                                className="flex-1 py-3 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30"
                            >
                                Leave Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
