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

        // Audio Reactions
        socket.on('send_reaction', (data) => {
            const { code, reactionId, emoji } = data;
            const room = rooms.get(code);

            if (room) {
                const player = room.players.find(p => p.id === socket.id);
                if (player) {
                    // Broadcast to all players in room
                    io.to(code).emit('reaction_received', {
                        reactionId,
                        emoji,
                        playerId: socket.id,
                        playerName: player.name,
                        timestamp: Date.now(),
                    });
                }
            }
        });


        socket.on('start_game', (code) => {
            const room = rooms.get(code);
            if (room) {
                // Helper to shuffle array
                const shuffle = (array) => {
                    for (let i = array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [array[i], array[j]] = [array[j], array[i]];
                    }
                    return array;
                };

                if (room.gameMode === 'crowd_shuffle') {
                    // Crowd Shuffle: Enter "collecting" phase
                    room.status = 'collecting';
                    room.startTime = Date.now();
                    room.contributions = {}; // playerId -> [squares]
                    room.minSquaresPerPlayer = Math.ceil(9 / (room.players.length + 1));

                    rooms.set(code, room);
                    io.to(code).emit('game_started', room);
                } else {
                    // Classic / First to Line: Go directly to playing
                    room.status = 'playing';
                    room.startTime = Date.now();

                    const itemCount = room.items ? room.items.length : (room.gridSize * room.gridSize);
                    const masterIndices = Array.from({ length: itemCount }, (_, i) => i);
                    const targetSquareCount = (room.gridSize || 3) * (room.gridSize || 3);

                    room.players.forEach(p => {
                        const shuffled = shuffle([...masterIndices]);
                        p.boardMapping = shuffled.slice(0, targetSquareCount);
                    });

                    rooms.set(code, room);
                    io.to(code).emit('game_started', room);
                }
            }
        });

        // Crowd Shuffle: Submit squares
        socket.on('submit_squares', (data) => {
            const { code, squares } = data;
            const room = rooms.get(code);

            if (!room || room.status !== 'collecting') {
                socket.emit('error', 'Cannot submit squares at this time');
                return;
            }

            const player = room.players.find(p => p.id === socket.id);
            if (!player) {
                socket.emit('error', 'Player not in room');
                return;
            }

            // Validate minimum squares
            if (!squares || squares.length < room.minSquaresPerPlayer) {
                socket.emit('error', `Please submit at least ${room.minSquaresPerPlayer} squares`);
                return;
            }

            // Store contribution
            const playerId = player.userId || player.id;
            room.contributions[playerId] = squares.filter(s => s && s.trim());

            rooms.set(code, room);
            io.to(code).emit('contribution_updated', {
                contributions: room.contributions,
                playersSubmitted: Object.keys(room.contributions).length,
                totalPlayers: room.players.length
            });

            // Check if all players submitted
            const allSubmitted = room.players.every(p => {
                const pid = p.userId || p.id;
                return room.contributions[pid] && room.contributions[pid].length >= room.minSquaresPerPlayer;
            });

            if (allSubmitted) {
                // Generate boards from pooled squares
                const allSquares = Object.values(room.contributions).flat();
                room.items = allSquares;
                room.status = 'playing';

                // Shuffle helper
                const shuffle = (array) => {
                    for (let i = array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [array[i], array[j]] = [array[j], array[i]];
                    }
                    return array;
                };

                const gridSize = room.gridSize || 3;
                const targetSquareCount = gridSize * gridSize;
                const masterIndices = Array.from({ length: allSquares.length }, (_, i) => i);

                room.players.forEach(p => {
                    const shuffled = shuffle([...masterIndices]);
                    p.boardMapping = shuffled.slice(0, targetSquareCount);
                });

                rooms.set(code, room);
                io.to(code).emit('boards_generated', room);
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
                const isCalling = existingIndex === -1; // True if we are adding it

                if (isCalling) {
                    room.calledSquares.push(masterIndex);
                } else {
                    room.calledSquares.splice(existingIndex, 1);
                }

                // AUTO-MARK LOGIC: Update markedSquares for ALL players
                if (!room.markedSquares) room.markedSquares = {};

                room.players.forEach(player => {
                    const playerId = player.id; // socket id
                    // Get current marks or empty
                    const playerMarks = new Set(room.markedSquares[playerId] || []);

                    // Find which square on THEIR board corresponds to this masterIndex
                    const boardMapping = player.boardMapping || [];

                    // If no mapping (legacy?), assume direct mapping 1:1
                    if (!player.boardMapping) {
                        if (isCalling) playerMarks.add(masterIndex);
                        else playerMarks.delete(masterIndex);
                    } else {
                        boardMapping.forEach((mIdx, lIdx) => {
                            if (mIdx === masterIndex) {
                                if (isCalling) {
                                    playerMarks.add(lIdx);
                                } else {
                                    playerMarks.delete(lIdx);
                                }
                            }
                        });
                    }

                    // Save back to room state
                    room.markedSquares[playerId] = Array.from(playerMarks);
                });

                // Server-side Win Check
                // "First to Line" = any line (row/col/diagonal) wins
                // "Classic" = full house (all squares) wins (BINGO!)
                const size = room.gridSize || 3;
                let winner = null;
                let winReason = '';

                // Helper to check if a set of local indices is fully called
                const checkLine = (localIndices, playerMapping) => {
                    return localIndices.every(localIdx => {
                        const mappedMasterIdx = playerMapping ? playerMapping[localIdx] : localIdx;
                        return room.calledSquares.includes(mappedMasterIdx);
                    });
                };

                // Helper to check if ALL squares are marked (full house/bingo)
                const checkFullHouse = (playerMapping) => {
                    const totalSquares = size * size;
                    for (let localIdx = 0; localIdx < totalSquares; localIdx++) {
                        const mappedMasterIdx = playerMapping ? playerMapping[localIdx] : localIdx;
                        if (!room.calledSquares.includes(mappedMasterIdx)) {
                            return false;
                        }
                    }
                    return true;
                };

                // If gameMode is not set, default based on type
                const mode = room.gameMode || 'classic';

                if (mode === 'first_to_line') {
                    // First to Line: Check for any completed line
                    for (const player of room.players) {
                        // Rows
                        for (let i = 0; i < size; i++) {
                            const rowIndices = Array.from({ length: size }, (_, j) => i * size + j);
                            if (checkLine(rowIndices, player.boardMapping)) {
                                winner = player;
                                winReason = 'row_completed';
                                break;
                            }
                        }
                        if (winner) break;

                        // Columns
                        for (let i = 0; i < size; i++) {
                            const colIndices = Array.from({ length: size }, (_, j) => i + j * size);
                            if (checkLine(colIndices, player.boardMapping)) {
                                winner = player;
                                winReason = 'col_completed';
                                break;
                            }
                        }
                        if (winner) break;

                        // Diagonals
                        const diag1 = Array.from({ length: size }, (_, i) => i * (size + 1));
                        if (checkLine(diag1, player.boardMapping)) {
                            winner = player;
                            winReason = 'diag_completed';
                            break;
                        }

                        const diag2 = Array.from({ length: size }, (_, i) => (i + 1) * (size - 1));
                        if (checkLine(diag2, player.boardMapping)) {
                            winner = player;
                            winReason = 'diag_completed';
                            break;
                        }
                    }
                } else {
                    // Classic (default): Check for full house (BINGO - all squares marked)
                    // Also check for full house if mode explicitly classic
                    for (const player of room.players) {
                        if (checkFullHouse(player.boardMapping)) {
                            winner = player;
                            winReason = 'full_house';
                            break;
                        }
                    }
                }

                if (winner) {
                    room.status = 'finished';
                    room.winnerId = winner.userId || winner.id;

                    // Calculate final leaderboard
                    const leaderboard = room.players.map(p => {
                        const stats = calculatePlayerScore(p, room);
                        if (p.id === winner.id || (p.userId && p.userId === winner.userId)) {
                            stats.isWinner = true;
                        }
                        return stats;
                    }).sort((a, b) => b.score - a.score);

                    // Calculate prize for competitive games
                    let prizeAmount = 0;
                    if (room.type === 'serious' && room.entryFee > 0) {
                        prizeAmount = room.entryFee * room.players.length;
                    }

                    io.to(code).emit('game_ended', {
                        winnerId: room.winnerId,
                        winnerName: winner.name,
                        reason: winReason,
                        leaderboard,
                        prizeAmount
                    });
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
