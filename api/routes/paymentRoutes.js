const express = require("express");
const mongoose = require("mongoose");
const Payment = require("../models/Payments");
const router = express.Router();
const Cart = require("../models/Carts");
const ObjectId = mongoose.Types.ObjectId;

// Token verification middleware
const verifyToken = require("../middleware/verifyToken");

// Post payment info to the database
router.post("/", verifyToken, async (req, res) => {
  const payment = req.body;
  try {
    // Create payment in the database
    const paymentRequest = await Payment.create(payment);

    // Map cartItems to ObjectId and delete them from the Cart collection
    const cartIds = payment.cartItems.map((id) => new ObjectId(id));
    const deleteCartRequest = await Cart.deleteMany({ _id: { $in: cartIds } });

    // Return success response with payment and deletion details
    res.status(200).json({ paymentRequest, deleteCartRequest });
  } catch (error) {
    // Return error response if something goes wrong
    res.status(500).json({ message: error.message }); // Use 500 for server errors
  }
});

// Get payments for a specific user
router.get("/", verifyToken, async (req, res) => {
  const email = req.query.email;
  try {
    const decodedEmail = req.decoded.email;
    if (email !== decodedEmail) {
      return res.status(403).json({ message: "Forbidden Access" });
    }
    const result = await Payment.find({ email }).sort({ createdAt: -1 }).exec();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all payments (for admins)
router.get("/all", async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ createdAt: -1 }).exec();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm payment status
router.patch("/:id", async (req, res) => {
  const { id } = req.params; // Extract 'id' as a string
  try {
    const updatedStatus = await Payment.findByIdAndUpdate(
      id, // Use 'id' directly
      { status: "confirmed" }, // Update the status to 'confirmed'
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(updatedStatus); // Send the updated document as JSON
  } catch (error) {
    res.status(500).json({ message: error.message }); // Use 500 for server errors
  }
});

// Delete a payment by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params; // Extract 'id' from the URL params
  try {
    // Attempt to find and delete the payment by ID
    const deletedPayment = await Payment.findByIdAndDelete(id);

    if (!deletedPayment) {
      // If no payment is found with the provided ID, return a 404 status
      return res.status(404).json({ message: "Payment not found" });
    }

    // If deletion is successful, return the deleted payment data
    res.status(200).json({ message: "Payment deleted successfully", deletedPayment });
  } catch (error) {
    // If there's a server error, return a 500 status with the error message
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
