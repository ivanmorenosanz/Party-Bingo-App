import { createContext, useContext, useState, useEffect } from 'react';
import { COMMUNITY_BINGOS } from '../data/bingos';

const BingoContext = createContext(null);

export function BingoProvider({ children }) {
    const [bingos, setBingos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize bingos from localStorage OR API
    useEffect(() => {
        const loadBingos = async () => {
            try {
                // Fetch from API first
                const response = await fetch('http://localhost:3001/api/bingos');
                if (response.ok) {
                    const apiBingos = await response.json();

                    // Get local custom bingos
                    const storedBingos = localStorage.getItem('party_bingos');
                    let customBingos = [];
                    if (storedBingos) {
                        const parsed = JSON.parse(storedBingos);
                        customBingos = parsed.filter(b => b.isCustom || (typeof b.id === 'string' && b.id.startsWith('custom_')));
                    }

                    // Merge: Custom bingos + API bingos
                    // Deduplicate by ID just in case
                    const apiIds = new Set(apiBingos.map(b => b.id));
                    const uniqueCustom = customBingos.filter(b => !apiIds.has(b.id));

                    const processedApiBingos = apiBingos.map(b => ({
                        ...b,
                        type: b.currency || b.type || 'fun', // Map currency to type
                        tags: b.tags ? (typeof b.tags === 'string' ? JSON.parse(b.tags) : b.tags) : ['Community'],
                        plays: b.plays || 0,
                        rating: b.rating || 5.0,
                        items: b.items || b.squares?.map(s => s.description) || [],
                        creator: b.creator || b.creator_id || 'Anonymous',
                        endsAt: b.ends_at || b.endsAt,
                        tradeable: true,
                    }));

                    setBingos([...uniqueCustom, ...processedApiBingos]);
                } else {
                    throw new Error('API failed');
                }
            } catch (err) {
                console.warn("Failed to fetch bingos from API, using fallback", err);

                // Fallback to localStorage / default
                const storedBingos = localStorage.getItem('party_bingos');
                if (storedBingos) {
                    try {
                        const parsed = JSON.parse(storedBingos);
                        setBingos(parsed);
                    } catch (e) {
                        setBingos(COMMUNITY_BINGOS);
                    }
                } else {
                    setBingos(COMMUNITY_BINGOS);
                }
            }
            setLoading(false);
        };

        loadBingos();
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
