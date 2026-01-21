import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext(null);

// Connect to backend socket
// In development, we need to point to port 3001. In production, we are served from the same origin.
const SOCKET_URL = import.meta.env.PROD ? undefined : 'http://localhost:3001';

const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true
});

export function GameProvider({ children }) {
    // Current active game state (single source of truth from server)
    const [gameState, setGameState] = useState(null);
    const [isConnected, setIsConnected] = useState(socket.connected);

    const [gameResult, setGameResult] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            console.log("Connected to websocket");
        }

        function onDisconnect() {
            setIsConnected(false);
            console.log("Disconnected from websocket");
        }

        function onRoomCreated(room) {
            console.log("Room created", room);
            setGameState(room);
            setGameResult(null);
        }

        function onRoomJoined(room) {
            console.log("Room joined", room);
            setGameState(room);
            setGameResult(null);
        }

        function onRoomUpdated(room) {
            console.log("Room updated", room);
            setGameState(room);
        }

        function onGameStarted(room) {
            console.log("Game started", room);
            setGameState(room);
            setGameResult(null);
        }

        function onGameEnded(result) {
            console.log("Game ended", result);
            setGameResult(result);
            setGameState(prev => prev ? { ...prev, status: 'finished', winnerId: result.winnerId } : prev);
        }

        function onBingoAnnounced({ playerId }) {
            // Find player name
            const player = gameState?.players?.find(p => p.id === playerId);
            const name = player?.name || 'Unknown Player';

            // Show notification instead of alert
            setNotification({
                id: Date.now(),
                type: 'bingo',
                message: `BINGO announced by ${name}!`,
                duration: 5000
            });

            // Auto clear
            setTimeout(() => setNotification(null), 5000);
        }

        function onError(message) {
            setNotification({
                id: Date.now(),
                type: 'error',
                message: `Error: ${message}`,
                duration: 3000
            });
            setTimeout(() => setNotification(null), 3000);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('room_created', onRoomCreated);
        socket.on('room_joined', onRoomJoined);
        socket.on('room_updated', onRoomUpdated);
        socket.on('game_started', onGameStarted);
        socket.on('game_ended', onGameEnded);
        socket.on('bingo_announced', onBingoAnnounced);
        socket.on('error', onError);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('room_created', onRoomCreated);
            socket.off('room_joined', onRoomJoined);
            socket.off('room_updated', onRoomUpdated);
            socket.off('game_started', onGameStarted);
            socket.off('game_ended', onGameEnded);
            socket.off('bingo_announced', onBingoAnnounced);
            socket.off('error', onError);
        };
    }, [gameState]); // Added gameState dependency to find player name

    const createRoom = (roomData, player) => {
        // We act as if we are a "user". In a real app we'd have auth context user ID/Name
        const hostPlayer = player || { name: 'Host', isHost: true };
        socket.emit('create_room', {
            roomData,
            player: { ...hostPlayer, isHost: true }
        });
    };

    const joinRoom = (code, player) => {
        // Player should have name
        socket.emit('join_room', {
            code,
            player
        });
    };

    const startGame = (code) => {
        socket.emit('start_game', code);
    };

    const toggleSquare = (code, index, masterIndex) => {
        if (!gameState) return;

        // Check if I am host
        const isHost = gameState.players?.find(p => p.id === socket.id)?.isHost;

        if (isHost) {
            // Host logic: Mark globally (Call the number using MASTER ID)
            // If masterIndex is provided (from UI), use it. Otherwise fallback to index (if no mapping)
            const targetId = masterIndex !== undefined ? masterIndex : index;
            socket.emit('host_action_mark', { code, masterIndex: targetId });
        }

        // Player logic: Mark my own board
        const myMarked = gameState.markedSquares?.[socket.id] || [];
        const newSet = new Set(myMarked);

        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }

        const newList = Array.from(newSet);

        // Optimistic update
        setGameState(prev => {
            if (!prev) return prev;
            const prevMarked = prev.markedSquares || {};
            return {
                ...prev,
                markedSquares: {
                    ...prevMarked,
                    [socket.id]: newList
                }
            };
        });

        socket.emit('marked_update', {
            code,
            markedSquares: newList
        });
    };

    const checkWin = (game) => {
        if (!game) return false;

        const marked = new Set(game.markedSquares?.[socket.id] || []);
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

        const isWin = winning.some(combo =>
            combo.every(index => marked.has(index))
        );

        if (isWin) {
            socket.emit('bingo_call', { code: game.code });
        }

        return isWin;
    };

    const checkFullHouse = (game) => {
        if (!game) return false;
        const marked = new Set(game.markedSquares?.[socket.id] || []);
        const size = game.gridSize || 3;
        return marked.size === size * size;
    };

    const leaveRoom = (code) => {
        socket.emit('leave_room', { code });
        setGameState(null);
    };

    // Compatibility helper
    const getGame = (code) => {
        if (gameState && gameState.code === code) return gameState;
        return null;
    };

    const updateGame = (code, updates) => {
        socket.emit('room_update', { code, updates });
    };

    return (
        <GameContext.Provider value={{
            isConnected,
            activeGames: gameState ? [gameState] : [], // Compatibility shim
            gameState, // Expose current main game state explicitly
            gameResult, // Final game results (leaderboard)
            notification, // New notification state
            getGame,
            createRoom,
            joinRoom,
            startGame,
            toggleSquare,
            checkWin,
            checkFullHouse,
            leaveRoom,
            updateGame,
            socket
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
