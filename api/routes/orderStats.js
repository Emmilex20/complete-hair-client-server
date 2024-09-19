const express = require('express');
const router = express.Router();
const Payment = require('../models/Payments'); // Adjust according to your structure

// Get all orders stats
router.get('/', async (req, res) => {
    try {
        const result = await Payment.aggregate([
            { $unwind: '$cartItems' },
            {
                $lookup: {
                    from: 'hairs', // Ensure this matches your collection name
                    localField: 'cartItems',
                    foreignField: '_id',
                    as: 'hairDetails'
                }
            },
            { $unwind: { path: '$hairDetails', preserveNullAndEmptyArrays: true } },
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
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            },
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
        res.status(500).send("Internal Server Error: " + error.message);
    }
});

module.exports = router;
