import { useState } from 'react';
import { Sparkles, TrendingUp, Users, Gift, Bell } from 'lucide-react';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';

export default function MarketplacePage() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const upcomingFeatures = [
        {
            icon: <TrendingUp className="text-primary-600" size={24} />,
            title: 'Trade Cosmetics',
            description: 'Buy and sell cosmetics with other players',
        },
        {
            icon: <Gift className="text-accent-600" size={24} />,
            title: 'Creator Payouts',
            description: 'Cash out your earnings from popular bingos',
        },
        {
            icon: <Users className="text-green-600" size={24} />,
            title: 'Premium Subscriptions',
            description: 'Exclusive perks and early access',
        },
    ];

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <Header title="Marketplace" showBack backPath="/shop" />

            <div className="p-6">
                {/* Coming Soon Hero */}
                <div className="gradient-hero p-8 rounded-3xl text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
                        <Sparkles className="text-white" size={18} />
                        <span className="text-white font-semibold text-sm">COMING SOON</span>
                    </div>

                    <h1 className="text-4xl font-extrabold text-white mb-4">
                        The Bingo Marketplace
                    </h1>

                    <p className="text-white/80 text-lg mb-8">
                        Trade cosmetics, sell your bingos, and more!
                    </p>

                    {/* Floating Emojis */}
                    <div className="flex justify-center gap-4 text-4xl animate-bounce-slow">
                        <span>💎</span>
                        <span style={{ animationDelay: '0.2s' }}>🎨</span>
                        <span style={{ animationDelay: '0.4s' }}>💰</span>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-xl font-bold text-gray-800">What's Coming</h2>

                    {upcomingFeatures.map((feature, index) => (
                        <div key={index} className="card flex items-start gap-4">
                            <div className="bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{feature.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Email Signup */}
                <div className="card bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="text-primary-600" size={20} />
                        <h3 className="font-bold text-gray-800">Get Notified</h3>
                    </div>

                    {subscribed ? (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">🎉</div>
                            <p className="text-green-600 font-semibold">You're on the list!</p>
                            <p className="text-sm text-gray-600 mt-1">
                                We'll notify you when the marketplace launches.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe}>
                            <p className="text-sm text-gray-600 mb-4">
                                Be the first to know when the marketplace launches!
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field flex-1"
                                    required
                                />
                                <button type="submit" className="btn-primary px-6">
                                    Notify Me
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Stats Preview */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 mb-3">Early interest</p>
                    <div className="flex justify-center gap-8">
                        <div>
                            <p className="text-2xl font-bold text-primary-600">2,847</p>
                            <p className="text-xs text-gray-500">Waitlist signups</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-accent-600">$12,400</p>
                            <p className="text-xs text-gray-500">Creator earnings preview</p>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
