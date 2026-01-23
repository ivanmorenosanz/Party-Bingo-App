import { useParams, useNavigate } from 'react-router-dom';
import { Star, Timer, BarChart2, Briefcase, TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { useBingo } from '../../context/BingoContext';
import { usePositions } from '../../context/PositionsContext';
import { useState, useEffect } from 'react';
import TradeModal from '../../components/trading/TradeModal';
import { marketsAPI } from '../../api/client';

export default function BingoDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { coins } = useWallet();
    const { user, isGuest } = useAuth();
    const { getBingoById } = useBingo();
    const { getPositionsForBingo, claimPayouts } = usePositions();

    const [selectedSquare, setSelectedSquare] = useState(null);
    const [pagePayout, setPagePayout] = useState(0);
    const [marketData, setMarketData] = useState(null);
    const [showPositions, setShowPositions] = useState(false);

    const bingo = getBingoById(id);

    // Load market data
    useEffect(() => {
        const loadMarket = async () => {
            if (bingo?.tradeable) {
                // If game is ended/resolved, use results
                if (bingo.status === 'ended' && bingo.results) {
                    setMarketData({
                        squares: bingo.items.map((item, i) => ({
                            id: `${bingo.id}_sq_${i}`,
                            position: i,
                            description: item,
                            status: 'settled',
                            yesPrice: bingo.results[i] ? 1 : 0,
                            noPrice: bingo.results[i] ? 0 : 1,
                        }))
                    });

                    // Attempt to claim payouts
                    const result = claimPayouts(bingo.id, bingo.results);
                    if (result.amount > 0) {
                        setPagePayout(result.amount);
                    }
                    return;
                }

                try {
                    const data = await marketsAPI.getMarkets(bingo.id);
                    setMarketData(data);
                } catch (error) {
                    // Create mock market data
                    setMarketData({
                        squares: bingo.items.map((item, i) => ({
                            id: `${bingo.id}_sq_${i}`,
                            position: i,
                            description: item,
                            status: 'open',
                            yesPrice: 0.5,
                            noPrice: 0.5,
                        })),
                    });
                }
            }
        };
        if (bingo) loadMarket();
    }, [bingo]);

    // Calculate derived probabilities
    const getLineProbability = (indices) => {
        if (!marketData?.squares) return 0.5;
        const prices = indices.map(i => marketData.squares[i]?.yesPrice !== undefined ? marketData.squares[i].yesPrice : 0.5);

        // If resolved/settled, exact calc
        if (marketData.squares.length > 0 && marketData.squares[0]?.status === 'settled') {
            return prices.every(p => p === 1) ? 1 : 0;
        }

        // Open market approximation
        return Math.min(prices.reduce((a, b) => a * b, 1) * 1.5, 0.99);
    };

    const getBingoProbability = () => {
        if (!marketData?.squares || marketData.squares.length !== 9) return 0.01;
        const prices = marketData.squares.map(s => s.yesPrice !== undefined ? s.yesPrice : 0.5);

        // If resolved
        if (marketData.squares.length > 0 && marketData.squares[0]?.status === 'settled') {
            return prices.every(p => p === 1) ? 1 : 0;
        }

        // Open market approximation
        return Math.min(prices.reduce((a, b) => a * b, 1) * 2.0, 0.99);
    };

    // Countdown
    const [timeLeft, setTimeLeft] = useState(null);
    useEffect(() => {
        if (!bingo?.endsAt) return;
        const update = () => {
            const diff = new Date(bingo.endsAt) - new Date();
            if (diff <= 0) { setTimeLeft(null); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff / 3600000) % 24);
            const m = Math.floor((diff / 60000) % 60);
            setTimeLeft(d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`);
        };
        update();
        const t = setInterval(update, 60000);
        return () => clearInterval(t);
    }, [bingo]);

    if (!bingo) {
        return (
            <div className="min-h-screen pt-24 text-center">
                <h1 className="text-2xl font-bold text-red-500">Bingo Not Found</h1>
                <button onClick={() => navigate('/community')} className="btn-primary mt-4">Back</button>
            </div>
        );
    }

    // For non-tradeable (classic) games, render classic view
    if (!bingo?.tradeable) {
        return (
            <div className="min-h-screen bg-gray-50 pb-24">
                <Header title={bingo.title} showBack backPath="/community" />
                <div className="p-4">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold mb-1">{bingo.title}</h1>
                                <p className="text-white/80 text-sm">Created by {bingo.creator}</p>
                            </div>
                            <div className="text-center bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <span className="block text-2xl font-bold">{bingo.rating}</span>
                                <span className="text-[10px] uppercase">Rating</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {bingo.tags?.map(tag => (
                                <span key={tag} className="text-xs bg-black/20 px-2 py-1 rounded-full">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 max-w-sm mx-auto">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Star size={18} className="text-yellow-500" />
                            Preview Board ({bingo.gridSize}x{bingo.gridSize})
                        </h3>
                        <div
                            className="grid gap-2"
                            style={{ gridTemplateColumns: `repeat(${bingo.gridSize}, 1fr)` }}
                        >
                            {bingo.items.map((item, i) => (
                                <div key={i} className="aspect-square bg-gray-100 rounded-lg p-2 flex items-center justify-center text-center text-[10px] font-medium text-gray-600 overflow-hidden">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/room/create?bingoId=${bingo.id}`)}
                        className="w-full btn-primary py-4 text-lg font-bold shadow-xl flex items-center justify-center gap-2"
                    >
                        Play This Bingo
                    </button>
                </div>
            </div>
        );
    }

    // --- TRADING LOGIC FOR TRADEABLE GAMES ---

    const rowLines = [
        { id: 'row1', name: 'R1', indices: [0, 1, 2] },
        { id: 'row2', name: 'R2', indices: [3, 4, 5] },
        { id: 'row3', name: 'R3', indices: [6, 7, 8] },
    ];
    const colLines = [
        { id: 'col1', name: 'C1', indices: [0, 3, 6] },
        { id: 'col2', name: 'C2', indices: [1, 4, 7] },
        { id: 'col3', name: 'C3', indices: [2, 5, 8] },
    ];
    // No diagonals for now as per previous update

    const handleLineClick = (line) => {
        const prob = getLineProbability(line.indices);
        setSelectedSquare({
            id: `line_${line.id}`,
            description: `Line ${line.name}`,
            yesPrice: prob,
            noPrice: 1 - prob,
            isLine: true,
        });
    };

    const handleBingoClick = () => {
        const prob = getBingoProbability();
        setSelectedSquare({
            id: 'bingo_full',
            description: 'Full Bingo (All 9)',
            yesPrice: prob,
            noPrice: 1 - prob,
            isBingo: true,
        });
    };

    const bingoProbability = getBingoProbability();

    // Check if current user is the creator
    const isCreator = user?.id === bingo.creatorId || user?.id === bingo.creator_id;

    // Check market status
    const isPendingResult = bingo.status === 'pending_result';
    const isEnded = bingo.status === 'ended';
    const canTrade = !isCreator && !isPendingResult && !isEnded;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pb-24">
            <Header title={bingo.title} showBack backPath="/community" showCoins />

            {/* Hero */}
            <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <BarChart2 size={20} />
                        <span className="font-bold">{bingo.title}</span>
                    </div>
                    {timeLeft ? (
                        <div className="bg-red-500/80 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                            <Timer size={12} /> {timeLeft}
                        </div>
                    ) : (
                        <div className="bg-gray-900/50 px-2 py-1 rounded-full text-xs font-bold">
                            ENDED
                        </div>
                    )}
                </div>
                <div className="flex justify-between text-sm">
                    <span>🪙 {coins} coins</span>
                    <span>⭐ {bingo.rating}</span>
                    <span>👥 {bingo.plays}</span>
                </div>
                {pagePayout > 0 && (
                    <div className="mt-3 bg-white/20 p-2 rounded-lg text-center font-bold flex items-center justify-center gap-2 animate-pulse">
                        <Trophy size={18} className="text-yellow-300" />
                        You won {pagePayout} coins!
                    </div>
                )}
            </div>

            {/* Status Banners */}
            {isCreator && !isEnded && (
                <div className="mx-4 mt-2 p-3 rounded-xl bg-blue-600 text-white text-center text-sm font-medium">
                    👑 You are the market creator. You cannot trade on this market.
                    {isPendingResult && (
                        <div className="mt-2 text-xs">Scroll down to resolve the market.</div>
                    )}
                </div>
            )}

            {isPendingResult && !isCreator && (
                <div className="mx-4 mt-2 p-3 rounded-xl bg-amber-500 text-white text-center text-sm font-medium">
                    ⏳ Market has ended. Awaiting result from creator.
                </div>
            )}

            {isEnded && (
                <div className="mx-4 mt-2 p-3 rounded-xl bg-gray-600 text-white text-center text-sm font-medium">
                    ✅ Market resolved.
                </div>
            )}

            {/* Trading Grid */}
            <div className="px-4 pb-4 flex-1 min-h-0">
                <div className="bg-gray-800 rounded-2xl p-3 shadow-xl h-full">
                    {/* Grid Layout: 4 columns x 4 rows */}
                    <div
                        className="grid grid-cols-4 grid-rows-4 gap-2 h-full"
                    >
                        {/* Row 1: 3 squares + Row line */}
                        {marketData?.squares.slice(0, 3).map((sq, i) => (
                            <SquareButton key={i} square={sq} onClick={() => setSelectedSquare(sq)} />
                        ))}
                        <LineButton line={rowLines[0]} prob={getLineProbability(rowLines[0].indices)} onClick={() => handleLineClick(rowLines[0])} />

                        {/* Row 2: 3 squares + Row line */}
                        {marketData?.squares.slice(3, 6).map((sq, i) => (
                            <SquareButton key={i + 3} square={sq} onClick={() => setSelectedSquare(sq)} />
                        ))}
                        <LineButton line={rowLines[1]} prob={getLineProbability(rowLines[1].indices)} onClick={() => handleLineClick(rowLines[1])} />

                        {/* Row 3: 3 squares + Row line */}
                        {marketData?.squares.slice(6, 9).map((sq, i) => (
                            <SquareButton key={i + 6} square={sq} onClick={() => setSelectedSquare(sq)} />
                        ))}
                        <LineButton line={rowLines[2]} prob={getLineProbability(rowLines[2].indices)} onClick={() => handleLineClick(rowLines[2])} />

                        {/* Row 4: 3 Column lines + Bingo */}
                        {colLines.map((line) => (
                            <LineButton key={line.id} line={line} prob={getLineProbability(line.indices)} onClick={() => handleLineClick(line)} />
                        ))}
                        <BingoButton prob={bingoProbability} onClick={handleBingoClick} />
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-3 flex justify-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-700 rounded"></span> Squares</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500/30 rounded"></span> Lines</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500/30 rounded"></span> Bingo</span>
                </div>
            </div>

            {/* Trade Modal */}
            {selectedSquare && (
                <TradeModal
                    square={selectedSquare}
                    bingoId={bingo.id}
                    bingoTitle={bingo.title}
                    isResolved={bingo.status === 'ended'}
                    canTrade={canTrade}
                    onClose={() => setSelectedSquare(null)}
                    onTradeComplete={() => {
                        if (bingo?.tradeable) {
                            marketsAPI.getMarkets(bingo.id).then(setMarketData).catch(() => { });
                        }
                    }}
                />
            )}


        </div>
    );
}

