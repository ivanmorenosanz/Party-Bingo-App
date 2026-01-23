import { useMemo } from 'react';

// Pixel art character data - 8x8 grid encoded sprites
// Pixel art character data
const PIXEL_CHARACTERS = {
    human: {
        name: 'Human',
        colors: ['#FFC0CB', '#3498DB', '#2C3E50', '#95A5A6'], // Skin, Shirt, Pants, Shoes
        // 12x12 grid for better detail
        sprite: [
            [0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0],
            [0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0],
            [0, 0, 0, 3, 1, 1, 1, 1, 3, 0, 0, 0], // Hair/Head
            [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0], // Eyes
            [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0], // Neck/Shirt
            [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0], // Arms/Body
            [0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0], // Hands
            [0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0], // Belt/Pants
            [0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0], // Legs
            [0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0],
            [0, 0, 4, 4, 4, 0, 0, 4, 4, 4, 0, 0], // Shoes
        ],
    },
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
    character = 'human',
    size = 64,
    frame = 'default',
    badge = null,
    showName = false,
    className = ''
}) {
    const charData = PIXEL_CHARACTERS[character] || PIXEL_CHARACTERS.human || PIXEL_CHARACTERS.warrior;
    const frameData = PIXEL_FRAMES[frame] || PIXEL_FRAMES.default;

    // Dynamic grid size calculation
    const gridSize = charData.sprite.length; // 8 or 12 or 16
    const pixelSize = size / gridSize;

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
                                // 3D Block Effect
                                boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.2), 1px 1px 0 rgba(255,255,255,0.1)',
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
                ? `0 0 ${size / 8}px ${frameData.glow}, inset 0 0 ${size / 16}px ${frameData.glow}40`
                : 'none',
            border: `3px solid ${frameData.border}`,
        };
    }, [frameData, size]);

    return (
        <div className={`inline-flex flex-col items-center ${className}`}>
            <style>
                {`
                @keyframes pixelFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                `}
            </style>
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
                        backgroundColor: '#2D1B4E', // Dark animated bg
                    }}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>

                    {/* Pixel sprite with float animation */}
                    <div className="relative w-full h-full" style={{
                        imageRendering: 'pixelated',
                        animation: 'pixelFloat 3s ease-in-out infinite'
                    }}>
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
