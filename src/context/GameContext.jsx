import { createContext, useContext, useState } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [currentRoom, setCurrentRoom] = useState(null);
    const [markedSquares, setMarkedSquares] = useState(new Set());
    const [gameStatus, setGameStatus] = useState('idle'); // idle, waiting, playing, finished
    const [players, setPlayers] = useState([]);

    const createRoom = (roomData) => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = {
            ...roomData,
            code,
            createdAt: new Date().toISOString(),
            isHost: true,
        };
        setCurrentRoom(room);
        setMarkedSquares(new Set());
        setGameStatus('waiting');
        setPlayers([{ id: 'host', name: 'You', isHost: true, markedCount: 0 }]);
        return room;
    };

    const joinRoom = (code, roomData) => {
        const room = {
            ...roomData,
            code: code.toUpperCase(),
            isHost: false,
        };
        setCurrentRoom(room);
        setMarkedSquares(new Set());
        setGameStatus('waiting');
        return room;
    };

    const startGame = () => {
        setGameStatus('playing');
    };

    const toggleSquare = (index) => {
        setMarkedSquares(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const checkWin = (gridSize = 3) => {
        const size = gridSize;
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
            combo.every(index => markedSquares.has(index))
        );
    };

    const checkFullHouse = (gridSize = 3) => {
        return markedSquares.size === gridSize * gridSize;
    };

    const leaveRoom = () => {
        setCurrentRoom(null);
        setMarkedSquares(new Set());
        setGameStatus('idle');
        setPlayers([]);
    };

    const endGame = () => {
        setGameStatus('finished');
    };

    return (
        <GameContext.Provider value={{
            currentRoom,
            markedSquares,
            gameStatus,
            players,
            createRoom,
            joinRoom,
            startGame,
            toggleSquare,
            checkWin,
            checkFullHouse,
            leaveRoom,
            endGame,
            setPlayers,
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