// Square Button Component
function SquareButton({ square, onClick }) {
    const yesPercent = Math.round((square.yesPrice || 0.5) * 100);
    const bgColor = yesPercent >= 60 ? 'from-green-600 to-green-700' :
        yesPercent >= 40 ? 'from-gray-600 to-gray-700' :
            'from-red-600 to-red-700';

    return (
        <button
            onClick={onClick}
            className={`bg-gradient-to-br ${bgColor} rounded-xl p-2 flex flex-col items-center justify-center text-white hover:scale-[1.02] active:scale-95 transition-transform shadow-lg border border-white/10`}
        >
            <span className="text-[9px] leading-tight text-center line-clamp-2 mb-1 text-white/80">
                {square.description}
            </span>
            <span className="text-base font-black">{yesPercent}%</span>
        </button>
    );
}

// Line Button Component
function LineButton({ line, prob, onClick }) {
    const percent = Math.round(prob * 100);

    return (
        <button
            onClick={onClick}
            className="bg-blue-500/20 hover:bg-blue-500/40 border-2 border-blue-500/50 rounded-xl flex flex-col items-center justify-center text-white transition-all hover:scale-[1.02] active:scale-95"
        >
            <span className="text-blue-400 font-bold text-xs">{line.name}</span>
            <span className="text-white font-black text-base">{percent}%</span>
        </button>
    );
}

// Bingo Button Component
function BingoButton({ prob, onClick }) {
    const percent = Math.round(prob * 100);

    return (
        <button
            onClick={onClick}
            className="bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 border-2 border-purple-400 rounded-xl flex flex-col items-center justify-center text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/30"
        >
            <span className="text-yellow-300 font-bold text-xs">BINGO</span>
            <span className="text-white font-black text-base">{percent}%</span>
        </button>
    );
}
