import { useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WelcomePage() {
    const navigate = useNavigate();
    const { loginAsGuest } = useAuth();

    const handleGuestLogin = () => {
        loginAsGuest();
        navigate('/');
    };

    return (
        <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6">
            {/* Logo and Title */}
            <div className="text-center mb-12 animate-slide-up">
                <div className="text-8xl mb-6">🎯</div>
                <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
                    Party Bingo
                </h1>
                <p className="text-xl text-white/90 font-medium">
                    Create. Play. Win.
                </p>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-20 left-10 text-4xl animate-bounce-slow opacity-60">🎉</div>
            <div className="absolute top-32 right-14 text-3xl animate-bounce-slow opacity-60" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-40 left-8 text-3xl animate-bounce-slow opacity-60" style={{ animationDelay: '1s' }}>🏆</div>
            <div className="absolute bottom-32 right-10 text-4xl animate-bounce-slow opacity-60" style={{ animationDelay: '0.3s' }}>🎲</div>

            {/* Buttons */}
            <div className="w-full max-w-md space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-white text-primary-600 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                    Get Started
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="w-full btn-secondary"
                >
                    I Have an Account
                </button>

                {/* Guest option */}
                <div className="pt-4">
                    <button
                        onClick={handleGuestLogin}
                        className="w-full text-white/80 hover:text-white py-3 font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <span>👤</span>
                        <span>Join as Guest</span>
                    </button>
                    <p className="text-white/50 text-xs text-center mt-1">
                        Limited access • No competitive bingos
                    </p>
                </div>
            </div>

            {/* Features preview */}
            <div className="mt-8 flex gap-6 text-white/80 text-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2">
                    <span>🎯</span>
                    <span>Private Rooms</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>🏆</span>
                    <span>Leagues</span>
                </div>
                <div className="flex items-center gap-2">
                    <Coins className="text-yellow-300" size={16} />
                    <span>Rewards</span>
                </div>
            </div>
        </div>
    );
}
