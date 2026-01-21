import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext(null);

// Connect to backend socket
const SOCKET_URL = import.meta.env.PROD ? undefined : 'http://localhost:3001';

const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true
});

export function GameProvider({ children }) {
    // Multi-game state: Map of code -> game state
    const [activeGames, setActiveGames] = useState({});
    // Track which game is currently in foreground (being viewed)
    const [currentGameCode, setCurrentGameCode] = useState(null);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [gameResult, setGameResult] = useState(null);
    const [notification, setNotification] = useState(null);

    // Derived: current game state (for compatibility)
    const gameState = currentGameCode ? activeGames[currentGameCode] : null;

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
            setActiveGames(prev => ({ ...prev, [room.code]: room }));
            setCurrentGameCode(room.code);
            setGameResult(null);
        }

        function onRoomJoined(room) {
            console.log("Room joined", room);
            setActiveGames(prev => ({ ...prev, [room.code]: room }));
            setCurrentGameCode(room.code);
            setGameResult(null);
        }

        function onRoomUpdated(room) {
            console.log("Room updated", room);
            setActiveGames(prev => ({ ...prev, [room.code]: room }));
        }

        function onGameStarted(room) {
            console.log("Game started", room);
            setActiveGames(prev => ({ ...prev, [room.code]: room }));
            setGameResult(null);
        }

        function onGameEnded(result) {
            console.log("Game ended", result);
            setGameResult(result);
            // Update the game status in activeGames
            setActiveGames(prev => {
                const updated = { ...prev };
                // Find game by winnerId context or current game
                if (currentGameCode && updated[currentGameCode]) {
                    updated[currentGameCode] = {
                        ...updated[currentGameCode],
                        status: 'finished',
                        winnerId: result.winnerId
                    };
                }
                return updated;
            });
        }

        function onBingoAnnounced({ playerId }) {
            const currentGame = currentGameCode ? activeGames[currentGameCode] : null;
            const player = currentGame?.players?.find(p => p.id === playerId);
            const name = player?.name || 'Unknown Player';

            setNotification({
                id: Date.now(),
                type: 'bingo',
                message: `BINGO announced by ${name}!`,
                duration: 5000
            });
            setTimeout(() => setNotification(null), 5000);
        }

        function onContributionUpdated(data) {
            setActiveGames(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(code => {
                    if (updated[code].status === 'collecting') {
                        updated[code] = { ...updated[code], contributionProgress: data };
                    }
                });
                return updated;
            });
        }

        function onBoardsGenerated(room) {
            setActiveGames(prev => ({ ...prev, [room.code]: room }));
        }

        function onReactionReceived(data) {
            window.dispatchEvent(new CustomEvent('bingo-reaction', { detail: data }));
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
        socket.on('contribution_updated', onContributionUpdated);
        socket.on('boards_generated', onBoardsGenerated);
        socket.on('reaction_received', onReactionReceived);
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
            socket.off('contribution_updated', onContributionUpdated);
            socket.off('boards_generated', onBoardsGenerated);
            socket.off('reaction_received', onReactionReceived);
            socket.off('error', onError);
        };
    }, [currentGameCode, activeGames]);

    const createRoom = (roomData, player) => {
        const hostPlayer = player || { name: 'Host', isHost: true };
        socket.emit('create_room', {
            roomData,
            player: { ...hostPlayer, isHost: true }
        });
    };

    const joinRoom = (code, player) => {
        socket.emit('join_room', { code, player });
    };

    // Focus on a specific game (bring to foreground)
    const focusGame = useCallback((code) => {
        setCurrentGameCode(code);
        // Rejoin socket room if needed
        if (activeGames[code]) {
            socket.emit('join_room', {
                code,
                player: { name: activeGames[code].players?.find(p => p.id === socket.id)?.name || 'Player' }
            });
        }
    }, [activeGames]);

    // Put current game in background (navigate away without leaving)
    const backgroundGame = useCallback(() => {
        // Just clear the foreground, keep in activeGames
        setCurrentGameCode(null);
        setGameResult(null);
    }, []);

    const startGame = (code) => {
        socket.emit('start_game', code);
    };

    const submitSquares = (code, squares) => {
        socket.emit('submit_squares', { code, squares });
    };

    const toggleSquare = (code, index, masterIndex) => {
        const game = activeGames[code];
        if (!game) return;

        const isHost = game.players?.find(p => p.id === socket.id)?.isHost;

        if (isHost) {
            const targetId = masterIndex !== undefined ? masterIndex : index;
            socket.emit('host_action_mark', { code, masterIndex: targetId });
        }

        const myMarked = game.markedSquares?.[socket.id] || [];
        const newSet = new Set(myMarked);

        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }

        const newList = Array.from(newSet);

        // Optimistic update
        setActiveGames(prev => {
            const updated = { ...prev };
            if (updated[code]) {
                const prevMarked = updated[code].markedSquares || {};
                updated[code] = {
                    ...updated[code],
                    markedSquares: {
                        ...prevMarked,
                        [socket.id]: newList
                    }
                };
            }
            return updated;
        });

        socket.emit('marked_update', { code, markedSquares: newList });
    };

    const checkWin = (game) => {
        if (!game) return false;

        const marked = new Set(game.markedSquares?.[socket.id] || []);
        const size = game.gridSize || 3;
        const winning = [];

        for (let i = 0; i < size; i++) {
            winning.push(Array.from({ length: size }, (_, j) => i * size + j));
        }
        for (let i = 0; i < size; i++) {
            winning.push(Array.from({ length: size }, (_, j) => j * size + i));
        }
        winning.push(Array.from({ length: size }, (_, i) => i * size + i));
        winning.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));

        const isWin = winning.some(combo => combo.every(index => marked.has(index)));

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

    // Permanently leave a room (remove from activeGames)
    const leaveRoom = (code) => {
        socket.emit('leave_room', { code });
        setActiveGames(prev => {
            const updated = { ...prev };
            delete updated[code];
            return updated;
        });
        if (currentGameCode === code) {
            setCurrentGameCode(null);
        }
    };

    // Remove finished games from activeGames (cleanup)
    const removeFinishedGame = (code) => {
        setActiveGames(prev => {
            const updated = { ...prev };
            delete updated[code];
            return updated;
        });
        if (currentGameCode === code) {
            setCurrentGameCode(null);
        }
    };

    const getGame = (code) => {
        return activeGames[code] || null;
    };

    const updateGame = (code, updates) => {
        socket.emit('room_update', { code, updates });
    };

    // Get list of active games as array for UI
    const getActiveGamesList = useCallback(() => {
        return Object.values(activeGames).filter(g => g.status !== 'finished');
    }, [activeGames]);

    return (
        <GameContext.Provider value={{
            isConnected,
            activeGames: Object.values(activeGames), // Compatibility: array of games
            activeGamesMap: activeGames, // Direct access to map
            currentGameCode,
            gameState, // Current foreground game
            gameResult,
            notification,
            getGame,
            getActiveGamesList,
            createRoom,
            joinRoom,
            focusGame,
            backgroundGame,
            startGame,
            submitSquares,
            toggleSquare,
            checkWin,
            checkFullHouse,
            leaveRoom,
            removeFinishedGame,
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
