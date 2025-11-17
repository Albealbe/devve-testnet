/**
 * Vercel Serverless Function to proxy account confirmation requests to Devvio.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const apiKey = process.env.DEVVIO_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'API key is not configured on the server.' });
    }

    const { username, verifyCode } = req.body;
    const BASE_URL = "https://devve.testnet.devvio.com";

    const devvioPayload = {
        username,
        verifyCode,
        apikey: apiKey
    };

    try {
        const response = await fetch(`${BASE_URL}/auth/confirmSignUp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(devvioPayload)
        });

        const result = await response.json();
        res.status(response.status).json(result);

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
}
