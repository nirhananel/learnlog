import React, { useEffect, useState } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [customTags, setCustomTags] = useState([]);
  const [smartTags, setSmartTags] = useState([]);
  const [defaultTags, setDefaultTags] = useState(['React', 'AI', 'Personal', 'Books', 'Tech', 'Health']);
  const [groupedByTopic, setGroupedByTopic] = useState({});

  const tagAliases = {
    'Artificial Intelligence': 'AI',
    'Artificial': 'AI',
    'Machine Learning': 'ML',
    'JS': 'JavaScript',
    'TS': 'TypeScript'
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const extractTagsFromContent = (text) => {
    const commonTags = [...new Set([...defaultTags, ...smartTags])];
    const expandedTags = [...commonTags, ...Object.keys(tagAliases)];
    const found = expandedTags.filter(tag =>
      new RegExp(`\\b${tag}\\b`, 'i').test(text)
    ).map(tag => tagAliases[tag] || tag);
    return [...new Set(found)];
  };

  useEffect(() => {
    fetch('http://localhost:3001/learned')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setIsLoading(false);

        const tagCounts = {};
        const topicGroups = {};

        data.forEach(item => {
          const topics = Array.isArray(item.topic) ? item.topic : [item.topic];
          topics.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            if (!topicGroups[tag]) topicGroups[tag] = [];
            topicGroups[tag].push(item);
          });
        });

        const sortedTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .map(entry => entry[0]);

        setSmartTags(sortedTags.slice(0, 5));
        setDefaultTags(sortedTags.slice(0, 10));
        setGroupedByTopic(topicGroups);
      })
      .catch(err => {
        console.error('Failed to fetch:', err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (content.trim()) {
      const autoTags = extractTagsFromContent(content);
      setSelectedTags((prev) => [...new Set([...prev, ...autoTags])]);
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((!selectedTags.length && !customTags.length) || !content.trim()) {
      alert('You must select or type a tag, and enter content.');
      return;
    }

    const allTags = [...selectedTags, ...customTags];

    const newItem = {
      topic: allTags,
      content,
    };

    try {
      const res = await fetch('http://localhost:3001/learned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      const savedItem = await res.json();
      setItems(prev => [savedItem, ...prev]);
      setSelectedTags([]);
      setCustomTags([]);
      setCustomTag('');
      setContent('');
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !customTags.includes(customTag.trim())) {
      setCustomTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this item?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:3001/learned/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setItems(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>📚 What I Learned</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Something You Learned</h2>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Tags:</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {smartTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">Default Tags:</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {defaultTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add custom tag"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            >
              ➕
            </button>
          </div>

          {customTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customTags.map(tag => (
                <span
                  key={tag}
                  className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <textarea
          placeholder="What did you learn?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md">
          Save
        </button>
      </form>

      {isLoading ? (
        <div className="text-center py-10 text-blue-500 text-lg animate-pulse">
          Loading your learning log...
        </div>
      ) : Object.keys(groupedByTopic).length === 0 ? (
        <p className="text-gray-500 text-center">No items found yet.</p>
      ) : (
        Object.keys(groupedByTopic).map(topic => (
          <div key={topic} className="mb-8">
            <h3 className="text-lg font-semibold text-blue-700 mb-2 border-b pb-1">{topic}</h3>
            <ul className="space-y-1">
              {groupedByTopic[topic].map((item) => (
                <li key={item._id} className="text-gray-800 text-sm flex items-center justify-between">
                  <span>
                    {item.content}
                    <span className="text-gray-400 text-xs ml-2">
                      ({new Date(item.createdAt).toLocaleString()})
                    </span>
                  </span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="ml-4 text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑️
                  </button>
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