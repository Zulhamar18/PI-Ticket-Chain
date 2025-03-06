// Import dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { PiBackend } = require('pi-backend');

// Load environment variables from .env file
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Example of Pi Network Integration
const pi = new PiBackend({
  appId: process.env.PI_APP_ID, // Ensure you have this in your .env file
  appSecret: process.env.PI_APP_SECRET // Ensure you have this in your .env file
});

// Test route
app.get('/', (req, res) => {
  res.send('Welcome to the PI-Ticket-Chain backend!');
});

// Example route to interact with Pi Network (can be customized based on your use case)
app.get('/pi-network-data', async (req, res) => {
  try {
    const data = await pi.getData(); // Example function, adjust as needed
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Pi Network data' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
