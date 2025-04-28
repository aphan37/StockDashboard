import React, { useState, useEffect } from "react";
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");

  const API_KEY = 'VDP2D2K6W3MHHW8T'; // <<-- Your real API key

  // Fetch stock price data
  const fetchStocks = async (symbol) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`
      );
      const data = await response.json();
      if (!data['Time Series (5min)']) {
        throw new Error("API error or limit reached.");
      }
      const times = Object.keys(data['Time Series (5min)']);
      const latestTime = times[0];
      const latestPrice = data['Time Series (5min)'][latestTime]['1. open'];
      setStocks([
        { symbol: symbol, price: parseFloat(latestPrice) }
      ]);
    } catch (err) {
      setError(err.message);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggestions while typing
  const fetchSuggestions = async (keyword) => {
    if (!keyword) {
      setSuggestions([]);
      return;
    }
    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${API_KEY}`
    );
    const data = await response.json();
    if (data.bestMatches) {
      const results = data.bestMatches.map(match => ({
        symbol: match["1. symbol"],
        name: match["2. name"]
      }));
      setSuggestions(results.slice(0, 5)); // Only show top 5
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (symbol) => {
    setSelectedSymbol(symbol);
    setQuery(symbol);
    setSuggestions([]);
    fetchStocks(symbol);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query) {
      fetchStocks(query);
      setSuggestions([]);
    }
  };

  // Fetch stock when selectedSymbol changes
  useEffect(() => {
    fetchStocks(selectedSymbol);
  }, [selectedSymbol]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white flex flex-col items-center py-10 font-sans">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">📈 Stock Dashboard</h1>
      <p className="text-gray-500 mb-10">Live stock prices with real-time search suggestions</p>

      <div className="w-full max-w-4xl flex flex-col gap-8">

        <div className="bg-white rounded-2xl shadow-md p-6 relative">
          <div className="flex gap-4 mb-4 relative">
            <input
              type="text"
              className="border rounded-lg p-3 flex-1 bg-gray-50"
              placeholder="Type a company name or symbol (e.g., Apple, AAPL)"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg"
              onClick={() => fetchStocks(query)}
            >
              Search
            </button>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.symbol)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <span className="font-semibold">{suggestion.symbol}</span> - {suggestion.name}
                  </div>
                ))}
              </div>
            )}
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
                  legend: { display: false },
                  title: { display: false }
                },
                scales: {
                  y: {
                    ticks: { color: '#64748b' },
                    grid: { color: '#e2e8f0' },
                  },
                  x: {
                    ticks: { color: '#64748b' },
                    grid: { color: '#e2e8f0' },
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
