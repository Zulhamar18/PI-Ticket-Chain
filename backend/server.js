const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Server API Key (Ganti dengan kunci API Anda)
const SERVER_API_KEY = 'YOUR_SERVER_API_KEY';

// Route default untuk root
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

// Endpoint untuk membuat pembayaran
app.post('/payments', async (req, res) => {
    try {
        const { amount, memo, metadata, uid } = req.body;

        // Validasi input
        if (!amount || !memo || !metadata || !uid) {
            return res.status(400).json({ error: 'Missing required fields: amount, memo, metadata, or uid' });
        }

        // Kirim permintaan pembayaran ke Pi Network API
        const response = await axios.post('https://api.minepi.com/v2/payments', {
            payment: {
                amount,
                memo,
                metadata,
                uid
            }
        }, {
            headers: { 'Authorization': `Key ${SERVER_API_KEY}` }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Payment creation failed:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// Endpoint untuk memverifikasi status iklan
app.get('/ads/status/:adId', async (req, res) => {
    try {
        const { adId } = req.params;

        // Verifikasi status iklan menggunakan Pi Network API
        const response = await axios.get(`https://api.minepi.com/v2/ads_network/status/${adId}`, {
            headers: { 'Authorization': `Key ${SERVER_API_KEY}` }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Ad verification failed:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to verify ad status' });
    }
});

// Endpoint untuk mendapatkan data pengguna (/me)
app.get('/me', async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1]; // Ambil token dari header Authorization

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token is missing' });
        }

        // Verifikasi token dengan Pi Network API
        const meResponse = await axios.get('https://api.minepi.com/v2/me', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        res.status(200).json(meResponse.data);
    } catch (error) {
        console.error('User verification failed:', error.response ? error.response.data : error.message);
        res.status(401).json({ error: 'Invalid access token' });
    }
});

// Penanganan kesalahan global
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.message);
    res.status(500).json({ error: 'Something went wrong on the server' });
});

// Logging permintaan
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});