import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import BingoBackground from './components/layout/BingoBackground';

// Pages
import WelcomePage from './pages/auth/WelcomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import HomePage from './pages/home/HomePage';
import CreateRoomPage from './pages/home/CreateRoomPage';
import JoinRoomPage from './pages/home/JoinRoomPage';
import RoomLobbyPage from './pages/gameplay/RoomLobbyPage';
import GameplayPage from './pages/gameplay/GameplayPage';
import LeaguesPage from './pages/leagues/LeaguesPage';
import LeagueDetailPage from './pages/leagues/LeagueDetailPage';
import CreateLeaguePage from './pages/leagues/CreateLeaguePage';
import CommunityPage from './pages/community/CommunityPage';
import BingoDetailPage from './pages/community/BingoDetailPage';
// import BingoDetailPage from './pages/community/DebugBingoDetailPage';
import CreateBingoPage from './pages/community/CreateBingoPage';
import ShopPage from './pages/shop/ShopPage';
import MarketplacePage from './pages/shop/MarketplacePage';
import ProfilePage from './pages/profile/ProfilePage';
import RewardsPage from './pages/profile/RewardsPage';
import NewsPage from './pages/news/NewsPage';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/welcome" replace />;
}

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen relative">
            <BingoBackground />
            <div className="relative z-10">
                <Routes>
                    {/* Auth Routes */}
                    <Route path="/welcome" element={isAuthenticated ? <Navigate to="/" replace /> : <WelcomePage />} />
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
                    <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />} />

                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                    <Route path="/create-room" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
                    <Route path="/join-room" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />
                    <Route path="/room/:code" element={<ProtectedRoute><RoomLobbyPage /></ProtectedRoute>} />
                    <Route path="/play/:code" element={<ProtectedRoute><GameplayPage /></ProtectedRoute>} />

                    {/* Leagues */}
                    <Route path="/leagues" element={<ProtectedRoute><LeaguesPage /></ProtectedRoute>} />
                    <Route path="/leagues/:id" element={<ProtectedRoute><LeagueDetailPage /></ProtectedRoute>} />
                    <Route path="/create-league" element={<ProtectedRoute><CreateLeaguePage /></ProtectedRoute>} />

                    {/* Community */}
                    <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                    <Route path="/community/:id" element={<ProtectedRoute><BingoDetailPage /></ProtectedRoute>} />
                    <Route path="/create-bingo" element={<ProtectedRoute><CreateBingoPage /></ProtectedRoute>} />

                    {/* Shop */}
                    <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
                    <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />

                    {/* News */}
                    <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />

                    {/* Profile */}
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
