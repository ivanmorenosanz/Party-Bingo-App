import { createContext, useContext, useState, useEffect } from 'react';
import { COMMUNITY_BINGOS } from '../data/bingos';

const BingoContext = createContext(null);

export function BingoProvider({ children }) {
    const [bingos, setBingos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize bingos from localStorage or default data
    useEffect(() => {
        const storedBingos = localStorage.getItem('party_bingos');
        if (storedBingos) {
            try {
                const parsed = JSON.parse(storedBingos);
                // Filter for custom bingos (created by user)
                // We identify them by `isCustom` flag or ID prefix for legacy support
                const customBingos = parsed.filter(b => b.isCustom || (typeof b.id === 'string' && b.id.startsWith('custom_')));

                // Merge: Custom bingos first, then fresh default bingos from code
                setBingos([...customBingos, ...COMMUNITY_BINGOS]);
            } catch (e) {
                console.error("Failed to parse bingos", e);
                setBingos(COMMUNITY_BINGOS);
            }
        } else {
            setBingos(COMMUNITY_BINGOS);
        }
        setLoading(false);
    }, []);

    // Persist to localStorage whenever state changes
    useEffect(() => {
        if (!loading && bingos.length > 0) {
            localStorage.setItem('party_bingos', JSON.stringify(bingos));
        }
    }, [bingos, loading]);

    const addBingo = (newBingo) => {
        const bingoWithMeta = {
            ...newBingo,
            id: newBingo.id || `custom_${Date.now()}`,
            createdAt: new Date().toISOString(),
            plays: 0,
            rating: 5.0, // Default rating for new bingos
            reviews: 0,
            isCustom: true
        };
        setBingos(prev => [bingoWithMeta, ...prev]);
        return bingoWithMeta;
    };

    const getBingoById = (id) => {
        return bingos.find(b => b.id === id);
    };

    const searchBingos = (query) => {
        const q = query.toLowerCase();
        return bingos.filter(b =>
            b.title.toLowerCase().includes(q) ||
            b.tags.some(t => t.toLowerCase().includes(q)) ||
            b.creator?.toLowerCase().includes(q)
        );
    };

    return (
        <BingoContext.Provider value={{
            bingos,
            addBingo,
            getBingoById,
            searchBingos,
            loading
        }}>
            {children}
        </BingoContext.Provider>
    );
}

export function useBingo() {
    const context = useContext(BingoContext);
    if (!context) {
        throw new Error('useBingo must be used within a BingoProvider');
    }
    return context;
}
