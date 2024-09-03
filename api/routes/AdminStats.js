const express = require('express');
const router = express.Router();

// Import models
const User = require('../models/User');
const Payment = require('../models/Payments'); // Corrected model name
const Hairs = require('../models/Hairs');

// Middleware
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// Get all users, orders and payments, shop items length
router.get('/', async (req, res) => {
    try {
        const users = await User.countDocuments();
        const hairs = await Hairs.countDocuments();
        const orders = await Payment.countDocuments(); // Corrected model name

        const result = await Payment.aggregate([  // Corrected model name
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$price' }
                }
            }
        ]);

        const revenue = result.length > 0 ? result[0].totalRevenue : 0;

        // Log the values before sending the response
        // console.log({ users, hairItems, orders, revenue });

        res.status(200).json({
            users,
            hairs,
            orders,
            revenue
        });

    } catch (error) {
        console.error("Error fetching summary data:", error);
        res.status(500).send("Internal Server Error: " + error.message);
    }
});


module.exports = router;
