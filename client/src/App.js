import React, { useEffect, useState } from 'react';

// Main App Component
function App() {
  // State for all learned items
  const [items, setItems] = useState([]);

    // State for form inputs
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');

  // Fetch learned items from the server
  useEffect(() => {
    fetch('http://localhost:3001/learned')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Failed to fetch:', err));
  }, []);


  // Group items by topic
  const groupedByTopic = items.reduce((groups, item) => {
    if (!groups[item.topic]) {
      groups[item.topic] = [];
    }
    groups[item.topic].push(item);
    return groups;
  }, {});

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    if (!topic || !content) {
      alert('Both topic and content are required!');
      return;
    }

    const newItem = { topic, content };

    try {
      const res = await fetch('http://localhost:3001/learned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      const savedItem = await res.json();

      // Add new item to the state
      setItems([savedItem, ...items]);

      // Clear the form
      setTopic('');
      setContent('');
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>📚 What I Learned</h1>

      {/* Form to add new learned item */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
        />
        <textarea
          placeholder="What did you learn?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', height: '100px' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', marginTop: '0.5rem' }}>
          Add Learning
        </button>
      </form>

      {/* Grouped display of learned items */}
      {Object.keys(groupedByTopic).length === 0 ? (
        <p>No items found yet.</p>
      ) : (
        Object.keys(groupedByTopic).map(topic => (
          <div key={topic} style={{ marginBottom: '2rem' }}>
            <h2>{topic}</h2>
            <ul>
              {groupedByTopic[topic].map((item, index) => (
                <li key={index}>
                  {item.content}{' '}
                  <span style={{ color: 'gray' }}>
                    ({new Date(item.createdAt).toLocaleString()})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default App;