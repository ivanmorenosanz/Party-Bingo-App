import { useState } from 'react';
import { Smile, X } from 'lucide-react';
import { REACTIONS } from '../../data/skins';
import { useGame } from '../../context/GameContext';

export default function ReactionPicker({ roomCode, onClose }) {
    const { socket } = useGame();
    const [sending, setSending] = useState(null);

    const sendReaction = (reaction) => {
        if (sending) return;

        setSending(reaction.id);

        // Play sound locally
        if (reaction.sound) {
            const audio = new Audio(reaction.sound);
            audio.volume = 0.5;
            audio.play().catch(() => { }); // Ignore autoplay errors
        }

        // Broadcast to room
        socket.emit('send_reaction', {
            code: roomCode,
            reactionId: reaction.id,
            emoji: reaction.emoji,
        });

        setTimeout(() => {
            setSending(null);
            onClose?.();
        }, 300);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4">
            <div
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md border border-white/20 animate-bounce-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Smile size={20} />
                        Quick Reactions
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white p-2"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {REACTIONS.map((reaction) => (
                        <button
                            key={reaction.id}
                            onClick={() => sendReaction(reaction)}
                            disabled={sending === reaction.id}
                            className={`
                                flex flex-col items-center justify-center p-4 rounded-2xl
                                bg-white/10 hover:bg-white/20 border border-white/10
                                transition-all duration-200 active:scale-90
                                ${sending === reaction.id ? 'animate-bounce scale-110' : ''}
                            `}
                        >
                            <span className="text-4xl mb-1">{reaction.emoji}</span>
                            <span className="text-xs text-white/70">{reaction.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
