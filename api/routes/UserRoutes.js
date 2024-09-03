const express = require('express');
const router = express.Router();
const User = require("../models/User");
const UserController = require('../controllers/usercontrollers'); 
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// Define the route to get all users
router.get('/', verifyToken, verifyAdmin, UserController.getAllUsers);
router.post('/', UserController.createUser); // Make sure this path is correct
router.delete('/:id', verifyToken, verifyAdmin, UserController.deleteUser); 
router.get('/admin/:email', verifyToken, UserController.getAdmin);
router.patch('/admin/:id', verifyToken, verifyAdmin, UserController.makeAdmin); 



module.exports = router;

