import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Loader2, Target, Trophy } from 'lucide-react';
import { marketsAPI } from '../../api/client';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { usePositions } from '../../context/PositionsContext';

export default function TradeModal({ square, bingoId, bingoTitle, isResolved, onClose, onTradeComplete }) {
    const { user } = useAuth();
    const { coins, spendCoins } = useWallet();
    const { addPosition } = usePositions();
    const [direction, setDirection] = useState('YES');
    const [shares, setShares] = useState(1);
    const [priceQuote, setPriceQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trading, setTrading] = useState(false);
    const [error, setError] = useState(null);

    const isLine = square?.isLine === true;
    const isBingo = square?.isBingo === true;
    const isDerived = isLine || isBingo;

    // For derived markets, calculate price locally
    useEffect(() => {
        if (isDerived) {
            // Derived markets use local pricing
            const basePrice = direction === 'YES' ? square.yesPrice : square.noPrice;
            const cost = Math.ceil(shares * basePrice * 100); // Simplified pricing
            setPriceQuote({
                cost,
                pricePerShare: Math.ceil(basePrice * 100),
                currentPrice: square.yesPrice,
            });
            setLoading(false);
            return;
        }

        // Regular squares use API
        const fetchQuote = async () => {
            if (!square?.id) return;
            setLoading(true);
            try {
                const quote = await marketsAPI.getPrice(square.id, direction, shares);
                setPriceQuote(quote);
                setError(null);
            } catch (err) {
                // Fallback for uninitialized markets
                const basePrice = direction === 'YES' ? (square.yesPrice || 0.5) : (square.noPrice || 0.5);
                setPriceQuote({
                    cost: Math.ceil(shares * basePrice * 100),
                    pricePerShare: Math.ceil(basePrice * 100),
                    currentPrice: square.yesPrice || 0.5,
                });
            }
            setLoading(false);
        };

        const debounce = setTimeout(fetchQuote, 200);
        return () => clearTimeout(debounce);
    }, [square?.id, direction, shares, isDerived, square?.yesPrice, square?.noPrice]);

    const handleTrade = async () => {
        if (!priceQuote || trading) return;

        if (priceQuote.cost > coins) {
            setError('Insufficient funds');
            return;
        }

        setTrading(true);

        const finishTrade = async () => {
            // Deduct coins locally
            await spendCoins(priceQuote.cost, `${direction} ${shares} shares: ${square.description}`);

            // Add position
            addPosition(
                bingoId || 'unknown',
                square.id,
                square.description,
                direction,
                shares,
                priceQuote.cost,
                bingoTitle || 'Unknown Market'
            );
        };

        if (isDerived) {
            // Derived markets: local deduction
            try {
                await finishTrade();
                onTradeComplete?.({ success: true, cost: priceQuote.cost });
                onClose();
                return;
            } catch (err) {
                console.error(err);
                setError("Transaction failed");
            }
            setTrading(false);
            return;
        }

        try {
            const result = await marketsAPI.trade(square.id, user.id, direction, shares);
            if (result.success) {
                await finishTrade();
                onTradeComplete?.(result);
                onClose();
                return;
            } else {
                setError(result.error || 'Trade failed');
            }
        } catch (err) {
            console.warn("Trade API failed, attempting local fallback", err);
            // If API is missing (404) or offline, allow local trade
            if (err.message && (err.message.includes('404') || err.message.includes('OFFLINE') || err.message.includes('Failed to fetch'))) {
                try {
                    await finishTrade();
                    onTradeComplete?.({ success: true, local: true, cost: priceQuote.cost });
                    onClose();
                    return;
                } catch (e) {
                    setError("Transaction failed locally");
                }
            } else {
                setError(err.message || 'Trade failed');
            }
        }
        setTrading(false);
    };

    // Header gradient based on type
    const headerGradient = isBingo
        ? 'from-purple-600 to-indigo-700'
        : isLine
            ? 'from-blue-500 to-cyan-600'
            : 'from-amber-500 to-orange-600';

    const headerIcon = isBingo ? <Trophy size={20} /> : isLine ? <Target size={20} /> : null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                {/* Header */}
                <div className={`bg-gradient-to-r ${headerGradient} p-4 text-white flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        {headerIcon && <div className="bg-white/20 p-2 rounded-lg">{headerIcon}</div>}
                        <div>
                            <h2 className="font-bold text-lg">
                                {isBingo ? 'Trade Bingo' : isLine ? 'Trade Line' : 'Trade Prediction'}
                            </h2>
                            <p className="text-white/80 text-sm truncate max-w-[200px]">{square.description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Current Price */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Current Probability</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {Math.round((square.yesPrice || 0.5) * 100)}% YES
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Your Balance</p>
                            <p className="text-xl font-bold text-yellow-600">🪙 {coins}</p>
                        </div>
                    </div>
                </div>

                {/* Direction Selection */}
                {isResolved ? (
                    <div className="p-8 text-center space-y-4">
                        <div className={`inline-flex p-4 rounded-full ${square.yesPrice > 0.5 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {square.yesPrice > 0.5 ? <Trophy size={48} /> : <X size={48} />}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {square.yesPrice > 0.5 ? 'Winner!' : 'Did not happen'}
                        </h2>
                        <p className="text-gray-500">
                            This market has been resolved. {square.yesPrice > 0.5 ? 'YES' : 'NO'} shares payout 100 coins.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDirection('YES')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${direction === 'YES'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-green-300'
                                    }`}
                            >
                                <TrendingUp size={24} />
                                <span className="font-bold">YES</span>
                                <span className="text-sm">{Math.round((square.yesPrice || 0.5) * 100)}%</span>
                            </button>
                            <button
                                onClick={() => setDirection('NO')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${direction === 'NO'
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-200 hover:border-red-300'
                                    }`}
                            >
                                <TrendingDown size={24} />
                                <span className="font-bold">NO</span>
                                <span className="text-sm">{Math.round((square.noPrice || 0.5) * 100)}%</span>
                            </button>
                        </div>

                        {/* Shares Input */}
                        <div>
                            <label className="text-sm text-gray-500 mb-2 block">Number of Shares</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShares(Math.max(1, shares - 1))}
                                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={shares}
                                    onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="flex-1 text-center text-2xl font-bold py-2 border border-gray-200 rounded-xl"
                                />
                                <button
                                    onClick={() => setShares(Math.min(100, shares + 1))}
                                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Cost Preview */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2 text-gray-500">
                                    <Loader2 className="animate-spin" size={16} />
                                    Calculating...
                                </div>
                            ) : priceQuote ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Cost per share</span>
                                        <span className="font-medium">{Math.round(priceQuote.pricePerShare)} coins</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Cost</span>
                                        <span className={priceQuote.cost > coins ? 'text-red-500' : 'text-gray-800'}>
                                            🪙 {priceQuote.cost}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Potential Payout (if correct)</span>
                                        <span className="text-green-600 font-semibold">🪙 {shares * 100}</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}
                    </div>
                )}

                {/* Action Button */}
                <div className="p-4 pt-0">
                    {!isResolved && (
                        <button
                            onClick={handleTrade}
                            disabled={!priceQuote || trading || priceQuote?.cost > coins}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${direction === 'YES'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {trading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={18} />
                                    Processing...
                                </span>
                            ) : (
                                `Buy ${shares} ${direction} Share${shares > 1 ? 's' : ''}`
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
