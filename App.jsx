import { useState } from 'react';
import WebScanner from "./components/WebScanner";
import LabScanner from "./components/LabScanner";
import SystemInfoDashboard from "./components/SystemInfoDashboard";

function App() {
  const [activeTab, setActiveTab] = useState('web');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🛡️ VulnShield Dashboard</h1>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('web')}
          className={`px-4 py-2 rounded ${activeTab === 'web' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          🌐 Web Scanner
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`px-4 py-2 rounded ${activeTab === 'lab' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          🖥️ Lab Network Scanner
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded ${activeTab === 'info' ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
          💻 System Info
        </button>
      </div>
      
      

      {/* Tab Content */}
      {activeTab === 'web' && <WebScanner />}
      {activeTab === 'lab' && <LabScanner />}
      {activeTab === 'info' && <SystemInfoDashboard />}
    </div>
  );
}

export default App;
