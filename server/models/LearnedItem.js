// Import mongoose to define schema and model
const mongoose = require('mongoose');

// Define the structure of a "learned item" document
const LearnedItemSchema = new mongoose.Schema({
  topic: {
    type: String,       // Topic of the learning (e.g., "React", "CSS")
    required: true      // This field is mandatory
  },
  content: {
    type: String,       // Description of what you learned
    required: true
  },
  createdAt: {
    type: Date,         // When the entry was created
    default: Date.now   // Set to current date/time by default
  }
});

// Create a model based on the schema
const LearnedItem = mongoose.model('LearnedItem', LearnedItemSchema);

// Export the model so we can use it in routes
module.exports = LearnedItem;
