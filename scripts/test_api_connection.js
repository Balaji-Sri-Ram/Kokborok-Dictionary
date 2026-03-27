
import fs from 'fs';
import path from 'path';

// Manual .env.local parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error("Error: .env.local file not found!");
            process.exit(1);
        }
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.trim();
            }
        });
        return env;
    } catch (e) {
        console.error("Error loading .env.local:", e);
        return {};
    }
}

async function testConnection() {
    console.log("Starting API Diagnostics (List Models)...");
    const env = loadEnv();
    const apiKey = env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Error: VITE_GEMINI_API_KEY not found");
        process.exit(1);
    }

    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log(`Querying: ${listUrl.replace(apiKey, '...')}`);

    try {
        const fetch = (await import('node-fetch')).default || global.fetch;
        if (!fetch) { console.error("No fetch available"); return; }

        const response = await fetch(listUrl);

        if (response.ok) {
            const data = await response.json();
            console.log("SUCCESS! Available Models:");
            if (data.models) {
                const names = data.models.map(m => m.name);
                console.log(names.join('\n'));

                const flash = names.find(n => n.includes('flash'));
                if (flash) console.log(`\nRecommended Flash Model: ${flash}`);
            } else {
                console.log("No models returned.");
            }
        } else {
            console.error(`List Models FAILED: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log("Error Body:", text);
        }
    } catch (e) {
        console.error("Request Failed:", e);
    }
}

testConnection();
