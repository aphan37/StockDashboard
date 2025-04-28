import React, { useState, useEffect } from "react";
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';

// This is a simple React application that fetches stock prices from the Alpha Vantage API
// and displays them in a table and a line chart. The user can input stock symbols
// (comma-separated) to fetch their prices. The application handles loading states and errors gracefully.
// The Alpha Vantage API key is hardcoded for demonstration purposes.

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("AAPL,MSFT,GOOGL,AMZN");

  // Function to fetch stock data from Alpha Vantage API
  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${query}&interval=5min&apikey=VDP2D2K6W3MHHW8T&datatype=json`
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
            <h2 className="text-xl font-semibold mb-4">Stock Prices</h2>
            <p className="text-gray-600 mb-4">
              Showing prices for: <strong>{query}</strong>
            </p>
            <p className="text-gray-600 mb-4">
              Data fetched from Alpha Vantage API. Please note that the API has a limit on the number of requests.
            </p>
            <p className="text-gray-600 mb-4">
              The data shown is for demonstration purposes only and may not reflect real-time prices.
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
                          pointRadius: 5,
                          pointHoverRadius: 7,
                          pointBackgroundColor: '#fff',
                          pointBorderColor: '#3b82f6',
                          pointBorderWidth: 2,
                          pointHoverBackgroundColor: '#3b82f6',
                          pointHoverBorderColor: '#fff',
                          pointHoverBorderWidth: 2,
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
