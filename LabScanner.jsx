import React, { useEffect, useState } from 'react';
import axios from 'axios';

function LabScanner() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subnet, setSubnet] = useState('192.168.1.0/24');

  const scanNetwork = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8010/scan-network?subnet=${subnet}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to scan network');
    }
    setLoading(false);
  };

  useEffect(() => {
    scanNetwork(); // automatically run on component load
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🖥️ Lab Network Scanner</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={subnet}
          onChange={(e) => setSubnet(e.target.value)}
          placeholder="Enter subnet (e.g., 192.168.1.0/24)"
          className="p-2 rounded bg-gray-800 border border-gray-600 flex-1"
        />
        <button
          onClick={scanNetwork}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? 'Scanning...' : 'Scan Network'}
        </button>
      </div>

      {loading && <p className="text-yellow-400">Scanning network... please wait.</p>}

      {results && Object.keys(results).length > 0 && (
        <div className="grid gap-6">
          {Object.entries(results).map(([ip, data]) => (
            <div key={ip} className="bg-gray-800 p-4 rounded shadow">
              <h2 className="text-xl font-bold text-green-400 mb-2">{ip} - {data.status}</h2>
              <p className="text-sm text-gray-400 mb-1">Hostnames: {data.hostnames || 'N/A'}</p>

              {Object.keys(data.ports).length > 0 ? (
                <table className="w-full text-sm bg-gray-900 rounded border border-gray-700">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="p-2 text-left">Port</th>
                      <th className="p-2 text-left">Service</th>
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2 text-left">Version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.ports).map(([port, details]) => (
                      <tr key={port} className="border-t border-gray-700">
                        <td className="p-2">{port}</td>
                        <td className="p-2">{details.name}</td>
                        <td className="p-2">{details.product || 'N/A'}</td>
                        <td className="p-2">{details.version || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No open ports found</p>
              )}
            </div>
          ))}
        </div>
      )}

      {results && Object.keys(results).length === 0 && (
        <p className="text-red-400">No hosts found on this subnet.</p>
      )}
    </div>
  );
}

export default LabScanner;
