import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Sparkles, Bell, Download, Globe, ChevronRight, Smartphone } from 'lucide-react';
import Header from '../../components/navigation/Header';
import BottomNav from '../../components/navigation/BottomNav';
import { NEWS_ITEMS, APP_LINKS, getNewsByType } from '../../data/news';

const NEWS_TYPES = [
    { id: 'all', name: 'All', icon: '📰' },
    { id: 'update', name: 'Updates', icon: '🔄' },
    { id: 'feature', name: 'Features', icon: '✨' },
    { id: 'event', name: 'Events', icon: '🎉' },
];

export default function NewsPage() {
    const navigate = useNavigate();
    const [activeType, setActiveType] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    const news = getNewsByType(activeType);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'update': return 'bg-blue-100 text-blue-700';
            case 'feature': return 'bg-purple-100 text-purple-700';
            case 'event': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="gradient-header p-6 pb-4 rounded-b-3xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <Newspaper className="text-white" size={28} />
                    <h1 className="text-2xl font-bold text-white">News & Updates</h1>
                </div>

                {/* Quick Links */}
                <div className="flex gap-2">
                    <a
                        href={APP_LINKS.playStore}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-white/20 backdrop-blur p-3 rounded-xl flex items-center gap-2 text-white hover:bg-white/30 transition-colors"
                    >
                        <Smartphone size={18} />
                        <span className="text-sm font-semibold">Get the App</span>
                    </a>
                    <a
                        href={APP_LINKS.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-white/20 backdrop-blur p-3 rounded-xl flex items-center gap-2 text-white hover:bg-white/30 transition-colors"
                    >
                        <Globe size={18} />
                        <span className="text-sm font-semibold">Website</span>
                    </a>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Type Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
                    {NEWS_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setActiveType(type.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeType === type.id
                                    ? 'bg-primary-100 text-primary-700 font-semibold'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            <span>{type.icon}</span>
                            <span>{type.name}</span>
                        </button>
                    ))}
                </div>

                {/* Featured Banner */}
                {activeType === 'all' && NEWS_ITEMS.find(n => n.featured) && (
                    <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-5 rounded-2xl text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">Featured</span>
                        </div>
                        <h2 className="text-xl font-bold mb-2">{NEWS_ITEMS.find(n => n.featured)?.title}</h2>
                        <p className="text-white/80 text-sm">{NEWS_ITEMS.find(n => n.featured)?.summary}</p>
                    </div>
                )}

                {/* News List */}
                <div className="space-y-3">
                    {news.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="w-full card text-left"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.type === 'update' ? 'bg-blue-50' :
                                        item.type === 'feature' ? 'bg-purple-50' : 'bg-green-50'
                                    }`}>
                                    {item.type === 'update' ? '🔄' : item.type === 'feature' ? '✨' : '🎉'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getTypeColor(item.type)}`}>
                                            {item.type}
                                        </span>
                                        <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{item.summary}</p>

                                    {/* Expanded Content */}
                                    {expandedId === item.id && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-sm text-gray-600 whitespace-pre-line">{item.content}</p>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight
                                    className={`text-gray-400 transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`}
                                    size={20}
                                />
                            </div>
                        </button>
                    ))}
                </div>

                {news.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No News Yet</h3>
                        <p className="text-gray-500">Check back later for updates!</p>
                    </div>
                )}

                {/* Download CTA */}
                <div className="card bg-gradient-to-br from-gray-800 to-gray-900 border-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 w-14 h-14 rounded-xl flex items-center justify-center">
                            <Download className="text-white" size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">Download Party Bingo</h3>
                            <p className="text-gray-400 text-sm">Available on Android</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <a
                            href={APP_LINKS.playStore}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-center hover:bg-green-600 transition-colors"
                        >
                            Google Play
                        </a>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
