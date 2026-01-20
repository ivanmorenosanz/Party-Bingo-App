# 🎯 Party Bingo App

A feature-rich bingo application where users can create custom bingos, play with friends in private rooms, compete in leagues, and earn rewards!

## ✨ Features

### 🏠 Private Rooms
- Create custom bingo rooms with personalized squares
- Share room codes with friends
- Choose between **Fun** (same board for all) and **Competitive** (randomized boards) modes
- Support for 3×3, 4×4, and 5×5 grids

### 🏆 Leagues
- Create or join leagues with friends
- Track wins and stats across multiple games
- Beautiful podium-style leaderboards
- League-specific rankings

### 🪙 Rewards & Economy
- Earn coins through achievements:
  - **First Bingo** (100 🪙)
  - **Speed Demon** (50 🪙) - Complete in under 5 minutes
  - **Full House** (200 🪙) - Mark all squares
  - And many more!
- Spend coins in the cosmetics shop

### 👤 Avatar Customization
- Unlock frames, backgrounds, badges, and effects
- Express yourself with rare and legendary cosmetics
- Track your collection progress

### 🌍 Community Bingos
- Browse user-created bingos
- **Fun Bingos**: Free, same squares for everyone
- **Competitive Bingos**: 
  - Paid with in-game coins
  - Randomized square distribution
  - Creator marks completed squares for all players
  - Creators earn 70% of purchase price!

### 🛒 Marketplace (Coming Soon)
- Trade cosmetics with other players
- Creator payouts in real currency
- Premium subscriptions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Navigate to project directory
cd "Party Bingo App"

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── navigation/      # BottomNav, Header
│   └── avatar/          # Avatar display components
├── context/             # React Context providers
│   ├── AuthContext.jsx  # User authentication
│   ├── WalletContext.jsx # Coins & economy
│   └── GameContext.jsx  # Game state management
├── data/                # Mock data & constants
│   ├── rewards.js       # Achievement definitions
│   ├── cosmetics.js     # Shop items
│   ├── bingos.js        # Community bingo templates
│   └── leagues.js       # Sample league data
├── pages/               # Screen components
│   ├── auth/            # Welcome, Login, Signup
│   ├── home/            # Home, CreateRoom, JoinRoom
│   ├── gameplay/        # RoomLobby, Gameplay
│   ├── leagues/         # Leagues, LeagueDetail
│   ├── community/       # Community, BingoDetail, CreateBingo
│   ├── shop/            # Shop, Marketplace
│   └── profile/         # Profile, Rewards
└── App.jsx              # Main app with routing
```

## 🎨 Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Navigation
- **Lucide React** - Icons
- **LocalStorage** - Data persistence (mock backend)

## 🔮 Future Development

1. **Real-time Backend** - Firebase or Supabase for live multiplayer
2. **Push Notifications** - Game invites and reminders
3. **Payment Integration** - For marketplace transactions
4. **Mobile Apps** - React Native versions

## 📝 License

MIT License - feel free to use for personal or commercial projects.
