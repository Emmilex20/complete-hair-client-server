const express = require('express');
const router = express.Router();

// Import models
const Payment = require('../models/Payments'); // Corrected model name
const Hairs = require('../models/Hairs');

// Middleware
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// Get all orders stats
router.get('/', async (req, res) => {
    try {
        const result = await Payment.aggregate([
            // Step 1: Unwind and join collections
            { $unwind: '$cartItems' },
            {
                $lookup: {
                    from: 'Kachi-Store.hairs',
                    localField: 'cartItems',
                    foreignField: '_id',
                    as: 'hairDetails'
                }
            },
            { $unwind: { path: '$hairDetails', preserveNullAndEmptyArrays: true } },
        
            // Step 2: Group by date and aggregate quantities and revenue
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    quantity: { $sum: '$quantity' },
                    revenue: { $sum: '$price' }
                }
            },
        
            // Step 3: Sort by date
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        
            // Step 4: Project the final output
            {
                $project: {
                    _id: 0,
                    date: {
                        year: '$_id.year',
                        month: '$_id.month',
                        day: '$_id.day'
                    },
                    quantity: '$quantity',
                    revenue: '$revenue'
                }
            }
        ]);
        
        res.json(result);
    } catch (error) {
        // console.error("Error during aggregation:", error.message);
        res.status(500).send("Internal Server Error: " + error.message);
    }
});


module.exports = router;