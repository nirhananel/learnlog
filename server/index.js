const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// שימוש ב-JSON Body Parser
app.use(express.json());
app.use(cors());

// מערך זמני (כמו דאטה מדומה)
const learnedItems = [
  { id: 1, topic: 'JavaScript', content: 'Learned about arrow functions' },
  { id: 2, topic: 'AI', content: 'Prompt engineering basics' }
];

// route ראשון – מחזיר את רשימת הלמידות
app.get('/learned', (req, res) => {
  res.json(learnedItems);
});

// POST - הוספת למידה חדשה
app.post('/learned', (req, res) => {
  const { topic, content } = req.body;

  if (!topic || !content) {
    return res.status(400).json({ error: 'Topic and content are required' });
  }

  const newItem = {
    id: Date.now(), // ID פשוט לפי זמן
    topic,
    content,
  };

  learnedItems.push(newItem); // שמירה במערך

  res.status(201).json(newItem);
});


// הרצת השרת
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
