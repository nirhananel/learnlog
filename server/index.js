const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const LearnedItem = require('./models/LearnedItem');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors());
app.use(bodyParser.json());

// GET all learned items
app.get('/learned', async (req, res) => {
  try {
    const items = await LearnedItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new learned item
app.post('/learned', async (req, res) => {
  const { topic, content } = req.body;

  if (!Array.isArray(topic) || topic.length === 0 || !content) {
    return res.status(400).json({ error: 'Topic must be an array and content is required' });
  }

  try {
    const newItem = new LearnedItem({ topic, content });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// ✅ DELETE learned item by ID
app.delete('/learned/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await LearnedItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
