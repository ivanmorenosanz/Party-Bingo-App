import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb } from './db.js';
import usersRouter from './routes/users.js';
import walletsRouter from './routes/wallets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/wallets', walletsRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Serve static files in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Handle SPA routing - return index.html for all non-API routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
});


// Start server after DB init
async function start() {
    try {
        await initDb();
        console.log('📦 Database initialized');

        // Create HTTP server
        const { createServer } = await import('http');
        const httpServer = createServer(app);

        // Initialize Socket.IO
        const { initSocket } = await import('./socket.js');
        initSocket(httpServer);
        console.log('🔌 Socket.IO initialized');

        httpServer.listen(PORT, () => {
            console.log(`🎲 Bingo API Server running on http://localhost:${PORT}`);
            console.log(`   Database: ${path.join(__dirname, 'bingo.db')}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
