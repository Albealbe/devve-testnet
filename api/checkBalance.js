/**
 * Vercel Serverless Function to proxy wallet balance requests to Devvio.
 * This requires the user's access token (Bearer token).
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // --- Authentication ---
    // Get the access token from the 'Authorization' header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }

    // Get the API key from environment variables
    const apiKey = process.env.DEVVIO_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'API key is not configured on the server.' });
    }

    const { coinIds } = req.body;
    const BASE_URL = "https://devve.testnet.devvio.com";

    const devvioPayload = {
        coinIds: coinIds,
        apikey: apiKey
    };

    try {
        const response = await fetch(`${BASE_URL}/core/wallet/balances`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}` // Pass the user's token to Devvio
            },
            body: JSON.stringify(devvioPayload)
        });

        const result = await response.json();
        res.status(response.status).json(result);

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
}
