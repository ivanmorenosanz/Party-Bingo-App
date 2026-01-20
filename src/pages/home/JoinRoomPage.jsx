import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, QrCode } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useGame } from '../../context/GameContext';
import { COMMUNITY_BINGOS } from '../../data/bingos';

export default function JoinRoomPage() {
    const navigate = useNavigate();
    const { joinRoom } = useGame();
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');

    const handleJoinRoom = () => {
        if (roomCode.length !== 6) {
            setError('Room code must be 6 characters');
            return;
        }

        // Mock room data - in production would fetch from server
        const mockRoom = {
            name: 'Demo Room',
            items: COMMUNITY_BINGOS[0].items,
            gridSize: 3,
            type: 'fun',
        };

        joinRoom(roomCode, mockRoom);
        navigate(`/room/${roomCode.toUpperCase()}`);
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setRoomCode(value);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Join Room" showBack />

            <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <div className="text-center mb-8">
                    <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-primary-600" size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Room Code</h2>
                    <p className="text-gray-500">Ask your host for the 6-digit code</p>
                </div>

                <input
                    type="text"
                    placeholder="ABC123"
                    value={roomCode}
                    onChange={handleCodeChange}
                    maxLength={6}
                    className="w-full max-w-xs p-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none text-center text-3xl font-bold tracking-[0.3em] mb-2"
                />

                {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                )}

                <button
                    onClick={handleJoinRoom}
                    disabled={roomCode.length !== 6}
                    className="w-full max-w-xs btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    Join Room
                </button>

                <div className="mt-8 flex items-center gap-2 text-gray-400">
                    <div className="h-px w-12 bg-gray-300"></div>
                    <span className="text-sm">or</span>
                    <div className="h-px w-12 bg-gray-300"></div>
                </div>

                <button className="mt-4 flex items-center gap-2 text-primary-600 font-semibold">
                    <QrCode size={20} />
                    <span>Scan QR Code</span>
                </button>
            </div>
        </div>
    );
}
