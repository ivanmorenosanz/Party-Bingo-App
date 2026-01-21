import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, CheckCircle, RefreshCw, AlertCircle, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [displayCode, setDisplayCode] = useState('');
    const navigate = useNavigate();
    const { signup, verifyEmail, resendVerificationCode } = useAuth();
    const { earnCoins } = useWallet();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password) {
            setError('Please fill in all fields');
            return;
        }
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setError('Please enter a valid email address');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const result = await signup(username, email, password);

            if (result.success) {
                // API mode: signup auto-verifies, so go directly to home
                earnCoins(50, 'Welcome bonus! 🎉');
                navigate('/');
            } else if (result.needsVerification) {
                // Legacy mode with email verification
                setShowVerification(true);
                setDisplayCode(result.code);
            } else {
                // Handle specific error messages
                const errorMessage = result.error || 'Failed to create account';
                if (errorMessage.includes('Email already')) {
                    setError('This email is already registered. Please log in instead.');
                } else if (errorMessage.includes('Username already')) {
                    setError('This username is already taken. Please choose another one.');
                } else {
                    setError(errorMessage);
                }
            }
        } catch (err) {
            const errorMessage = err.message || 'Failed to create account';
            if (errorMessage.includes('Email already') || errorMessage.includes('email already')) {
                setError('This email is already registered. Please log in instead.');
            } else if (errorMessage.includes('Username already') || errorMessage.includes('username already')) {
                setError('This username is already taken. Please choose another one.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = (e) => {
        e.preventDefault();
        setError('');

        if (verificationCode.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        const result = verifyEmail(verificationCode);
        if (result.success) {
            earnCoins(50, 'Welcome bonus! 🎉');
            navigate('/');
        } else {
            setError(result.error || 'Invalid verification code');
        }
    };

    const handleResend = () => {
        const result = resendVerificationCode();
        if (result.success) {
            setDisplayCode(result.code);
            setError('');
        }
    };

    // Verification screen
    if (showVerification) {
        return (
            <div className="min-h-screen gradient-hero p-6">
                <button
                    onClick={() => setShowVerification(false)}
                    className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors mb-8"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="text-white" size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
                        <p className="text-white/80">
                            We sent a verification code to<br />
                            <span className="font-semibold">{email}</span>
                        </p>
                    </div>

                    {/* Demo: Show code for testing */}
                    <div className="bg-green-500/20 border border-green-400/50 p-4 rounded-xl mb-6 text-center">
                        <p className="text-white/80 text-sm mb-1">Demo Mode - Your code:</p>
                        <p className="text-2xl font-mono font-bold text-white tracking-widest">{displayCode}</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-400/50 text-white p-4 rounded-xl mb-6 flex items-center gap-3">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="input-glass text-center text-2xl tracking-widest font-mono"
                            maxLength={6}
                        />

                        <button
                            type="submit"
                            className="w-full bg-white text-primary-600 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle size={20} />
                                Verify Email
                            </span>
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleResend}
                            className="text-white/80 hover:text-white flex items-center justify-center gap-2 mx-auto"
                        >
                            <RefreshCw size={16} />
                            Resend code
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                    <div className="bg-red-500/20 border border-red-400/50 text-white p-4 rounded-xl mb-6 flex items-center gap-3">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <span>{error}</span>
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
                            disabled={isLoading}
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
                        {isLoading ? 'Creating Account...' : 'Sign Up & Get 50 Coins'}
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
