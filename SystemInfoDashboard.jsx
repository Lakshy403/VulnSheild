import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SystemInfoDashboard() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://192.168.1.6:8010/system-info/list"); // Change if needed
        console.log("System Info Fetched:", res.data);

        if (Array.isArray(res.data)) {
          setSystems(res.data);
        } else {
          throw new Error("Data is not an array");
        }

      } catch (err) {
        console.error("Error loading system info:", err);
        setError("Failed to load system info.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-yellow-400 p-6">🔄 Loading system info...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">❌ {error}</div>;
  }

  if (systems.length === 0) {
    return <div className="text-gray-400 p-6">⚠️ No system info available yet.</div>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">💻 System Info Dashboard</h1>

      <div className="grid gap-6">
        {systems.map((sys, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded shadow">
            <h2 className="text-xl font-bold text-green-400 mb-2">
              {sys.ComputerName || 'Unknown'}
            </h2>
            <p><strong>User:</strong> {sys.UserName || 'N/A'}</p>
            <p><strong>OS Version:</strong> {sys.OSVersion || 'N/A'}</p>
            <p><strong>Last Boot:</strong> {typeof sys.LastBoot === 'object' ? sys.LastBoot.value || 'N/A' : sys.LastBoot}</p>
            <p><strong>Last Update:</strong> {typeof sys.LastUpdate === 'object' ? sys.LastUpdate.value || 'N/A' : sys.LastUpdate}</p>

          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemInfoDashboard;
