import { Grid, Sparkles, Trophy, Star, PartyPopper, Hash, Circle, Crown, Gift, Zap, Music, Heart, Smile, Gem, Flame, Rocket } from 'lucide-react';

export default function BingoBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-indigo-50 to-purple-100">
            {/* Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-15"
                style={{
                    backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            ></div>

            {/* Icon Pattern - Denser Scatter */}
            <div className="absolute inset-0 opacity-40">
                {/* Original Set */}
                <Grid className="absolute top-10 left-10 text-primary-300 animate-pulse-slow" size={64} style={{ transform: 'rotate(-15deg)' }} />
                <Trophy className="absolute top-20 right-20 text-yellow-500" size={80} style={{ transform: 'rotate(15deg)' }} />
                <Star className="absolute bottom-32 left-1/4 text-accent-400" size={48} />
                <Sparkles className="absolute top-1/3 left-10 text-purple-400" size={56} />
                <Hash className="absolute bottom-10 right-10 text-pink-400" size={72} style={{ transform: 'rotate(10deg)' }} />
                <PartyPopper className="absolute top-1/2 right-1/4 text-orange-400" size={60} style={{ transform: 'rotate(-5deg)' }} />
                <Circle className="absolute bottom-1/3 left-20 text-teal-400" size={40} />
                <Crown className="absolute top-40 left-1/3 text-yellow-600" size={50} style={{ transform: 'rotate(20deg)' }} />

                {/* New Additions for Density */}
                <Gift className="absolute top-1/4 right-10 text-red-400" size={55} style={{ transform: 'rotate(-10deg)' }} />
                <Zap className="absolute bottom-20 left-10 text-yellow-400" size={45} style={{ transform: 'rotate(30deg)' }} />
                <Music className="absolute top-10 left-1/2 text-blue-400" size={50} style={{ transform: 'rotate(-20deg)' }} />
                <Heart className="absolute bottom-1/2 left-10 text-pink-500" size={42} style={{ transform: 'rotate(15deg)' }} />
                <Smile className="absolute bottom-40 right-1/3 text-green-400" size={58} style={{ transform: 'rotate(45deg)' }} />
                <Gem className="absolute top-32 right-1/2 text-cyan-500" size={46} style={{ transform: 'rotate(-30deg)' }} />
                <Flame className="absolute bottom-10 left-1/3 text-orange-500" size={52} style={{ transform: 'rotate(10deg)' }} />
                <Rocket className="absolute top-20 left-3/4 text-indigo-500" size={60} style={{ transform: 'rotate(-25deg)' }} />

                {/* Smaller filler icons */}
                <Star className="absolute top-1/2 left-1/2 text-purple-300" size={24} />
                <Circle className="absolute top-1/4 right-1/3 text-blue-300" size={20} />
                <Grid className="absolute bottom-20 right-1/2 text-gray-300" size={30} style={{ transform: 'rotate(45deg)' }} />
            </div>

            {/* Soft Overlay - Reduced to keep icons visible */}
            <div className="absolute inset-0 bg-white/10"></div>
        </div>
    );
}
