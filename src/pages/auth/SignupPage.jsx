import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { signup } = useAuth();
    const { earnCoins } = useWallet();

    const handleSignup = (e) => {
        e.preventDefault();
        if (!username || !email || !password) {
            setError('Please fill in all fields');
            return;
        }
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        signup(username, email, password);
        earnCoins(50, 'Welcome bonus! 🎉');
        navigate('/');
    };

    return (
        <div className="min-h-screen gradient-hero p-6">
            <button
                onClick={() => navigate('/welcome')}
                className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors mb-8"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="max-w-md mx-auto">
                <h2 className="text-4xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-white/80 mb-8">Join the bingo party and start playing!</p>

                {error && (
                    <div className="bg-red-500/20 border border-red-400/50 text-white p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-glass pl-12"
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-glass pl-12"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-glass pl-12"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white text-primary-600 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mt-6"
                    >
                        Sign Up & Get 50 🪙
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-white/80">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-white font-semibold hover:underline"
                        >
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
