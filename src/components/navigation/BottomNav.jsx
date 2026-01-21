import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Trophy, ShoppingBag, User, Newspaper } from 'lucide-react';

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/leagues', icon: Trophy, label: 'Leagues' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    { path: '/news', icon: Newspaper, label: 'News' },
    { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    // Don't show nav on certain pages
    const hiddenPaths = ['/welcome', '/login', '/signup', '/play', '/room'];
    const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

    if (shouldHide) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
            <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = location.pathname === path;
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-xs font-semibold ${isActive ? 'text-primary-600' : ''}`}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
