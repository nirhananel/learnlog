const mongoose = require('mongoose');

const learnedItemSchema = new mongoose.Schema({
  topic: {
    type: [String], // Array of strings to allow multiple tags
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LearnedItem', learnedItemSchema);
