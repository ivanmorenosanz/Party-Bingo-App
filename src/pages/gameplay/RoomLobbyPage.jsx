import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Copy, Check, Share2 } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useGame } from '../../context/GameContext';

export default function RoomLobbyPage() {
    const navigate = useNavigate();
    const { code } = useParams();
    const { currentRoom, startGame, leaveRoom, setPlayers } = useGame();
    const [copied, setCopied] = useState(false);

    // Mock players joining
    useEffect(() => {
        const mockPlayers = [
            { id: 'host', name: 'You', isHost: currentRoom?.isHost, markedCount: 0 },
            { id: '2', name: 'Sarah', isHost: false, markedCount: 0 },
            { id: '3', name: 'Mike', isHost: false, markedCount: 0 },
            { id: '4', name: 'Alex', isHost: false, markedCount: 0 },
        ];

        // Simulate players joining one by one
        const timer1 = setTimeout(() => setPlayers(mockPlayers.slice(0, 2)), 500);
        const timer2 = setTimeout(() => setPlayers(mockPlayers.slice(0, 3)), 1500);
        const timer3 = setTimeout(() => setPlayers(mockPlayers), 2500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [setPlayers, currentRoom?.isHost]);

    const players = [
        { id: 'host', name: 'You', isHost: currentRoom?.isHost },
        { id: '2', name: 'Sarah', isHost: false },
        { id: '3', name: 'Mike', isHost: false },
        { id: '4', name: 'Alex', isHost: false },
    ];

    const copyRoomCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleStartGame = () => {
        startGame();
        navigate(`/play/${code}`);
    };

    const handleLeave = () => {
        leaveRoom();
        navigate('/');
    };

    if (!currentRoom) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Grid Size</p>
                            <p className="font-bold text-gray-800">{currentRoom?.gridSize}×{currentRoom?.gridSize}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="font-bold text-gray-800 capitalize">{currentRoom?.type}</p>
                        </div>
                    </div>
                </div>

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
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                {currentRoom?.isHost ? (
                    <button
                        onClick={handleStartGame}
                        className="w-full btn-primary"
                    >
                        Start Game
                    </button>
                ) : (
                    <div className="text-center p-4 bg-primary-50 rounded-xl">
                        <div className="animate-pulse flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                            <p className="text-primary-700 font-semibold">Waiting for host to start...</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLeave}
                    className="w-full text-gray-500 font-semibold py-3"
                >
                    Leave Room
                </button>
            </div>
        </div>
    );
}
