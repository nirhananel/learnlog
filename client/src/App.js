import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  // State hooks
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [customTags, setCustomTags] = useState([]);
  const [smartTags, setSmartTags] = useState([]);
  const [defaultTags, setDefaultTags] = useState(['React', 'AI', 'Personal', 'Books', 'Tech', 'Health']);
  const [groupedByTopic, setGroupedByTopic] = useState({});
  const [importance, setImportance] = useState(3);
  const [reminderLimit, setReminderLimit] = useState(5);

  // Compute reminders: importance >=2, sorted by importance desc, then oldest first
  const reminders = items
    .filter(item => item.importance >= 2)
    .sort((a, b) => b.importance - a.importance || new Date(a.createdAt) - new Date(b.createdAt));

  const tagAliases = {
    'Artificial Intelligence': 'AI',
    'Artificial': 'AI',
    'Machine Learning': 'ML',
    'JS': 'JavaScript',
    'TS': 'TypeScript',
  };

  // Toggle tag selection
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Auto-extract tags from content
  const extractTagsFromContent = (text) => {
    const pool = [...new Set([...defaultTags, ...smartTags])];
    const expanded = [...pool, ...Object.keys(tagAliases)];
    return [...new Set(
      expanded
        .filter(tag => new RegExp(`\\b${tag}\\b`, 'i').test(text))
        .map(tag => tagAliases[tag] || tag)
    )];
  };

  // Load items on mount
  useEffect(() => {
    fetch('http://localhost:3001/learned')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setIsLoading(false);

        // Compute tag counts and groups
        const counts = {};
        const groups = {};
        data.forEach(item => {
          const topics = Array.isArray(item.topic) ? item.topic : [item.topic];
          topics.forEach(t => {
            counts[t] = (counts[t] || 0) + 1;
            groups[t] = groups[t] ? [...groups[t], item] : [item];
          });
        });
        const sortedTags = Object.entries(counts)
          .sort(([,a], [,b]) => b - a)
          .map(([tag]) => tag);

        setSmartTags(sortedTags.slice(0, 5));
        setDefaultTags(sortedTags.slice(0, 10));
        setGroupedByTopic(groups);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Auto-add tags when content changes
  useEffect(() => {
    if (content.trim()) {
      setSelectedTags(prev => [...new Set([...prev, ...extractTagsFromContent(content)])]);
    }
  }, [content]);

  // Submit new learning
  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!selectedTags.length && !customTags.length) || !content.trim()) {
      return alert('Please select or add at least one tag and enter some content.');
    }
    const newItem = { topic: [...selectedTags, ...customTags], content, importance };
    try {
      const res = await fetch('http://localhost:3001/learned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const saved = await res.json();
      setItems(prev => [saved, ...prev]);
      // Reset form
      setContent('');
      setSelectedTags([]);
      setCustomTags([]);
      setCustomTag('');
      setImportance(3);
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  // Add custom tag
  const handleAddCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !customTags.includes(tag)) {
      setCustomTags(prev => [...prev, tag]);
      setCustomTag('');
    }
  };

  // Delete an item
  const handleDelete = (id) => {
    if (!window.confirm('Confirm delete?')) return;
    fetch(`http://localhost:3001/learned/${id}`, { method: 'DELETE' })
      .then(() => setItems(prev => prev.filter(i => i._id !== id)));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Reminders */}
      <aside className="w-1/3 bg-red-50 p-4 overflow-y-auto border-r">
        <h2 className="text-xl font-semibold mb-2 text-red-600">
          🔁 Reminders ({Math.min(reminders.length, reminderLimit)}/{reminders.length})
        </h2>
        {/* Legend */}
        <div className="flex space-x-2 mb-4 text-sm">
          <span className="flex items-center"><span className="w-3 h-3 bg-red-700 rounded-full mr-1"/>3=High</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-orange-600 rounded-full mr-1"/>2=Medium</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"/>1=Low</span>
        </div>
        {reminders.length === 0 ? (
          <p className="text-green-700">🎉 All clear!</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence>
              {reminders.slice(0, reminderLimit).map(item => (
                <motion.li
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-3 bg-white shadow rounded flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm mb-1">{item.content}</p>
                    <p className="text-xs">
                      <span className={
                        item.importance === 3 ? 'text-red-700' :
                        item.importance === 2 ? 'text-orange-600' : 'text-yellow-600'
                      }>
                        Importance: {item.importance}
                      </span>
                      {' '}| Mentioned: {item.topic.length}x
                    </p>
                  </div>
                  <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:underline">
                    Got it
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
        {reminderLimit < reminders.length && (
          <button onClick={() => setReminderLimit(reminderLimit + 5)}
            className="mt-4 w-full py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Load more
          </button>
        )}
      </aside>

      {/* Right: Main content */}
      <main className="w-2/3 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">📚 What I Learned</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 shadow rounded mb-6">
          <div>
            <label className="block font-medium mb-1">Content:</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full border rounded p-2 h-24 focus:ring"
              placeholder="Describe what you learned..."
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Importance:</label>
            <div className="flex space-x-2">
              {[3,2,1].map(val => (
                <button
                  key={val} type="button"
                  onClick={() => setImportance(val)}
                  className={`px-3 py-1 border rounded ${importance===val?
                    (val===3?'bg-red-600 text-white':val===2?'bg-orange-500 text-white':'bg-yellow-400 text-white') :
                    'bg-gray-100 hover:bg-gray-200'}`}>
                  {val}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Tags:</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {smartTags.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 border rounded ${selectedTags.includes(tag)? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {defaultTags.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 border rounded ${selectedTags.includes(tag)? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                placeholder="Add custom tag"
                className="border rounded px-2 py-1 flex-grow focus:ring"
              />
              <button type="button" onClick={handleAddCustomTag} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                +
              </button>
            </div>
            {customTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {customTags.map(tag => (
                  <span key={tag} className="bg-green-200 text-green-800 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
            Save
          </button>
        </form>

        {/* History grouped by topic */}
        {isLoading ? (
          <div className="text-center text-blue-500 animate-pulse">Loading history...</div>
        ) : Object.keys(groupedByTopic).length === 0 ? (
          <p className="text-gray-500">No learning entries yet.</p>
        ) : (
          Object.entries(groupedByTopic).map(([topic, list]) => (
            <section key={topic} className="mb-6">
              <h2 className="text-xl font-semibold border-b pb-1 mb-2">
                {topic} ({list.length})
              </h2>
              <ul className="space-y-2">
                {list
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(item => (
                    <li key={item._id} className="bg-white p-3 rounded shadow flex justify-between items-center">
                      <div>
                        <p>{item.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:underline">
                        Delete
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

export default App;
