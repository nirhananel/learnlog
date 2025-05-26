const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const LearnedItem = require('./models/LearnedItem'); // our mongoose model

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// POST /learned - save a new learned item
app.post('/learned', async (req, res) => {
  try {
    const { topic, content } = req.body;

    // Simple validation
    if (!topic || !content) {
      return res.status(400).json({ error: 'Topic and content are required' });
    }

    // Create and save to DB
    const newItem = new LearnedItem({ topic, content });
    await newItem.save();

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error saving item:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /learned - return all learned items sorted by date (newest first)
app.get('/learned', async (req, res) => {
  try {
    const items = await LearnedItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});
// DELETE /learned/:id - delete a learning item by ID
app.delete('/learned/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LearnedItem.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
