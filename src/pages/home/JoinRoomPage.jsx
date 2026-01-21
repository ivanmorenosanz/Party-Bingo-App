import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, QrCode, Coins } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { COMMUNITY_BINGOS } from '../../data/bingos';

export default function JoinRoomPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { joinRoom, activeGames, socket } = useGame();
    const { spendCoins, coins } = useWallet();
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [paymentModal, setPaymentModal] = useState(null);

    // Navigate when room is joined
    useEffect(() => {
        if (isJoining && activeGames.find(g => g.code === roomCode)) {
            navigate(`/room/${roomCode}`);
        }
    }, [activeGames, isJoining, roomCode, navigate]);

    const executeJoin = () => {
        const player = {
            name: user?.username || 'Guest',
            id: user?.id,
            isHost: false
        };

        setIsJoining(true);
        joinRoom(roomCode, player);
    };

    const handleJoinRoom = () => {
        if (roomCode.length !== 6) {
            setError('Room code must be 6 characters');
            return;
        }

        setIsJoining(true);
        setError('');

        if (socket) {
            socket.emit('check_room', { code: roomCode }, (response) => {
                if (!response.exists) {
                    setError('Room not found');
                    setIsJoining(false);
                    return;
                }

                if (response.entryFee > 0) {
                    setPaymentModal({
                        name: response.name,
                        fee: response.entryFee,
                        type: response.type
                    });
                    setIsJoining(false); // Pause to get confirmation
                } else {
                    executeJoin();
                }
            });
        } else {
            setError('Connection error. Please try again.');
            setIsJoining(false);
        }
    };

    const confirmPayment = () => {
        if (coins < paymentModal.fee) {
            setError(`Insufficient coins! You need ${paymentModal.fee} coins.`);
            setPaymentModal(null);
            return;
        }
        spendCoins(paymentModal.fee, `Entry fee for ${paymentModal.name}`);
        setPaymentModal(null);
        executeJoin();
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
                    disabled={roomCode.length !== 6 || isJoining}
                    className="w-full max-w-xs btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
                >
                    {isJoining ? 'Joining...' : 'Join Room'}
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

            {/* Payment Modal */}
            {paymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-white p-8 rounded-3xl text-center animate-scale-in max-w-sm w-full">
                        <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Coins className="text-yellow-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Entry Fee Required</h3>
                        <p className="text-gray-600 mb-6">
                            This is a competitive room. Join <strong>{paymentModal.name}</strong> for:
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                            <span className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                                {paymentModal.fee} <Coins className="text-yellow-500" size={24} />
                            </span>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={confirmPayment}
                                className="w-full btn-primary"
                            >
                                Pay & Join
                            </button>
                            <button
                                onClick={() => setPaymentModal(null)}
                                className="w-full py-3 text-gray-500 font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
