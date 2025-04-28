import React, { useState, useEffect } from "react";
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("AAPL");

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${query}&interval=5min&apikey=VDP2D2K6W3MHHW8T.json&datatype=json`
      );
      const data = await response.json();

      if (!data['Time Series (5min)']) {
        throw new Error("API error or limit reached.");
      }

      const times = Object.keys(data['Time Series (5min)']);
      const latestTime = times[0];
      const latestPrice = data['Time Series (5min)'][latestTime]['1. open'];

      setStocks([
        { symbol: query, price: parseFloat(latestPrice) }
      ]);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white flex flex-col items-center py-10 font-sans">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">📈 Stock Dashboard</h1>
      <p className="text-gray-500 mb-10">Live stock prices updated every 5 minutes</p>

      <div className="w-full max-w-4xl flex flex-col gap-8">

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              className="border rounded-lg p-3 flex-1 bg-gray-50"
              placeholder="Enter a stock symbol (e.g., AAPL)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg"
              onClick={fetchStocks}
            >
              Search
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-12 h-12 border-4 border-blue-400 border-dashed rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-6">{error}</div>
          ) : stocks.length > 0 && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Symbol</th>
                  <th className="py-2">Price ($)</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3">{stock.symbol}</td>
                    <td className="py-3">${stock.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {stocks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <Line
              data={{
                labels: [stocks[0].symbol],
                datasets: [{
                  label: 'Latest Price ($)',
                  data: [stocks[0].price],
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  fill: true,
                  tension: 0.4,
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    ticks: {
                      color: '#64748b',
                    },
                    grid: {
                      color: '#e2e8f0',
                    },
                  },
                  x: {
                    ticks: {
                      color: '#64748b',
                    },
                    grid: {
                      color: '#e2e8f0',
                    },
                  }
                }
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
