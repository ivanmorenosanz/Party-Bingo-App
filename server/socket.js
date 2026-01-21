import { Server } from 'socket.io';

const rooms = new Map();

export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:5173'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Helper to calculate score for a player
        const calculatePlayerScore = (player, room) => {
            const size = room.gridSize || 3;
            // Default mapping if missing (e.g. legacy rooms)
            const mapping = player.boardMapping || Array.from({ length: size * size }, (_, i) => i);
            const markedIndices = new Set();

            // Determine marked local indices based on global calledSquares
            mapping.forEach((masterIdx, localIdx) => {
                if (room.calledSquares && room.calledSquares.includes(masterIdx)) {
                    markedIndices.add(localIdx);
                }
            });

            let score = markedIndices.size; // 1 point per square
            let lines = 0;

            // Check Rows
            for (let i = 0; i < size; i++) {
                if (Array.from({ length: size }, (_, j) => i * size + j).every(idx => markedIndices.has(idx))) lines++;
            }
            // Check Cols
            for (let i = 0; i < size; i++) {
                if (Array.from({ length: size }, (_, j) => j * size + i).every(idx => markedIndices.has(idx))) lines++;
            }
            // Check Diagonals
            if (Array.from({ length: size }, (_, i) => i * (size + 1)).every(idx => markedIndices.has(idx))) lines++;
            if (Array.from({ length: size }, (_, i) => (i + 1) * (size - 1)).every(idx => markedIndices.has(idx))) lines++;

            score += (lines * 3);
            if (markedIndices.size === size * size) score += 9; // Full house bonus

            return {
                id: player.userId || player.id,
                name: player.name,
                score,
                squares: markedIndices.size,
                lines,
                isWinner: false
            };
        };

        // Helper to shuffle array
        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        socket.on('check_room', (data, callback) => {
            const { code } = data;
            const room = rooms.get(code);

            if (room) {
                callback({
                    exists: true,
                    name: room.name,
                    type: room.type, // 'fun' or 'serious'
                    entryFee: room.entryFee || 0,
                    gameMode: room.gameMode
                });
            } else {
                callback({ exists: false });
            }
        });

        socket.on('create_room', (data) => {
            const { roomData, player } = data;
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            const newRoom = {
                ...roomData,
                code,
                createdAt: new Date().toISOString(),
                status: 'waiting',
                players: [{ ...player, id: socket.id, isHost: true }],
                startTime: null,
                markedSquares: {}, // socketId -> Set(indices)
                calledSquares: []
            };

            rooms.set(code, newRoom);
            socket.join(code);
            socket.emit('room_created', newRoom);
            console.log(`Room created: ${code} by ${socket.id}`);
        });

        socket.on('join_room', (data) => {
            const { code, player } = data;
            const room = rooms.get(code);

            if (!room) {
                socket.emit('error', 'Room not found');
                return;
            }

            if (room.status !== 'waiting') {
                // Allow re-joining if player is already in the list
                const existingPlayer = room.players.find(p => p.name === player.name);
                if (!existingPlayer) {
                    socket.emit('error', 'Game in progress');
                    return;
                }
            }

            // Check for existing player with same name or ID
            console.log(`Checking duplicates for ${player.name} (ID: ${player.id})`);

            const existingPlayerIndex = room.players.findIndex(p =>
                (player.id && p.userId === player.id) || p.name === player.name
            );
            console.log(`Duplicate check result: ${existingPlayerIndex}`);

            if (existingPlayerIndex !== -1) {
                // Update existing player's socket ID
                room.players[existingPlayerIndex].id = socket.id; // Update active socket ID
                room.players[existingPlayerIndex].userId = player.id || room.players[existingPlayerIndex].userId; // Ensure userId is captured

                // Preserve host status if they were host
                if (room.players[existingPlayerIndex].isHost) {
                    // Ensure the new socket connection knows they are host
                    socket.emit('room_joined', room);
                }
                console.log(`Player ${player.name} re-connected to room ${code}`);
            } else {
                // Add new player
                // id becomes socket.id usage for frontend compatibility, userId is persistent ID
                const newPlayer = {
                    ...player,
                    id: socket.id,
                    userId: player.id,
                    isHost: false
                };
                room.players.push(newPlayer);
                console.log(`Player ${player.name} joined room ${code}`);
            }

            rooms.set(code, room);

            socket.join(code);
            io.to(code).emit('room_updated', room);
            // Send back the room state to the joiner specifically so they have the full state immediately
            socket.emit('room_joined', room);
        });

        socket.on('leave_room', (data) => {
            const { code } = data;
            const room = rooms.get(code);

            if (room) {
                // Remove player
                room.players = room.players.filter(p => p.id !== socket.id);

                if (room.players.length === 0) {
                    rooms.delete(code);
                    console.log(`Room ${code} deleted (empty)`);
                } else {
                    // TODO: Handle host migration if host leaves
                    rooms.set(code, room);
                    io.to(code).emit('room_updated', room);
                }

                socket.leave(code);
                console.log(`Player ${socket.id} left room ${code}`);
            }
        });

        socket.on('start_game', (code) => {
            const room = rooms.get(code);
            if (room) {
                room.status = 'playing';
                room.startTime = Date.now();

                // Generate random board mapping for each player
                // Mapping is an array of indices [0, 1, 2...] shuffled
                // Even for "Classic Fun" (same board), we can just use 0..N mapping or identity
                // But user wants randomness. Let's apply it if gameMode is 'crowd_shuffle' OR 'classic' (if requested).
                // User Request: "When a host creates a bingo... those 9 squares should be randomly distributed... so each user has different cardboards"
                // This implies we should ALWAYS shuffle for "Competitive" type, or maybe always for this User.
                // Let's check room.type (serious vs fun).

                // Helper to shuffle array
                const shuffle = (array) => {
                    for (let i = array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [array[i], array[j]] = [array[j], array[i]];
                    }
                    return array;
                };

                const itemCount = room.items ? room.items.length : (room.gridSize * room.gridSize);
                const masterIndices = Array.from({ length: itemCount }, (_, i) => i);
                const targetSquareCount = (room.gridSize || 3) * (room.gridSize || 3);

                room.players.forEach(p => {
                    // Always shuffle and slice for randomness as per request
                    // "we want some randomness... different cardboards"
                    const shuffled = shuffle([...masterIndices]);
                    p.boardMapping = shuffled.slice(0, targetSquareCount);
                });

                rooms.set(code, room);
                io.to(code).emit('game_started', room);
            }
        });

        socket.on('marked_update', (data) => {
            const { code, markedSquares } = data;
            const room = rooms.get(code);
            if (room) {
                if (!room.markedSquares) room.markedSquares = {};
                room.markedSquares[socket.id] = markedSquares;
                rooms.set(code, room);
            }
        });

        socket.on('host_action_mark', (data) => {
            const { code, masterIndex } = data; // Received master index directly
            const room = rooms.get(code);

            if (room) {
                if (!room.calledSquares) room.calledSquares = [];

                // Toggle logic for host
                const existingIndex = room.calledSquares.indexOf(masterIndex);
                if (existingIndex === -1) {
                    room.calledSquares.push(masterIndex);
                } else {
                    room.calledSquares.splice(existingIndex, 1);
                }

                // Server-side Win Check for "First to Line" and "Classic"
                if (room.gameMode === 'first_to_line' || room.gameMode === 'classic') {
                    const size = room.gridSize || 3;
                    let winner = null;

                    // Helper to check if a set of local indices is fully called
                    const checkLine = (localIndices, playerMapping) => {
                        return localIndices.every(localIdx => {
                            // If player has a mapping, use it. Otherwise assume identity (masterIndex = localIdx)
                            // Note: boardMapping stores master indices at local positions.
                            const mappedMasterIdx = playerMapping ? playerMapping[localIdx] : localIdx;
                            return room.calledSquares.includes(mappedMasterIdx);
                        });
                    };

                    for (const player of room.players) {
                        // 1. Rows
                        for (let i = 0; i < size; i++) {
                            const rowIndices = Array.from({ length: size }, (_, j) => i * size + j);
                            if (checkLine(rowIndices, player.boardMapping)) {
                                winner = player;
                                break;
                            }
                        }
                        if (winner) break;

                        // 2. Columns
                        for (let i = 0; i < size; i++) {
                            const colIndices = Array.from({ length: size }, (_, j) => i + j * size);
                            if (checkLine(colIndices, player.boardMapping)) {
                                winner = player;
                                break;
                            }
                        }
                        if (winner) break;

                        // 3. Diagonals
                        const diag1 = Array.from({ length: size }, (_, i) => i * (size + 1));
                        if (checkLine(diag1, player.boardMapping)) {
                            winner = player;
                            break;
                        }

                        const diag2 = Array.from({ length: size }, (_, i) => (i + 1) * (size - 1));
                        if (checkLine(diag2, player.boardMapping)) {
                            winner = player;
                            break;
                        }
                    }

                    if (winner) {
                        room.status = 'finished';
                        room.winnerId = winner.userId || winner.id; // Store winner ID

                        // Calculate final leaderboard for everyone
                        const leaderboard = room.players.map(p => {
                            const stats = calculatePlayerScore(p, room);
                            if (p.id === winner.id || (p.userId && p.userId === winner.userId)) {
                                stats.isWinner = true;
                            }
                            return stats;
                        }).sort((a, b) => b.score - a.score);

                        io.to(code).emit('game_ended', {
                            winnerId: room.winnerId,
                            winnerName: winner.name,
                            reason: 'line_completed',
                            leaderboard // Broadcast full standby
                        });
                    }
                }

                rooms.set(code, room);
                io.to(code).emit('room_updated', room);
            }
        });

        // Handle win check broadcasting
        socket.on('bingo_call', (data) => {
            const { code } = data;
            io.to(code).emit('bingo_announced', { playerId: socket.id });
        });

        socket.on('room_update', (data) => {
            const { code, updates } = data;
            const room = rooms.get(code);
            if (room) {
                // Merge updates
                Object.assign(room, updates);
                if (updates.players) {
                    // logic to ensure we don't duplicate players or overwrite incorrectly?
                    // The client sends full player list? 
                    // Let's trust the client for this rapid prototype
                }
                rooms.set(code, room);
                io.to(code).emit('room_updated', room);
            }
        });

        socket.on('disconnect', () => {
            // Find rooms where user was present
            rooms.forEach((room, code) => {
                const playerIndex = room.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    room.players.splice(playerIndex, 1);
                    if (room.players.length === 0) {
                        rooms.delete(code);
                    } else {
                        // If host left, assign new host
                        const hasHost = room.players.some(p => p.isHost);
                        if (!hasHost) {
                            room.players[0].isHost = true;
                        }
                        io.to(code).emit('room_updated', room);
                    }
                }
            });
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};
