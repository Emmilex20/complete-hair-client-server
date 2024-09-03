const express = require('express');
const router = express.Router();
const Hairs = require('../models/Hairs'); // Adjust the path to your Hairs model

// Get all hair data
router.get('/all-hairs', async (req, res) => {
    let query = {};
    if (req.query.category) {
        query = { category: req.query.category };
    }

    try {
        const result = await Hairs.find(query).sort({ createdAt: -1 }).exec(); // Sort by createdAt in descending order
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ error: "Failed to fetch documents" });
    }
});

module.exports = router;
