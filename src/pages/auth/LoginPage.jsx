import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        login(email, password);
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
                <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-white/80 mb-8">Sign in to continue your bingo journey</p>

                {error && (
                    <div className="bg-red-500/20 border border-red-400/50 text-white p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
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
                        Log In
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-white/80">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/signup')}
                            className="text-white font-semibold hover:underline"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
