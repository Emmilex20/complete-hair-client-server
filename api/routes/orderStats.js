const express = require('express');
const router = express.Router();
const Payment = require('../models/Payments');

// Get all orders stats
router.get('/', async (req, res) => {
    try {
        const result = await Payment.aggregate([
            { $unwind: '$cartItems' }, // Check that `cartItems` exists in Payment schema
            {
                $lookup: {
                    from: 'hairs', // Ensure this matches your collection name in MongoDB
                    localField: 'cartItems', // Adjust this to point to the correct field in `cartItems`
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
                    quantity: { $sum: '$cartItems.quantity' }, // Ensure cartItems has a quantity field
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

        // Log the result to check if the aggregation returns correct data
        console.log("Order Stats Result:", result);

        res.json(result);
    } catch (error) {
        console.error("Error in /orderStats:", error.message);
        res.status(500).send("Internal Server Error: " + error.message);
    }
});

module.exports = router;
