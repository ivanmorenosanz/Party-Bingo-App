import { useParams, useNavigate } from 'react-router-dom';
import { Star, TrendingUp, Users, Grid, Play, Lock, Coins } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { getBingoById } from '../../data/bingos';
import { useWallet } from '../../context/WalletContext';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function BingoDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { coins, spendCoins, canAfford } = useWallet();
    const { createRoom, activeGames, currentGameCode } = useGame();
    const { isGuest } = useAuth();

    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (isCreating && currentGameCode) {
            navigate(`/room/${currentGameCode}`);
            setIsCreating(false);
        }
    }, [currentGameCode, isCreating, navigate]);

    const bingo = getBingoById(id);

    useEffect(() => {
        if (!bingo) {
            navigate('/community');
        }
    }, [bingo, navigate]);

    if (!bingo) return null;

    const isCompetitive = bingo.type === 'serious';

    const handlePlay = () => {
        // Guest trying to play competitive bingo
        if (isGuest && isCompetitive) {
            setShowGuestModal(true);
            return;
        }

        if (bingo.price > 0 && !canAfford(bingo.price)) {
            alert('Not enough coins!');
            return;
        }

        if (bingo.price > 0) {
            setShowPurchaseModal(true);
        } else {
            startGame();
        }
    };

    const startGame = () => {
        let items = [...bingo.items];
        if (bingo.type === 'serious') {
            items = shuffleArray(items).slice(0, bingo.gridSize * bingo.gridSize);
        }

        setIsCreating(true);
        createRoom({
            name: bingo.title,
            gridSize: bingo.gridSize,
            type: bingo.type || 'fun',
            items: items,
            gameMode: bingo.gameMode || 'first_to_line',
            communityBingoId: bingo.id,
        });

        if (bingo.price > 0) {
            spendCoins(bingo.price, `Purchased: ${bingo.title}`);
        }
    };

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    return (
        <div className="min-h-screen pb-32">
            <Header title={bingo.title} showBack backPath="/" showCoins />

            <div className="p-6 space-y-6">
                {/* Hero */}
                <div className={`p-6 rounded-2xl text-white ${bingo.type === 'serious'
                    ? 'bg-gradient-to-br from-primary-500 to-accent-500'
                    : 'bg-gradient-to-br from-yellow-400 to-orange-400'
                    }`}>
                    <div className="text-5xl mb-4 text-center">
                        {bingo.type === 'serious' ? '🎯' : '🎉'}
                    </div>
                    <h1 className="text-2xl font-bold text-center mb-2">{bingo.title}</h1>
                    <p className="text-center text-white/80">by {bingo.creator}</p>

                    <div className="flex justify-center gap-6 mt-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{bingo.plays}</p>
                            <p className="text-xs text-white/80">plays</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold flex items-center gap-1">
                                <Star size={20} fill="currentColor" />
                                {bingo.rating}
                            </p>
                            <p className="text-xs text-white/80">rating</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{bingo.gridSize}×{bingo.gridSize}</p>
                            <p className="text-xs text-white/80">grid</p>
                        </div>
                    </div>
                </div>

                {/* Type Badge */}
                {bingo.type === 'serious' && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                        <h3 className="font-bold text-blue-800 mb-1 flex items-center gap-2">
                            🎯 Competitive Bingo
                            {isGuest && <Lock size={14} className="text-blue-600" />}
                        </h3>
                        <p className="text-sm text-blue-700">
                            {isGuest
                                ? 'Create a free account to play competitive bingos!'
                                : 'Each player gets a randomly shuffled board. The creator marks squares as completed for everyone.'}
                        </p>
                    </div>
                )}

                {/* Preview Squares */}
                <div className="card">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Grid size={18} />
                        Preview Squares
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {bingo.items.slice(0, 6).map((item, i) => (
                            <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                                {item}
                            </span>
                        ))}
                        {bingo.items.length > 6 && (
                            <span className="bg-primary-100 px-3 py-1 rounded-full text-sm text-primary-700 font-semibold">
                                +{bingo.items.length - 6} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Tags */}
                <div className="card">
                    <h3 className="font-bold text-gray-800 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {bingo.tags.map(tag => (
                            <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
                <button
                    onClick={handlePlay}
                    className={`w-full flex items-center justify-center gap-3 ${isGuest && isCompetitive
                        ? 'bg-gray-200 text-gray-500 font-bold py-4 px-6 rounded-2xl'
                        : 'btn-primary'
                        }`}
                >
                    {isGuest && isCompetitive ? (
                        <>
                            <Lock size={20} />
                            <span>Account Required</span>
                        </>
                    ) : (
                        <>
                            <Play size={20} />
                            <span>
                                {bingo.price > 0 ? <span className="flex items-center gap-1">Play for {bingo.price} <Coins size={16} className="text-yellow-500" /></span> : 'Play Now'}
                            </span>
                        </>
                    )}
                </button>
                {bingo.price > 0 && !isGuest && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                        You have {coins} <Coins size={14} className="text-yellow-500 inline" />
                    </p>
                )}
            </div>

            {/* Guest Modal */}
            {showGuestModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                    onClick={() => setShowGuestModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="text-primary-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                            Account Required
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            Competitive bingos require a free account to track scores and rewards!
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full btn-primary mb-3"
                        >
                            Create Free Account
                        </button>
                        <button
                            onClick={() => setShowGuestModal(false)}
                            className="w-full text-gray-500 font-semibold"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            )}

            {/* Purchase Confirmation Modal */}
            {showPurchaseModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                    onClick={() => setShowPurchaseModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-5xl text-center mb-4">🎯</div>
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                            Purchase Bingo
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            This will cost <span className="font-bold text-primary-600 inline-flex items-center gap-1">{bingo.price} <Coins size={14} className="text-yellow-500" /></span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPurchaseModal(false)}
                                className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowPurchaseModal(false);
                                    startGame();
                                }}
                                className="flex-1 btn-primary py-3"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
