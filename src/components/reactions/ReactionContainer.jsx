import { useState, useEffect } from 'react';
import FloatingReaction from './FloatingReaction';

// This component listens for reactions globally and renders them
export default function ReactionContainer() {
    const [reactions, setReactions] = useState([]);

    useEffect(() => {
        const handleReaction = (e) => {
            const reaction = {
                ...e.detail,
                id: `${e.detail.timestamp}-${e.detail.playerId}`,
                position: {
                    x: `${Math.random() * 60 + 20}%`, // Random horizontal position
                    y: '20%',
                },
            };

            setReactions(prev => [...prev, reaction]);
        };

        window.addEventListener('bingo-reaction', handleReaction);
        return () => window.removeEventListener('bingo-reaction', handleReaction);
    }, []);

    const removeReaction = (id) => {
        setReactions(prev => prev.filter(r => r.id !== id));
    };

    return (
        <>
            {reactions.map(reaction => (
                <FloatingReaction
                    key={reaction.id}
                    reaction={reaction}
                    position={reaction.position}
                    onComplete={() => removeReaction(reaction.id)}
                />
            ))}
        </>
    );
}
