// index.js
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const PI_API_KEY = process.env.PI_API_KEY;

console.log(`Server running on port ${PORT}`);
console.log(`Pi API Key: ${PI_API_KEY}`);