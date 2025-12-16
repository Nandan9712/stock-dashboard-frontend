import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Login from "./Login";
import "./styles.css";

import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const STOCKS = ["GOOGLE", "TSLA", "AMZN", "META", "NVDA"];

export default function App() {
  const socketRef = useRef(null);

  const [user, setUser] = useState(localStorage.getItem("userEmail"));
  const [subscribed, setSubscribed] = useState([]);
  const [prices, setPrices] = useState({});
  const [history, setHistory] = useState({});
  const [loadingSubs, setLoadingSubs] = useState(true);

  const [confirmStock, setConfirmStock] = useState(null);
  const [view, setView] = useState("ALL"); // ⭐ ALL | PORTFOLIO

  useEffect(() => {
    if (!user) return;

    socketRef.current = io("https://stock-dashboard-backend-97xy.onrender.com");

    socketRef.current.emit("login", user);

    socketRef.current.on("loadSubscriptions", (subs) => {
      setSubscribed(subs);
      setLoadingSubs(false);
    });

    socketRef.current.on("stockUpdate", ({ stock, price }) => {
      setPrices((prev) => ({ ...prev, [stock]: price }));

      setHistory((prev) => {
        const old = prev[stock] || [];
        return { ...prev, [stock]: [...old, price].slice(-20) };
      });
    });

    return () => socketRef.current.disconnect();
  }, [user]);

  const loginUser = (email) => {
    localStorage.setItem("userEmail", email);
    setUser(email);
  };

  const logoutUser = () => {
    socketRef.current?.disconnect();
    localStorage.removeItem("userEmail");
    setUser(null);
    setSubscribed([]);
    setPrices({});
    setHistory({});
  };

  const subscribeToStock = () => {
    if (!confirmStock) return;

    socketRef.current.emit("subscribe", confirmStock);

    if (!subscribed.includes(confirmStock)) {
      setSubscribed((prev) => [...prev, confirmStock]);
    }

    setConfirmStock(null);
  };

  if (!user) return <Login onLogin={loginUser} />;
  if (loadingSubs) return <h2>Loading...</h2>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h2>Welcome, {user}</h2>
        <button className="logout-btn" onClick={logoutUser}>Logout</button>

        {/* ⭐ View Switch Buttons */}
        <div className="tab-bar">
          <button
            className={view === "ALL" ? "active-tab" : ""}
            onClick={() => setView("ALL")}
          >
            All Stocks
          </button>

          <button
            className={view === "PORTFOLIO" ? "active-tab" : ""}
            onClick={() => setView("PORTFOLIO")}
          >
            Portfolio
          </button>
        </div>

        {/* ⭐ ALL STOCKS VIEW */}
        {view === "ALL" && (
          <>
            <h3>All Stocks</h3>
            {STOCKS.map((stock) => (
              <div key={stock} className="stock-row">
                <span className="stock-name">{stock}</span>
                <span className="stock-price">{prices[stock] ?? "Loading..."}</span>
                <button 
                  className="subscribe-btn"
                  onClick={() => setConfirmStock(stock)}
                >
                  Subscribe
                </button>
              </div>
            ))}
          </>
        )}

        {/* ⭐ PORTFOLIO VIEW */}
        {view === "PORTFOLIO" && (
          <>
            <h3>Your Portfolio</h3>
            {subscribed.length === 0 && <p className="no-stocks-message">No subscriptions yet.</p>}

            {subscribed.map((stock) => (
              <div key={stock} className="portfolio-chart">
                <div className="chart-header">
                  <h3>{stock}</h3>
                  <span className="current-price">{prices[stock] ?? "Waiting..."}</span>
                </div>

                <div className="chart-wrapper">
                  <Line
                    data={{
                      labels: history[stock]?.map((_, i) => i + 1),
                      datasets: [
                        {
                          label: `${stock} Price`,
                          data: history[stock] || [],
                          borderColor: "#667eea",
                          backgroundColor: "rgba(102, 126, 234, 0.1)",
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          mode: 'index',
                          intersect: false,
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                          ticks: {
                            callback: function(value) {
                              return '$' + value;
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                    height={200}
                  />
                </div>
              </div>
            ))}
          </>
        )}

        {/* ⭐ Confirmation Popup */}
        {confirmStock && (
          <div className="popup">
            <div className="popup-box">
              <h3>Subscribe to {confirmStock}?</h3>
              <button onClick={subscribeToStock}>Yes</button>
              <button className="cancel-btn" onClick={() => setConfirmStock(null)}>
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}