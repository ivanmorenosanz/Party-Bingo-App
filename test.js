import React, { useState } from 'react';
import { Home, Users, Trophy, Plus, ArrowLeft, Check, X, Share2, Copy } from 'lucide-react';

const BingoApp = () => {
    const [currentScreen, setCurrentScreen] = useState('home');
    const [user, setUser] = useState(null);
    const [roomCode, setRoomCode] = useState('');
    const [roomName, setRoomName] = useState('');
    const [bingoItems, setBingoItems] = useState(Array(9).fill(''));
    const [currentRoom, setCurrentRoom] = useState(null);
    const [markedSquares, setMarkedSquares] = useState(new Set());

    const communityBingos = [
        { id: 1, title: 'Party Night Classics', creator: 'PartyKing', plays: 1234, items: ['Someone spills a drink', 'Bad karaoke', 'Pizza arrives', 'Group selfie', 'Dance battle', 'Someone falls asleep', 'Impromptu game', 'Late arrival', 'Epic story told'] },
        { id: 2, title: 'Movie Night Predictions', creator: 'FilmBuff', plays: 856, items: ['Someone cries', 'Bathroom break', 'Phone rings', 'Snack refill', 'Plot twist called', 'Quote the movie', 'Someone snores', 'Pause for debate', 'Rewind scene'] },
        { id: 3, title: 'Game Night Bingo', creator: 'BoardGameFan', plays: 642, items: ['Rules argument', 'Sore loser', 'Unexpected winner', 'Snack break', 'Phone distraction', 'Comeback victory', 'Bad dice roll', 'Alliance formed', 'Table flip threat'] }
    ];

    const WelcomeScreen = () => (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex flex-col items-center justify-center p-6">
            <div className="text-center mb-12">
                <h1 className="text-6xl font-bold text-white mb-4">🎯 BingoPredicts</h1>
                <p className="text-xl text-white/90">Predict. Play. Win.</p>
            </div>

            <div className="w-full max-w-md space-y-4">
                <button
                    onClick={() => setCurrentScreen('signup')}
                    className="w-full bg-white text-purple-600 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                    Get Started
                </button>
                <button
                    onClick={() => setCurrentScreen('login')}
                    className="w-full bg-white/20 backdrop-blur text-white py-4 rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/30 transition-all"
                >
                    I Have an Account
                </button>
            </div>
        </div>
    );

    const SignupScreen = () => {
        const [username, setUsername] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');

        const handleSignup = () => {
            if (username && email && password) {
                setUser({ username, email, coins: 100 });
                setCurrentScreen('home');
            }
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6">
                <button onClick={() => setCurrentScreen('welcome')} className="text-white mb-8">
                    <ArrowLeft size={24} />
                </button>

                <div className="max-w-md mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-8">Create Account</h2>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-4 rounded-xl bg-white/20 backdrop-blur border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-xl bg-white/20 backdrop-blur border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 rounded-xl bg-white/20 backdrop-blur border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
                        />

                        <button
                            onClick={handleSignup}
                            className="w-full bg-white text-purple-600 py-4 rounded-xl font-bold text-lg shadow-lg mt-6"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const LoginScreen = () => {
        const handleLogin = () => {
            setUser({ username: 'DemoUser', email: 'demo@example.com', coins: 100 });
            setCurrentScreen('home');
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6">
                <button onClick={() => setCurrentScreen('welcome')} className="text-white mb-8">
                    <ArrowLeft size={24} />
                </button>

                <div className="max-w-md mx-auto">
                    <h2 className="text-4xl font-bold text-white mb-8">Welcome Back</h2>

                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-4 rounded-xl bg-white/20 backdrop-blur border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-4 rounded-xl bg-white/20 backdrop-blur border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
                        />

                        <button
                            onClick={handleLogin}
                            className="w-full bg-white text-purple-600 py-4 rounded-xl font-bold text-lg shadow-lg mt-6"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const HomeScreen = () => (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Hey, {user?.username}!</h1>
                        <p className="text-white/80">Ready to predict?</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                        <span className="text-white font-bold">🪙 {user?.coins}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setCurrentScreen('createRoom')}
                        className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all"
                    >
                        <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                            <Plus className="text-purple-600" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800">Create Room</h3>
                        <p className="text-sm text-gray-500 mt-1">Start a new game</p>
                    </button>

                    <button
                        onClick={() => setCurrentScreen('joinRoom')}
                        className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all"
                    >
                        <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                            <Users className="text-pink-600" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800">Join Room</h3>
                        <p className="text-sm text-gray-500 mt-1">Enter room code</p>
                    </button>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Community Bingos</h2>
                    <div className="space-y-3">
                        {communityBingos.map(bingo => (
                            <div
                                key={bingo.id}
                                onClick={() => {
                                    setCurrentRoom({
                                        name: bingo.title,
                                        code: 'DEMO',
                                        items: bingo.items,
                                        isHost: false
                                    });
                                    setCurrentScreen('gameplay');
                                }}
                                className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                            >
                                <h3 className="font-bold text-gray-800">{bingo.title}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm text-gray-500">by {bingo.creator}</span>
                                    <span className="text-sm text-purple-600 font-semibold">{bingo.plays} plays</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <BottomNav active="home" />
        </div>
    );

    const CreateRoomScreen = () => {
        const handleCreateRoom = () => {
            if (roomName && bingoItems.every(item => item.trim())) {
                const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                setCurrentRoom({
                    name: roomName,
                    code: code,
                    items: bingoItems,
                    isHost: true
                });
                setCurrentScreen('roomLobby');
            }
        };

        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-b-3xl shadow-lg">
                    <div className="flex items-center mb-4">
                        <button onClick={() => setCurrentScreen('home')} className="text-white mr-4">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-bold text-white">Create Room</h1>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Room Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Friday Night Party"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bingo Predictions (3x3)</label>
                        <div className="grid grid-cols-3 gap-2">
                            {bingoItems.map((item, index) => (
                                <textarea
                                    key={index}
                                    placeholder={`#${index + 1}`}
                                    value={item}
                                    onChange={(e) => {
                                        const newItems = [...bingoItems];
                                        newItems[index] = e.target.value;
                                        setBingoItems(newItems);
                                    }}
                                    className="p-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm resize-none h-20"
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleCreateRoom}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
                    >
                        Create Room
                    </button>
                </div>
            </div>
        );
    };

    const JoinRoomScreen = () => {
        const handleJoinRoom = () => {
            if (roomCode.length === 6) {
                setCurrentRoom({
                    name: 'Demo Room',
                    code: roomCode.toUpperCase(),
                    items: communityBingos[0].items,
                    isHost: false
                });
                setCurrentScreen('roomLobby');
            }
        };

        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-b-3xl shadow-lg">
                    <div className="flex items-center mb-4">
                        <button onClick={() => setCurrentScreen('home')} className="text-white mr-4">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-bold text-white">Join Room</h1>
                    </div>
                </div>

                <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
                    <div className="text-center mb-8">
                        <div className="bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-purple-600" size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Room Code</h2>
                        <p className="text-gray-500">Ask your host for the 6-digit code</p>
                    </div>

                    <input
                        type="text"
                        placeholder="ABC123"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="w-full max-w-xs p-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-center text-2xl font-bold tracking-widest mb-6"
                    />

                    <button
                        onClick={handleJoinRoom}
                        disabled={roomCode.length !== 6}
                        className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Join Room
                    </button>
                </div>
            </div>
        );
    };

    const RoomLobbyScreen = () => {
        const [copied, setCopied] = useState(false);

        const copyRoomCode = () => {
            navigator.clipboard.writeText(currentRoom.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        const players = ['You', 'Sarah', 'Mike', 'Alex'];

        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-b-3xl shadow-lg">
                    <div className="flex items-center mb-4">
                        <button onClick={() => {
                            setCurrentScreen('home');
                            setCurrentRoom(null);
                        }} className="text-white mr-4">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-bold text-white">{currentRoom?.name}</h1>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                        <p className="text-sm text-gray-500 mb-2">Room Code</p>
                        <div className="flex items-center justify-center gap-3">
                            <h2 className="text-4xl font-bold text-purple-600 tracking-wider">{currentRoom?.code}</h2>
                            <button
                                onClick={copyRoomCode}
                                className="bg-purple-100 p-2 rounded-lg hover:bg-purple-200 transition-colors"
                            >
                                {copied ? <Check className="text-green-600" size={20} /> : <Copy className="text-purple-600" size={20} />}
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Share this code with friends</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Users size={20} />
                            Players ({players.length})
                        </h3>
                        <div className="space-y-2">
                            {players.map((player, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                        {player[0]}
                                    </div>
                                    <span className="font-semibold text-gray-700">{player}</span>
                                    {index === 0 && currentRoom?.isHost && (
                                        <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-semibold">Host</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {currentRoom?.isHost && (
                        <button
                            onClick={() => setCurrentScreen('gameplay')}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
                        >
                            Start Game
                        </button>
                    )}

                    {!currentRoom?.isHost && (
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                            <p className="text-purple-700 font-semibold">Waiting for host to start...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const GameplayScreen = () => {
        const toggleSquare = (index) => {
            const newMarked = new Set(markedSquares);
            if (newMarked.has(index)) {
                newMarked.delete(index);
            } else {
                newMarked.add(index);
            }
            setMarkedSquares(newMarked);
        };

        const checkWin = () => {
            const winning = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];

            return winning.some(combo =>
                combo.every(index => markedSquares.has(index))
            );
        };

        const hasBingo = checkWin();

        return (
            <div className="min-h-screen bg-gray-50 pb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-b-3xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <button onClick={() => setCurrentScreen('roomLobby')} className="text-white mr-4">
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">{currentRoom?.name}</h1>
                                <p className="text-white/80 text-sm">Room: {currentRoom?.code}</p>
                            </div>
                        </div>
                        <button className="bg-white/20 backdrop-blur p-2 rounded-lg">
                            <Share2 className="text-white" size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {hasBingo && (
                        <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-2xl shadow-lg text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">🎉 BINGO! 🎉</h2>
                            <p className="text-white">You have completed a line!</p>
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
                        <div className="grid grid-cols-3 gap-2">
                            {currentRoom?.items.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => toggleSquare(index)}
                                    className={`aspect-square p-2 rounded-xl border-2 transition-all flex items-center justify-center text-center text-xs font-semibold relative ${markedSquares.has(index)
                                        ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white shadow-lg scale-95'
                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-300'
                                        }`}
                                >
                                    {markedSquares.has(index) && (
                                        <Check className="absolute" size={32} />
                                    )}
                                    <span className={markedSquares.has(index) ? 'opacity-50' : ''}>{item}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl shadow-md">
                        <h3 className="font-bold text-gray-800 mb-3">Leaderboard</h3>
                        <div className="space-y-2">
                            {[
                                { name: 'You', squares: markedSquares.size, coins: '+50' },
                                { name: 'Sarah', squares: 4, coins: '+40' },
                                { name: 'Mike', squares: 3, coins: '+30' },
                                { name: 'Alex', squares: 2, coins: '+20' }
                            ].map((player, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-purple-600">#{index + 1}</span>
                                        <span className="font-semibold text-gray-700">{player.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">{player.squares}/9</span>
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">{player.coins}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const CommunityScreen = () => (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-b-3xl shadow-lg">
                <h1 className="text-2xl font-bold text-white mb-4">Community Bingos</h1>
                <input
                    type="text"
                    placeholder="Search bingos..."
                    className="w-full p-3 rounded-xl bg-white/20 backdrop-blur border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
                />
            </div>

            <div className="p-6 space-y-3">
                {communityBingos.map(bingo => (
                    <div
                        key={bingo.id}
                        onClick={() => {
                            setCurrentRoom({
                                name: bingo.title,
                                code: 'COMMUNITY',
                                items: bingo.items,
                                isHost: false
                            });
                            setCurrentScreen('gameplay');
                        }}
                        className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-gray-800 text-lg">{bingo.title}</h3>
                            <Trophy className="text-yellow-500" size={20} />
                        </div>
                        <p className="text-sm text-gray-500 mb-3">by {bingo.creator}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-semibold">{bingo.plays} plays</span>
                            <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-200 transition-colors">
                                Play Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <BottomNav active="community" />
        </div>
    );

    const LeaderboardScreen = () => {
        const topPlayers = [
            { rank: 1, name: 'PredictMaster', wins: 156, coins: 15600 },
            { rank: 2, name: 'BingoKing', wins: 142, coins: 14200 },
            { rank: 3, name: 'LuckyCharm', wins: 138, coins: 13800 },
            { rank: 4, name: user?.username || 'You', wins: 45, coins: user?.coins || 100 },
            { rank: 5, name: 'GameGuru', wins: 42, coins: 4200 }
        ];

        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-b-3xl shadow-lg">
                    <h1 className="text-2xl font-bold text-white mb-2">Leaderboard</h1>
                    <p className="text-white/80">Top predictors this week</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {topPlayers.slice(0, 3).map((player, index) => (
                            <div key={index} className={`p-4 rounded-xl text-center ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                    'bg-gradient-to-br from-orange-400 to-orange-500'
                                }`}>
                                <div className="text-3xl mb-2">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
                                <p className="font-bold text-white text-sm mb-1">{player.name}</p>
                                <p className="text-white/90 text-xs">{player.wins} wins</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        {topPlayers.map((player) => (
                            <div
                                key={player.rank}
                                className={`p-4 rounded-xl shadow-md ${player.name === user?.username ? 'bg-purple-50 border-2 border-purple-300' : 'bg-white'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-purple-600 text-lg">#{player.rank}</span>
                                        <div>
                                            <p className="font-semibold text-gray-800">{player.name}</p>
                                            <p className="text-sm text-gray-500">{player.wins} wins</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">🪙 {player.coins}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <BottomNav active="leaderboard" />
            </div>
        );
    };

    const BottomNav = ({ active }) => (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around">
            <button
                onClick={() => setCurrentScreen('home')}
                className={`flex flex-col items-center gap-1 ${active === 'home' ? 'text-purple-600' : 'text-gray-400'}`}
            >
                <Home size={24} />
                <span className="text-xs font-semibold">Home</span>
            </button>
            <button
                onClick={() => setCurrentScreen('community')}
                className={`flex flex-col items-center gap-1 ${active === 'community' ? 'text-purple-600' : 'text-gray-400'}`}
            >
                <Users size={24} />
                <span className="text-xs font-semibold">Community</span>
            </button>
            <button
                onClick={() => setCurrentScreen('leaderboard')}
                className={`flex flex-col items-center gap-1 ${active === 'leaderboard' ? 'text-purple-600' : 'text-gray-400'}`}
            >
                <Trophy size={24} />
                <span className="text-xs font-semibold">Leaderboard</span>
            </button>
        </div>
    );

    if (!user) {
        if (currentScreen === 'signup') return <SignupScreen />;
        if (currentScreen === 'login') return <LoginScreen />;
        return <WelcomeScreen />;
    }

    if (currentScreen === 'home') return <HomeScreen />;
    if (currentScreen === 'createRoom') return <CreateRoomScreen />;
    if (currentScreen === 'joinRoom') return <JoinRoomScreen />;
    if (currentScreen === 'roomLobby') return <RoomLobbyScreen />;
    if (currentScreen === 'gameplay') return <GameplayScreen />;
    if (currentScreen === 'community') return <CommunityScreen />;
    if (currentScreen === 'leaderboard') return <LeaderboardScreen />;

    return <HomeScreen />;
};

export default BingoApp;