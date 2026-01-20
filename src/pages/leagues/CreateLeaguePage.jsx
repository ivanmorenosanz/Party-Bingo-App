import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Users, Lock, Globe } from 'lucide-react';
import Header from '../../components/navigation/Header';
import { createLeague } from '../../data/leagues';
import { useAuth } from '../../context/AuthContext';

export default function CreateLeaguePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [copied, setCopied] = useState(false);
    const [createdLeague, setCreatedLeague] = useState(null);

    const handleCreate = () => {
        if (!name.trim()) {
            alert('Please enter a league name');
            return;
        }

        const league = createLeague({
            name: name.trim(),
            description: description.trim(),
            isPrivate,
            creatorId: user?.id,
            creatorName: user?.username,
        });

        setCreatedLeague(league);
    };

    const copyCode = async () => {
        if (createdLeague?.code) {
            await navigator.clipboard.writeText(createdLeague.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareLeague = async () => {
        if (createdLeague?.code) {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `Join my league: ${createdLeague.name}`,
                        text: `Use code ${createdLeague.code} to join my Party Bingo league!`,
                    });
                } catch (e) {
                    copyCode();
                }
            } else {
                copyCode();
            }
        }
    };

    // Success screen after creation
    if (createdLeague) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header title="League Created!" showBack backPath="/leagues" />

                <div className="p-6 space-y-6">
                    <div className="card text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {createdLeague.name}
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Your league is ready! Share the code with friends.
                        </p>

                        {/* Invite Code */}
                        <div className="bg-gray-100 p-6 rounded-2xl mb-6">
                            <p className="text-sm text-gray-500 mb-2">Invite Code</p>
                            <p className="text-4xl font-bold text-primary-600 tracking-widest font-mono">
                                {createdLeague.code}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={copyCode}
                                className="flex-1 btn-outline flex items-center justify-center gap-2"
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={shareLeague}
                                className="flex-1 btn-primary flex items-center justify-center gap-2"
                            >
                                <Users size={20} />
                                Share
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/leagues/${createdLeague.id}`)}
                        className="w-full btn-primary"
                    >
                        Go to League
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Create League" showBack backPath="/leagues" />

            <div className="p-6 space-y-6">
                {/* League Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        League Name *
                    </label>
                    <input
                        type="text"
                        placeholder="Friday Night Crew"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={30}
                        className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                        {name.length}/30
                    </p>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description (optional)
                    </label>
                    <textarea
                        placeholder="A friendly competition among friends..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={100}
                        rows={3}
                        className="input-field resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                        {description.length}/100
                    </p>
                </div>

                {/* Privacy Toggle */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Privacy
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setIsPrivate(true)}
                            className={`card flex items-center gap-3 transition-all ${isPrivate
                                    ? 'ring-2 ring-primary-500 bg-primary-50'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPrivate ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                <Lock size={18} />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800">Private</p>
                                <p className="text-xs text-gray-500">Invite only</p>
                            </div>
                        </button>
                        <button
                            onClick={() => setIsPrivate(false)}
                            className={`card flex items-center gap-3 transition-all ${!isPrivate
                                    ? 'ring-2 ring-primary-500 bg-primary-50'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!isPrivate ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                <Globe size={18} />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800">Public</p>
                                <p className="text-xs text-gray-500">Anyone can join</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-primary-50 p-4 rounded-xl">
                    <p className="text-sm text-primary-800">
                        💡 After creating, you'll get a unique invite code to share with friends.
                    </p>
                </div>

                {/* Create Button */}
                <button
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className={`w-full btn-primary ${!name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Create League
                </button>
            </div>
        </div>
    );
}
