const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { PiBackend } = require('pi-backend');

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

const pi = new PiBackend({
  appId: process.env.PI_APP_ID,
  appSecret: process.env.PI_APP_SECRET
});

app.get('/', (req, res) => {
  res.send('Welcome to the PI-Ticket-Chain backend!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});