const mongoose = require("mongoose");

const hairSchema = new mongoose.Schema({
  title: String,
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Add other fields as needed
});

const Hairs = mongoose.model("Hairs", hairSchema);

module.exports = Hairs;
