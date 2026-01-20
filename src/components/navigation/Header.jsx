import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export default function Header({ title, showBack = false, showCoins = false, backPath, children }) {
    const navigate = useNavigate();
    const { coins } = useWallet();

    const handleBack = () => {
        if (backPath) {
            navigate(backPath);
        } else {
            navigate(-1);
        }
    };

    return (
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
                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                            <span className="text-lg">🪙</span>
                            <span className="text-white font-bold">{coins}</span>
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </header>
    );
}
