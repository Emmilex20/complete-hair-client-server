const express = require('express');
const router = express.Router();

const cartController = require('../controllers/usercontrollers');
const verifyToken = require('../middleware/verifyToken');
const authorizeUser = require('../middleware/authorizeUser');

// Protect the route to ensure only the owner can access their cart
router.get('/', verifyToken, authorizeUser, cartController.getCartByEmail);

// No changes needed for routes that don't involve user-specific data
router.post('/', cartController.addToCart);
router.delete('/:id', cartController.deleteCart);
router.put('/:id', cartController.updateCart);
router.get('/:id', cartController.getSingleCart);

module.exports = router;
