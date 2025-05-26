import React, { useEffect, useState } from 'react';

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);

  // State for all learned items
  const [items, setItems] = useState([]);

    // State for form inputs
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');

  // Fetch learned items from the server
 useEffect(() => {
  fetch('http://localhost:3001/learned')
    .then(res => res.json())
    .then(data => {
      setItems(data);
      setIsLoading(false); // Stop loading when data arrives
    })
    .catch(err => {
      console.error('Failed to fetch:', err);
      setIsLoading(false);
    });
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
      <form
  onSubmit={handleSubmit}
  className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-200"
>
  <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Something You Learned</h2>

  <input
    type="text"
    placeholder="Topic"
    value={topic}
    onChange={(e) => setTopic(e.target.value)}
    className="w-full p-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  <textarea
    placeholder="What did you learn?"
    value={content}
    onChange={(e) => setContent(e.target.value)}
    className="w-full p-2 mb-4 border border-gray-300 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  <button
    type="submit"
    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
  >
    Save
  </button>
</form>
{isLoading && (
  <div className="text-center py-10 text-blue-500 text-lg animate-pulse">
    Loading your learning log...
  </div>
)}


      {Object.keys(groupedByTopic).length === 0 ? (
  <p className="text-gray-500 text-center">No items found yet.</p>
) : (
  Object.keys(groupedByTopic).map(topic => (
    <div key={topic} className="mb-8">
      <h3 className="text-lg font-semibold text-blue-700 mb-2 border-b pb-1">{topic}</h3>
      <ul className="space-y-1">
        {groupedByTopic[topic].map((item, index) => (
          <li key={index} className="text-gray-800 text-sm">
            {item.content}
            <span className="text-gray-400 text-xs ml-2">
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