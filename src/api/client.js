// API Client for Bingo Backend

const API_BASE_URL = 'http://localhost:3001/api';

// Get auth token from storage
function getToken() {
    return localStorage.getItem('bingo_token');
}

// Set auth token
export function setToken(token) {
    if (token) {
        localStorage.setItem('bingo_token', token);
    } else {
        localStorage.removeItem('bingo_token');
    }
}

// Generic fetch wrapper with auth
async function fetchAPI(endpoint, options = {}) {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        // If it's a network error, we might be offline
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.warn('API unavailable, using offline mode');
            throw new Error('OFFLINE');
        }
        throw error;
    }
}

// User API
export const userAPI = {
    async signup(username, email, password) {
        const data = await fetchAPI('/users/signup', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
        setToken(data.token);
        return data.user;
    },

    async login(email, password) {
        const data = await fetchAPI('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        return data.user;
    },

    async loginAsGuest() {
        const data = await fetchAPI('/users/guest', {
            method: 'POST',
        });
        setToken(data.token);
        return data.user;
    },

    async getSession() {
        const data = await fetchAPI('/users/session');
        return data.user;
    },

    async updateUser(userId, updates) {
        const data = await fetchAPI(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return data.user;
    },

    async logout() {
        try {
            await fetchAPI('/users/logout', { method: 'POST' });
        } catch (e) {
            // Ignore errors on logout
        }
        setToken(null);
    },
};

// Wallet API
export const walletAPI = {
    async getWallet(userId) {
        return fetchAPI(`/wallets/${userId}`);
    },

    async earnCoins(userId, amount, reason) {
        return fetchAPI(`/wallets/${userId}/earn`, {
            method: 'POST',
            body: JSON.stringify({ amount, reason }),
        });
    },

    async spendCoins(userId, amount, reason) {
        return fetchAPI(`/wallets/${userId}/spend`, {
            method: 'POST',
            body: JSON.stringify({ amount, reason }),
        });
    },
};

// Health check
export async function checkAPIHealth() {
    try {
        await fetchAPI('/health');
        return true;
    } catch {
        return false;
    }
}
