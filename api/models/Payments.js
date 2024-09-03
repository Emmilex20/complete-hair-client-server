const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema({
    transactionId: String,
    email: String,
    price: Number,
    quantity: Number,
    status: String,
    itemName: Array,
    cartItems: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Cart' // Assuming this references the Cart model
    }],
    category: { 
        type: String, // Adjust type according to your needs
        required: false // Set to true if this field is mandatory
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
