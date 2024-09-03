const User = require("../models/User");
const Carts = require('../models/Carts');

// Controller to get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to create a new user
const createUser = async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  try {
    const existingUser = await User.findOne(query);
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const result = await User.create(user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to delete a user
const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    // If user not found
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get Admin users
const getAdmin = async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  try {
    const user = await User.findOne(query);
    // console.log(user);
    if (email !== req.decoded.email) {
      return res
        .status(403)
        .send({ message: "Not authorized to access this user" });
    }
    let admin = false;
    if (user.role === "admin") {
      admin = true;
    }
    res.status(200).json({ admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// make admin user
const makeAdmin = async (req, res) => {
  const userId = req.params.id;
  console.log(`Making user admin with ID: ${userId}`); // Log user ID for debugging

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getCartByEmail = async (req, res) => {
  const email = req.query.email; // Assuming email is passed as a query parameter
  try {
      const cartItems = await Carts.find({ email });
      res.status(200).json(cartItems);
  } catch (error) {
      res.status(500).json({ message: "Failed to retrieve cart items" });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  const { email, productId, quantity } = req.body;
  try {
      const newCartItem = new Carts({ email, productId, quantity });
      await newCartItem.save();
      res.status(201).json(newCartItem);
  } catch (error) {
      res.status(500).json({ message: "Failed to add item to cart" });
  }
};

// Delete item from cart by ID (Protected)
exports.deleteCart = async (req, res) => {
  const { id } = req.params;
  try {
      await Carts.findByIdAndDelete(id);
      res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Failed to delete cart item" });
  }
};

// Update cart item by ID (Protected)
exports.updateCart = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
      const updatedCartItem = await Carts.findByIdAndUpdate(id, { quantity }, { new: true });
      res.status(200).json(updatedCartItem);
  } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
  }
};

// Get single cart item by ID (Protected)
exports.getSingleCart = async (req, res) => {
  const { id } = req.params;
  try {
      const cartItem = await Carts.findById(id);
      res.status(200).json(cartItem);
  } catch (error) {
      res.status(500).json({ message: "Failed to retrieve cart item" });
  }
};

module.exports = { getAllUsers, createUser, deleteUser, getAdmin, makeAdmin };
