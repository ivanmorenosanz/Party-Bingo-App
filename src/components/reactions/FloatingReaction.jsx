import { useState, useEffect } from 'react';
import { getReactionById } from '../../data/skins';

export default function FloatingReaction({ reaction, position, onComplete }) {
    const [visible, setVisible] = useState(true);

    const reactionData = getReactionById(reaction.reactionId);

    useEffect(() => {
        // Play sound
        if (reactionData?.sound) {
            const audio = new Audio(reactionData.sound);
            audio.volume = 0.4;
            audio.play().catch(() => { });
        }

        // Auto remove after animation
        const timer = setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!visible || !reactionData) return null;

    return (
        <div
            className="floating-reaction"
            style={{
                left: position?.x || '50%',
                bottom: position?.y || '20%',
            }}
        >
            <div className="flex flex-col items-center">
                <span className="text-5xl drop-shadow-lg">{reaction.emoji}</span>
                <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full mt-1">
                    {reaction.playerName}
                </span>
            </div>
        </div>
    );
}
