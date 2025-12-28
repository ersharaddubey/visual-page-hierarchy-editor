import React, { useState } from 'react';
import HierarchyFlow from './HierarchyFlow';
import './App.css';

function App() {
  const [structure, setStructure] = useState(null);

  const handleLoad = () => {
    const saved = localStorage.getItem('pageStructure');
    if (saved) {
      setStructure(JSON.parse(saved));
    }
  };

  const handleSave = (currentStructure) => {
    localStorage.setItem('pageStructure', JSON.stringify(currentStructure));
  };

  const handleExport = (currentStructure) => {
    const blob = new Blob([JSON.stringify(currentStructure, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'structure.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Visual Page Hierarchy Editor</h1>
      <HierarchyFlow
        onSave={handleSave}
        onExport={handleExport}
        externalStructure={structure}
      />
      <button
        onClick={handleLoad}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Load from LocalStorage
      </button>
    </div>
  );
}

export default App;