import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Plus, X } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export default function Header({ title, showBack = false, showCoins = false, backPath, children }) {
    const navigate = useNavigate();
    const { coins } = useWallet();
    const [showBuyCoinsModal, setShowBuyCoinsModal] = useState(false);

    const handleBack = () => {
        if (backPath) {
            navigate(backPath);
        } else {
            navigate(-1);
        }
    };

    return (
        <>
            <header className="gradient-header p-6 pb-8 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {showBack && (
                            <button
                                onClick={handleBack}
                                className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-white">{title}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {showCoins && (
                            <div className="flex items-center gap-1">
                                <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-l-full flex items-center gap-2">
                                    <Coins className="text-yellow-300" size={18} />
                                    <span className="text-white font-bold">{coins}</span>
                                </div>
                                <button
                                    onClick={() => setShowBuyCoinsModal(true)}
                                    className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded-r-full transition-colors"
                                >
                                    <Plus size={18} className="text-yellow-900" />
                                </button>
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </header>

            {/* Buy Coins Modal (Coming Soon) */}
            {showBuyCoinsModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                    onClick={() => setShowBuyCoinsModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Get More Coins</h3>
                            <button
                                onClick={() => setShowBuyCoinsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="text-center py-8">
                            <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Coins className="text-yellow-500" size={40} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-2">Coming Soon!</h4>
                            <p className="text-gray-600 mb-4">
                                Coin purchases will be available in a future update. For now, earn coins by playing games and completing achievements!
                            </p>
                            <div className="bg-primary-50 rounded-xl p-4">
                                <p className="text-sm text-primary-700 font-medium">
                                    💡 Tip: Win competitive bingos to earn more coins!
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowBuyCoinsModal(false)}
                            className="w-full btn-primary"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
