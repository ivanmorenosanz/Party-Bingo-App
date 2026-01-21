import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            const errorMessage = err.message || 'Login failed';

            // Handle specific error messages
            if (errorMessage.includes('Invalid credentials') || errorMessage.includes('invalid')) {
                setError('Incorrect email or password. Please try again.');
            } else if (errorMessage.includes('not found') || errorMessage.includes('No account')) {
                setError('No account found with this email. Please sign up first.');
            } else if (errorMessage.includes('OFFLINE')) {
                // Offline mode succeeded, navigate to home
                navigate('/');
                return;
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
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
                    <div className="bg-red-500/20 border border-red-400/50 text-white p-4 rounded-xl mb-6 flex items-center gap-3">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <span>{error}</span>
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-white text-primary-600 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Logging in...' : 'Log In'}
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
