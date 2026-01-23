// import fetch from 'node-fetch'; // Built-in in Node 18+

const API_URL = 'http://localhost:3001/api';
const CREATOR_ID = 'user_6'; // TVFanatic

async function seed() {
    console.log('🌱 Starting Seed...');

    try {
        // 1. Create Reality TV Predictions if not exists (or create clean one)
        // Since we don't have an endpoint to check by title easily without searching, 
        // and we want 'tv_show_bets' as ID if possible but API generates UUID.
        // Actually, we can just create a new one.
        // Wait, the user prompt said "close Reality TV Predictions". 
        // If it's in the frontend hardcoded list but not in DB, we should create it.
        // The previous verify showed "Bingo not found" for 'tv_show_bets' GET.
        // So we will create it. 
        // HOWEVER, our POST /bingos generates a UUID.
        // To force 'tv_show_bets', we might need to insert directly to DB or rely on the fact that
        // the frontend might link to it via hardcoded ID?
        // Let's check src/data/bingos.js again. The frontend mocks use 'tv_show_bets'.
        // If the frontend tries to load it from API, it might fail if ID doesn't match.
        // But the frontend usually loads from API list.
        // IF we want to test the specific ID 'tv_show_bets', we should manually insert to DB or allow API to accept ID.
        // Our API code: const bingoId = uuidv4(); ...
        // So we can't force ID via API.
        // We will insert 'tv_show_bets' directly via DB to ensure frontend compat if it hardcodes links.
        // Actually, let's just use the API and the user will see a "New" Reality TV bingo.
        // BUT the user request specifically mentioned "Reality TV Predictions" which is in the mock data.
        // To be safe and clean, let's use the DB direct approach for the specific ID to match mock data.
        // We can import DB functions here since it's a script.

    } catch (e) {
        // Fallback to API if imports fail (module issues)
        console.log('⚠️  DB Import might fail if not "type: module" or path issues. Using API.');
    }

    // Let's construct the bingos via API first for the new ones.
    // For 'tv_show_bets', let's try to do a direct DB insert using the same pattern as verify_backend.js
    // Re-using the import from verify_backend.js pattern.
}

// Actual implementation
import { initDb, getDb, saveDb } from '../server/db.js';
import { v4 as uuidv4 } from 'uuid';

async function run() {
    await initDb();
    const db = getDb();

    // 1. Seed 'Reality TV Predictions' with specific ID 'tv_show_bets'
    console.log('📺 Seeding Reality TV Predictions (tv_show_bets)...');

    // Check if exists
    const existing = db.exec("SELECT * FROM bingos WHERE id = 'tv_show_bets'");
    if (existing.length > 0 && existing[0].values.length > 0) {
        console.log('   Bingo already exists. resolving...');
    } else {
        db.run(`INSERT INTO bingos (id, title, category, creator_id, status) VALUES (?, ?, ?, ?, ?)`,
            ['tv_show_bets', 'Reality TV Predictions', 'entertainment', 'user_6', 'open']);

        const items = [
            'Someone cries', 'Dramatic exit', 'Plot twist reveal',
            'Villain moment', 'Love confession', 'Elimination shocker',
            'Backstabbing move', 'Underdog wins', 'Cliffhanger ending'
        ];

        items.forEach((item, i) => {
            db.run(`INSERT INTO bingo_squares (id, bingo_id, description, position, status) 
                    VALUES (?, ?, ?, ?, ?)`,
                [`tv_show_sq_${i}`, 'tv_show_bets', item, i, 'open']);
        });
        console.log('   Created.');
    }

    // 2. Resolve "Reality TV Predictions" as ALL YES
    console.log('⚖️  Resolving Reality TV Predictions...');
    // We can use our new API for this to test it!
    const res = await fetch(`${API_URL}/bingos/tv_show_bets/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            outcomeResults: [true, true, true, true, true, true, true, true, true]
        })
    });
    const json = await res.json();
    console.log('   Result:', json);

    // 3. Create New Coin Bingos
    console.log('🆕 Creating New Coin Bingos...');

    // Bingo 1: Tech Trends 2026
    const techBingo = {
        title: 'Tech Trends 2026',
        category: 'technology',
        creatorId: 'tech_guru',
        squares: [
            { description: 'Apple VR 2 announced', initialProbability: 0.3 },
            { description: 'AI passes Turing test', initialProbability: 0.6 },
            { description: 'SpaceX Mars landing', initialProbability: 0.1 },
            { description: 'Bitcoin hits 200k', initialProbability: 0.4 },
            { description: 'New coding language', initialProbability: 0.2 },
            { description: 'Quantum leap', initialProbability: 0.1 },
            { description: 'Robot butler demo', initialProbability: 0.5 },
            { description: 'Neuralink human trial', initialProbability: 0.8 },
            { description: 'Flying car regulatory approval', initialProbability: 0.05 }
        ]
    };

    // Bingo 2: Celebrity Gossip
    const celebBingo = {
        title: 'Celebrity Gossip',
        category: 'entertainment',
        creatorId: 'gossip_girl',
        squares: [
            { description: 'Power couple breakup', initialProbability: 0.5 },
            { description: 'Royal scandal', initialProbability: 0.3 },
            { description: 'Surprise album drop', initialProbability: 0.7 },
            { description: 'Viral red carpet look', initialProbability: 0.9 },
            { description: 'Secret wedding', initialProbability: 0.4 },
            { description: 'Twitter beef', initialProbability: 0.8 },
            { description: 'Comeback tour', initialProbability: 0.6 },
            { description: 'Baby announcement', initialProbability: 0.5 },
            { description: 'Retirement rumors', initialProbability: 0.2 }
        ]
    };

    const createBingo = async (data) => {
        const r = await fetch(`${API_URL}/bingos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const j = await r.json();
        console.log(`   Created "${data.title}": ${j.id}`);
    };

    await createBingo(techBingo);
    await createBingo(celebBingo);

    console.log('🏁 Seed Complete');
    saveDb();
}

run().catch(console.error);
