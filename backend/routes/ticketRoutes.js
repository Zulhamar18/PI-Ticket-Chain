const express = require("express");
const router = express.Router();

// Dummy data untuk tiket
const tickets = [
  { id: 1, name: "Ticket A", price: 100 },
  { id: 2, name: "Ticket B", price: 150 }
];

// GET all tickets
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ success: true, data: tickets });
});

module.exports = router;

