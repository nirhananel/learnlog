const mongoose = require('mongoose');

const learnedItemSchema = new mongoose.Schema({
  topic: {
    type: [String],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  importance: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LearnedItem', learnedItemSchema);
