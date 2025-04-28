import React, { useState, useEffect } from "react";
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js auto to register all components

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("AAPL,MSFT,GOOGL,AMZN");

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=${query}&apikey=VDP2D2K6W3MHHW8T`
      );
      const data = await response.json();
      if (!data['Stock Quotes']) {
        throw new Error("API error or limit reached.");
      }
      setStocks(data['Stock Quotes']);
    } catch (err) {
      setError(err.message);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">📈 Stock Price Dashboard</h1>

      <div className="w-full max-w-3xl bg-white p-6 rounded shadow mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            className="border rounded p-2 flex-1"
            placeholder="Enter stock symbols, comma separated (e.g., AAPL,MSFT)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={fetchStocks}
          >
            Search
          </button>
        </div>

        {loading ? (
          <div className="text-center p-6">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b text-left">Symbol</th>
                  <th className="px-6 py-3 border-b text-left">Price ($)</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="px-6 py-4 border-b">{stock['1. symbol']}</td>
                    <td className="px-6 py-4 border-b">{parseFloat(stock['2. price']).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stocks.length > 0 && (
              <div className="w-full max-w-2xl mt-8">
                <Line
                  data={{
                    labels: stocks.map((stock) => stock['1. symbol']),
                    datasets: [
                      {
                        label: 'Stock Prices ($)',
                        data: stocks.map((stock) => parseFloat(stock['2. price'])),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        fill: true,
                        tension: 0.4,
                      },
                    ],
                  }}
                />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default App;
