import { useMemo } from 'react';

// Pixel art character data - 8x8 grid encoded sprites
const PIXEL_CHARACTERS = {
    warrior: {
        name: 'Warrior',
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
        sprite: [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [1, 2, 0, 2, 2, 0, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [0, 1, 2, 1, 1, 2, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 0, 0, 1, 1, 0],
            [1, 1, 0, 0, 0, 0, 1, 1],
        ],
    },
    mage: {
        name: 'Mage',
        colors: ['#9B59B6', '#3498DB', '#F39C12'],
        sprite: [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 2, 0, 2, 2, 0, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
        ],
    },
    rogue: {
        name: 'Rogue',
        colors: ['#2C3E50', '#1ABC9C', '#E74C3C'],
        sprite: [
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 0, 2, 2, 0, 2, 1],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 0, 2, 2, 2, 2, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
            [1, 1, 0, 0, 0, 0, 1, 1],
        ],
    },
    healer: {
        name: 'Healer',
        colors: ['#FFFFFF', '#27AE60', '#F1C40F'],
        sprite: [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [1, 2, 0, 2, 2, 0, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 2, 1, 1, 1, 1, 2, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0],
        ],
    },
    knight: {
        name: 'Knight',
        colors: ['#95A5A6', '#3498DB', '#E67E22'],
        sprite: [
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 2, 2, 2, 2, 2, 2, 0],
            [0, 2, 2, 0, 0, 2, 2, 0],
            [0, 1, 1, 0, 0, 1, 1, 0],
        ],
    },
    archer: {
        name: 'Archer',
        colors: ['#27AE60', '#8B4513', '#F39C12'],
        sprite: [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [1, 2, 0, 2, 2, 0, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 1],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 0, 1, 1, 0, 1, 0],
            [1, 1, 0, 0, 0, 0, 1, 1],
        ],
    },
    bard: {
        name: 'Bard',
        colors: ['#E91E63', '#9C27B0', '#FFC107'],
        sprite: [
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [1, 2, 0, 2, 2, 0, 2, 1],
            [1, 2, 2, 1, 1, 2, 2, 1],
            [0, 1, 2, 2, 2, 2, 1, 0],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0],
        ],
    },
    ninja: {
        name: 'Ninja',
        colors: ['#1A1A2E', '#16213E', '#E94560'],
        sprite: [
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0],
            [1, 1, 0, 0, 0, 0, 1, 1],
        ],
    },
};

// Pixel art frames
const PIXEL_FRAMES = {
    default: { border: 'transparent', shadow: false },
    gold_ring: { border: '#FFD700', shadow: true, glow: '#FFA500' },
    rainbow: { border: 'rainbow', shadow: true },
    fire: { border: '#FF4500', shadow: true, glow: '#FF6B35', animated: true },
    diamond: { border: '#00CED1', shadow: true, glow: '#40E0D0' },
    crown: { border: '#FFD700', shadow: true, glow: '#FFC107', hasCrown: true },
};

export default function PixelAvatar({ 
    character = 'warrior', 
    size = 64, 
    frame = 'default',
    badge = null,
    showName = false,
    className = ''
}) {
    const charData = PIXEL_CHARACTERS[character] || PIXEL_CHARACTERS.warrior;
    const frameData = PIXEL_FRAMES[frame] || PIXEL_FRAMES.default;
    const pixelSize = size / 8;

    const canvasStyle = useMemo(() => ({
        width: size,
        height: size,
        imageRendering: 'pixelated',
    }), [size]);

    const renderSprite = () => {
        const pixels = [];
        charData.sprite.forEach((row, y) => {
            row.forEach((colorIndex, x) => {
                if (colorIndex > 0) {
                    pixels.push(
                        <div
                            key={`${x}-${y}`}
                            className="absolute"
                            style={{
                                left: x * pixelSize,
                                top: y * pixelSize,
                                width: pixelSize,
                                height: pixelSize,
                                backgroundColor: charData.colors[colorIndex - 1] || charData.colors[0],
                            }}
                        />
                    );
                }
            });
        });
        return pixels;
    };

    const frameStyle = useMemo(() => {
        if (frameData.border === 'transparent') return {};
        
        if (frameData.border === 'rainbow') {
            return {
                background: 'linear-gradient(45deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8B00FF)',
                padding: '3px',
            };
        }

        return {
            boxShadow: frameData.glow 
                ? `0 0 ${size/8}px ${frameData.glow}, inset 0 0 ${size/16}px ${frameData.glow}40`
                : 'none',
            border: `3px solid ${frameData.border}`,
        };
    }, [frameData, size]);

    return (
        <div className={`inline-flex flex-col items-center ${className}`}>
            <div className="relative">
                {/* Crown for legendary frame */}
                {frameData.hasCrown && (
                    <div 
                        className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl z-10"
                        style={{ fontSize: size / 3 }}
                    >
                        👑
                    </div>
                )}
                
                {/* Frame container */}
                <div 
                    className={`relative overflow-hidden ${frameData.animated ? 'animate-pulse' : ''}`}
                    style={{
                        ...canvasStyle,
                        ...frameStyle,
                        borderRadius: '8px',
                        backgroundColor: '#2D1B4E',
                    }}
                >
                    {/* Pixel sprite */}
                    <div className="relative w-full h-full" style={{ imageRendering: 'pixelated' }}>
                        {renderSprite()}
                    </div>
                </div>

                {/* Badge */}
                {badge && (
                    <div 
                        className="absolute -bottom-1 -right-1 bg-white rounded-full shadow-lg flex items-center justify-center"
                        style={{ 
                            width: size / 3, 
                            height: size / 3,
                            fontSize: size / 4,
                        }}
                    >
                        {badge}
                    </div>
                )}
            </div>

            {/* Character name */}
            {showName && (
                <span className="mt-1 text-xs font-bold text-gray-600 pixel-font">
                    {charData.name}
                </span>
            )}
        </div>
    );
}

// Export character list for selection
export const CHARACTERS = Object.entries(PIXEL_CHARACTERS).map(([id, data]) => ({
    id,
    name: data.name,
    colors: data.colors,
}));

// Export frame list
export const FRAMES = Object.entries(PIXEL_FRAMES).map(([id, data]) => ({
    id,
    ...data,
}));
