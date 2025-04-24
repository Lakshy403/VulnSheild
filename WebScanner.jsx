import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';


function App() {
  const [url, setUrl] = useState('');
  const [ip, setIp] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    const savedIp = localStorage.getItem("last_ip");
    if (savedIp) setIp(savedIp);
  }, []);

  const runScan = async () => {
    setLoading(true);
    setResults(null);
    setProgress(0);
    setPageCount(0);

    try {
      const form = new FormData();
      form.append('url', url);
      form.append('ip', ip);

      const interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + Math.random() * 5 : prev));
      }, 300);

      localStorage.setItem("last_ip", ip);

      const res = await axios.post('http://localhost:8000/scan', form);
      clearInterval(interval);
      setProgress(100);
      setResults(res.data);
      setPageCount(res.data?.["XSS"]?.length || 0);
    } catch (err) {
      alert('Error running scan');
      console.error(err);
      setProgress(0);
    }

    setLoading(false);
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.post('http://localhost:8000/report/pdf', results, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'scan_report.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Failed to generate PDF");
      console.error(err);
    }
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "scan_result.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getCardColor = (status) => {
    if (typeof status !== 'string') return 'bg-gray-800';
    if (status.includes('Vulnerable')) return 'bg-red-800';
    if (status.includes('Weak')) return 'bg-yellow-700';
    return 'bg-green-700';
  };

  const getStatusIcon = (status) => {
    if (typeof status !== 'string') return <AlertTriangle className="text-white w-5 h-5" />;
    if (status.includes('Vulnerable')) return <ShieldX className="text-red-300 w-5 h-5" />;
    if (status.includes('Weak')) return <AlertTriangle className="text-yellow-300 w-5 h-5" />;
    return <ShieldCheck className="text-green-300 w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🔍 VulnShield Scanner</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Target URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-600 flex-1"
        />
        <input
          type="text"
          placeholder="Target IP"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-600 flex-1"
        />
        <button
          onClick={runScan}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 p-2 px-4 rounded font-semibold"
        >
          {loading ? 'Scanning...' : 'Start Scan'}
        </button>
      </div>

      {loading && (
        <>
          <div className="w-full bg-gray-700 h-3 rounded overflow-hidden mb-4">
            <div
              className="bg-blue-500 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mb-4">Scanning... Please wait</p>
        </>
      )}

      {!loading && pageCount > 0 && (
        <p className="text-sm text-green-400 mb-4">Scan completed — {pageCount} pages scanned</p>
      )}

      {results && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">📋 Scan Results</h2>

          <div className="flex gap-4 mb-4">
            <button onClick={downloadJSON} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
              Download JSON
            </button>
            <button onClick={downloadPDF} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">
              Download PDF
            </button>
          </div>

          <div className="grid gap-6">
            {Object.entries(results).map(([vulnType, entries]) => (
              <div key={vulnType} className="bg-gray-800 p-4 rounded shadow">
                <h3 className="text-xl font-bold mb-3 text-blue-400">{vulnType}</h3>

                {Array.isArray(entries) ? (
                  <div className="grid gap-3">
                    {entries.map((entry, index) => {
                      const page = Object.keys(entry)[0];
                      const status = entry[page];
                      const color = getCardColor(status);
                      const icon = getStatusIcon(status);

                      return (
                        <div key={index} className={`${color} p-3 rounded flex items-center gap-2`}>
                          {icon}
                          <div className="flex flex-col">
                            <a href={page} target="_blank" rel="noreferrer" className="underline font-semibold">
                              {page}
                            </a>
                            <p className="text-sm">{status}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  Object.entries(entries).map(([subKey, subVal], i) => (
                    <div key={i} className="ml-2 text-sm">
                      <strong>{subKey}:</strong>{" "}
                      {typeof subVal === "object" ? (
                        <pre className="bg-black bg-opacity-20 rounded p-2">
                          {JSON.stringify(subVal, null, 2)}
                        </pre>
                      ) : (
                        <span>{subVal}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );


  return <LabScanner />;
}

export default App;
