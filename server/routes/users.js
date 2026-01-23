import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb, parseUserRow, getFirst, getAll } from '../db.js';

const router = express.Router();

// Simple password hashing (in production, use bcrypt)
function hashPassword(password) {
    return Buffer.from(password).toString('base64');
}

function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

// Generate session token
function generateToken() {
    return uuidv4() + '-' + Date.now().toString(36);
}

// POST /api/users/signup
router.post('/signup', (req, res) => {
    try {
        const db = getDb();
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user exists
        const existing = getFirst(db.exec('SELECT * FROM users WHERE email = ?', [email]));
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const existingUsername = getFirst(db.exec('SELECT * FROM users WHERE username = ?', [username]));
        if (existingUsername) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        const userId = uuidv4();
        const now = new Date().toISOString();

        // Create user
        db.run(`INSERT INTO users (id, username, email, password_hash, avatar, owned_cosmetics, rewards, stats, leagues, is_guest, is_verified, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            userId,
            username,
            email,
            hashPassword(password),
            JSON.stringify({ character: 'warrior', frame: 'default', background: 'purple', badge: null, effect: null }),
            JSON.stringify(['default', 'purple', 'warrior', 'mage']),
            JSON.stringify([]),
            JSON.stringify({ gamesPlayed: 0, gamesWon: 0, totalBingos: 0, currentStreak: 0, bestStreak: 0 }),
            JSON.stringify([]),
            0,
            1,
            now
        ]);

        // Create wallet
        db.run('INSERT INTO wallets (user_id, coins) VALUES (?, ?)', [userId, 100]);

        // Create session
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        db.run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [token, userId, expiresAt]);

        saveDb();

        const userRow = getFirst(db.exec('SELECT * FROM users WHERE id = ?', [userId]));
        const user = parseUserRow(userRow);

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// POST /api/users/login
router.post('/login', (req, res) => {
    try {
        const db = getDb();
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const row = getFirst(db.exec('SELECT * FROM users WHERE email = ?', [email]));
        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!verifyPassword(password, row.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create session
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        db.run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [token, row.id, expiresAt]);
        saveDb();

        const user = parseUserRow(row);

        res.json({ user, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// POST /api/users/guest
router.post('/guest', (req, res) => {
    try {
        const db = getDb();
        const userId = `guest_${Date.now()}`;
        const username = `Guest_${Math.floor(Math.random() * 9999)}`;
        const now = new Date().toISOString();

        db.run(`INSERT INTO users (id, username, email, password_hash, avatar, owned_cosmetics, rewards, stats, leagues, is_guest, is_verified, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            userId,
            username,
            null,
            null,
            JSON.stringify({ character: 'warrior', frame: 'default', background: 'purple', badge: null, effect: null }),
            JSON.stringify(['default', 'warrior']),
            JSON.stringify([]),
            JSON.stringify({ gamesPlayed: 0, gamesWon: 0, totalBingos: 0, currentStreak: 0, bestStreak: 0 }),
            JSON.stringify([]),
            1,
            0,
            now
        ]);

        // Create wallet
        db.run('INSERT INTO wallets (user_id, coins) VALUES (?, ?)', [userId, 100]);

        // Create session
        const token = generateToken();
        db.run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', [token, userId, null]);
        saveDb();

        const userRow = getFirst(db.exec('SELECT * FROM users WHERE id = ?', [userId]));
        const user = parseUserRow(userRow);

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Guest login error:', error);
        res.status(500).json({ error: 'Failed to create guest user' });
    }
});

// GET /api/users/session
router.get('/session', (req, res) => {
    try {
        const db = getDb();
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const session = getFirst(db.exec('SELECT * FROM sessions WHERE token = ?', [token]));
        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        // Check expiry
        if (session.expires_at && new Date(session.expires_at) < new Date()) {
            return res.status(401).json({ error: 'Session expired' });
        }

        const userRow = getFirst(db.exec('SELECT * FROM users WHERE id = ?', [session.user_id]));
        if (!userRow) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = parseUserRow(userRow);
        res.json({ user });
    } catch (error) {
        console.error('Session error:', error);
        res.status(500).json({ error: 'Failed to validate session' });
    }
});

// GET /api/users/search?q=query
router.get('/search', (req, res) => {
    try {
        const db = getDb();
        const query = req.query.q;

        if (!query || query.trim().length < 2) {
            return res.json({ users: [] });
        }

        const searchTerm = `%${query.trim()}%`;

        // Search by username or exact ID match
        const users = getAll(db.exec(
            `SELECT * FROM users WHERE username LIKE ? OR id = ? LIMIT 10`,
            [searchTerm, query.trim()]
        ));

        res.json({
            users: users.map(u => parseUserRow(u))
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
    try {
        const db = getDb();
        const userRow = getFirst(db.exec('SELECT * FROM users WHERE id = ?', [req.params.id]));
        if (!userRow) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: parseUserRow(userRow) });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
    try {
        const db = getDb();
        const { avatar, ownedCosmetics, rewards, stats, leagues } = req.body;

        const updates = [];
        const values = [];

        if (avatar !== undefined) {
            updates.push('avatar = ?');
            values.push(JSON.stringify(avatar));
        }
        if (ownedCosmetics !== undefined) {
            updates.push('owned_cosmetics = ?');
            values.push(JSON.stringify(ownedCosmetics));
        }
        if (rewards !== undefined) {
            updates.push('rewards = ?');
            values.push(JSON.stringify(rewards));
        }
        if (stats !== undefined) {
            updates.push('stats = ?');
            values.push(JSON.stringify(stats));
        }
        if (leagues !== undefined) {
            updates.push('leagues = ?');
            values.push(JSON.stringify(leagues));
        }

        if (updates.length > 0) {
            values.push(req.params.id);
            db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
            saveDb();
        }

        const userRow = getFirst(db.exec('SELECT * FROM users WHERE id = ?', [req.params.id]));
        res.json({ user: parseUserRow(userRow) });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// POST /api/users/logout
router.post('/logout', (req, res) => {
    try {
        const db = getDb();
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            db.run('DELETE FROM sessions WHERE token = ?', [token]);
            saveDb();
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Failed to logout' });
    }
});

export default router;
