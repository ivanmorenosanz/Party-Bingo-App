import { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext(null);

const STORAGE_KEY = 'bingo_active_games';

export function GameProvider({ children }) {
    const [activeGames, setActiveGames] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Persist changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeGames));
    }, [activeGames]);

    const getGame = (code) => {
        return activeGames.find(g => g.code === code);
    };

    const createRoom = (roomData) => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newGame = {
            ...roomData,
            code,
            createdAt: new Date().toISOString(),
            isHost: true,
            status: 'waiting',
            markedSquares: [], // Set doesn't serialize, use Array
            startTime: null,
            players: [{ id: 'host', name: 'You', isHost: true, markedCount: 0 }],
        };

        setActiveGames(prev => [...prev, newGame]);
        return newGame;
    };

    const joinRoom = (code, roomData) => {
        const existingGame = getGame(code.toUpperCase());
        if (existingGame) return existingGame;

        const newGame = {
            ...roomData,
            code: code.toUpperCase(),
            isHost: false,
            status: 'waiting',
            markedSquares: [],
            startTime: null,
            players: [], // Will be populated by websocket/logic later
        };

        setActiveGames(prev => [...prev, newGame]);
        return newGame;
    };

    const startGame = (code) => {
        setActiveGames(prev => prev.map(game => {
            if (game.code === code) {
                return {
                    ...game,
                    status: 'playing',
                    startTime: Date.now()
                };
            }
            return game;
        }));
    };

    const toggleSquare = (code, index) => {
        setActiveGames(prev => prev.map(game => {
            if (game.code === code) {
                const marked = new Set(game.markedSquares);
                if (marked.has(index)) {
                    marked.delete(index);
                } else {
                    marked.add(index);
                }
                return {
                    ...game,
                    markedSquares: Array.from(marked)
                };
            }
            return game;
        }));
    };

    const checkWin = (game) => {
        if (!game) return false;
        const marked = new Set(game.markedSquares);
        const size = game.gridSize || 3;
        const winning = [];

        // Rows
        for (let i = 0; i < size; i++) {
            winning.push(Array.from({ length: size }, (_, j) => i * size + j));
        }
        // Columns
        for (let i = 0; i < size; i++) {
            winning.push(Array.from({ length: size }, (_, j) => j * size + i));
        }
        // Diagonals
        winning.push(Array.from({ length: size }, (_, i) => i * size + i));
        winning.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));

        return winning.some(combo =>
            combo.every(index => marked.has(index))
        );
    };

    const checkFullHouse = (game) => {
        if (!game) return false;
        const size = game.gridSize || 3;
        return game.markedSquares.length === size * size;
    };

    const leaveRoom = (code) => {
        setActiveGames(prev => prev.filter(g => g.code !== code));
    };

    const updateGame = (code, updates) => {
        setActiveGames(prev => prev.map(game =>
            game.code === code ? { ...game, ...updates } : game
        ));
    };

    return (
        <GameContext.Provider value={{
            activeGames,
            getGame,
            createRoom,
            joinRoom,
            startGame,
            toggleSquare,
            checkWin,
            checkFullHouse,
            leaveRoom,
            updateGame
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
