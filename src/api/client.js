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
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        if (!response.ok) {
            if (isJson) {
                const errData = await response.json();
                throw new Error(errData.error || 'API request failed');
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        if (isJson) {
            return await response.json();
        }

        // Handle empty or text response
        const text = await response.text();
        if (!text) return {};
        try {
            return JSON.parse(text);
        } catch {
            // Fallback for non-json success response?
            throw new Error('Invalid JSON response');
        }
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

    async getUser(userId) {
        const data = await fetchAPI(`/users/${userId}`);
        return data.user;
    },

    async searchUsers(query) {
        const data = await fetchAPI(`/users/search?q=${encodeURIComponent(query)}`);
        return data.users;
    },
};

// Trade API
export const tradeAPI = {
    async getTrades(userId) {
        return fetchAPI(`/trades/user/${userId}`);
    },

    async placeTrade(userId, squareId, direction, amount) {
        return fetchAPI('/trades', {
            method: 'POST',
            body: JSON.stringify({ userId, squareId, direction, amount }),
        });
    },
};

// Bingo API
export const bingoAPI = {
    async getBingos() {
        return fetchAPI('/bingos');
    },

    async getBingo(id) {
        return fetchAPI(`/bingos/${id}`);
    },

    async createBingo(bingoData) {
        return fetchAPI('/bingos', {
            method: 'POST',
            body: JSON.stringify(bingoData),
        });
    },
};

// Markets API (LMSR Trading)
export const marketsAPI = {
    async getMarkets(bingoId) {
        return fetchAPI(`/markets/${bingoId}`);
    },

    async getPrice(squareId, direction = 'YES', shares = 1) {
        return fetchAPI(`/markets/${squareId}/price?direction=${direction}&shares=${shares}`);
    },

    async trade(squareId, userId, direction, shares) {
        return fetchAPI(`/markets/${squareId}/trade`, {
            method: 'POST',
            body: JSON.stringify({ userId, direction, shares }),
        });
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

// Bingos API
export const bingosAPI = {
    async getBingos() {
        return await fetchAPI('/bingos');
    },

    async getBingo(id) {
        return await fetchAPI(`/bingos/${id}`);
    },

    async createBingo(bingoData) {
        return await fetchAPI('/bingos', {
            method: 'POST',
            body: JSON.stringify(bingoData),
        });
    },
};
