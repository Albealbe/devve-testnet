/**
 * Vercel Serverless Function to proxy registration requests to Devvio.
 * This reads the API key from Environment Variables.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Read the API key from Vercel's Environment Variables
    const apiKey = process.env.DEVVIO_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'API key is not configured on the server.' });
    }

    const { username, password, fullName, email } = req.body;
    const BASE_URL = "https://devve.testnet.devvio.com";

    // Re-create the payload, adding the secure API key
    const devvioPayload = {
        username,
        password,
        fullName,
        email,
        apikey: apiKey
    };

    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(devvioPayload)
        });
        
        // Forward the response (success or error) from Devvio back to the client
        const result = await response.json();
        res.status(response.status).json(result);

    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
}
