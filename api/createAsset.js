/**
 * Vercel Serverless Function to proxy asset creation requests to Devvio.
 * This requires the user's access token (Bearer token).
 * It also securely generates the required checksum on the server.
 */
import { createHash } from 'crypto';

/**
 * Generate required checksum for transactions
 * coin_id + api_key + amount + client_id
 */
function generateChecksum(coinId, apiKey, amount, clientId) {
    const combined = String(coinId) + String(apiKey) + String(amount) + String(clientId);
    return createHash('sha256').update(combined).digest('hex');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // --- Authentication ---
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }

    const apiKey = process.env.DEVVIO_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'API key is not configured on the server.' });
    }

    const { coinId, amount, clientId } = req.body;
    const BASE_URL = "https://devve.testnet.devvio.com";

    // --- Checksum Generation ---
    // This is securely generated on the server, using the API key
    // that the client/browser never sees.
    const checksum = generateChecksum(coinId, apiKey, amount, clientId);

    const devvioPayload = {
        coinId,
        amount,
        clientId,
        checksum, // Add the generated checksum
        apikey: apiKey
    };

    try {
        const response = await fetch(`${BASE_URL}/core/asset/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}` // Pass the user's token
            },
            body: JSON.stringify(devvioPayload)
        });

        const result = await response.json();
        res.status(response.status).json(result);

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
}
