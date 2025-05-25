import React, { useEffect, useState } from 'react';

// Main App Component
function App() {
  // State for all learned items
  const [items, setItems] = useState([]);

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

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📚 What I Learned</h1>
      {Object.keys(groupedByTopic).length === 0 ? (
        <p>No items found yet.</p>
      ) : (
        Object.keys(groupedByTopic).map(topic => (
          <div key={topic} style={{ marginBottom: '2rem' }}>
            <h2>{topic}</h2>
            <ul>
              {groupedByTopic[topic].map((item, index) => (
                <li key={index}>
                  {item.content} <span style={{ color: 'gray' }}>({new Date(item.createdAt).toLocaleString()})</span>
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
