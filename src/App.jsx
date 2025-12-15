import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Login from "./Login";
import "./styles.css";

import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

let socket;

export default function App() {
  const [user, setUser] = useState(localStorage.getItem("userEmail"));
  const [subscribed, setSubscribed] = useState([]);
  const [prices, setPrices] = useState({});
  const [history, setHistory] = useState({});
  const [loadingSubs, setLoadingSubs] = useState(true);

  const [confirmStock, setConfirmStock] = useState(null); // ⭐ NEW (for confirmation popup)

  useEffect(() => {
    if (user) {
      socket = io("https://stock-dashboard-backend-97xy.onrender.com");

      socket.emit("login", user);

      socket.on("loadSubscriptions", (subs) => {
        setSubscribed(subs);
        setLoadingSubs(false);
      });

      socket.on("stockUpdate", ({ stock, price }) => {
        setPrices((prev) => ({
          ...prev,
          [stock]: price
        }));

        // ⭐ Store graph history (last 20 values)
        setHistory((prev) => {
          const old = prev[stock] || [];
          const updated = [...old, price].slice(-20);
          return { ...prev, [stock]: updated };
        });
      });
    }
  }, [user]);

  const loginUser = (email) => {
    localStorage.setItem("userEmail", email);
    setUser(email);
  };

  const logoutUser = () => {
    if (socket) socket.disconnect();
    localStorage.removeItem("userEmail");
    setUser(null);
    setSubscribed([]);
    setPrices({});
    setHistory({});
  };

  // ⭐ Ask confirmation before subscribing
  const askSubscribe = (stock) => {
    setConfirmStock(stock);
  };

  const subscribeToStock = () => {
    if (!confirmStock) return;
    const stock = confirmStock;

    socket.emit("subscribe", stock);

    if (!subscribed.includes(stock)) {
      setSubscribed((prev) => [...prev, stock]);
    }

    setConfirmStock(null); // close popup
  };

  if (!user) return <Login onLogin={loginUser} />;

  if (loadingSubs) return <h2>Loading your subscriptions...</h2>;

  return (
    <div className="container">
      <h2>Welcome, {user}</h2>
      <button className="logout-btn" onClick={logoutUser}>
        Logout
      </button>

      <h3>Subscribe to a Stock</h3>
      {["GOOG", "TSLA", "AMZN", "META", "NVDA"].map((s) => (
        <button key={s} onClick={() => askSubscribe(s)}>
          {s}
        </button>
      ))}

      {/* ⭐ Confirmation popup */}
      {confirmStock && (
        <div className="popup">
          <div className="popup-box">
            <h3>Subscribe to {confirmStock}?</h3>
            <button onClick={subscribeToStock}>Yes</button>
            <button
              className="logout-btn"
              onClick={() => setConfirmStock(null)}
            >
              No
            </button>
          </div>
        </div>
      )}

      <h2>Live Stock Prices</h2>
      {subscribed.map((s) => (
        <div key={s} style={{ marginBottom: "30px" }}>
          <h3>{s}: {prices[s] ?? "Waiting..."}</h3>

          {/* ⭐ Live Graph */}
          <Line
            data={{
              labels: history[s]?.map((_, i) => i + 1),
              datasets: [
                {
                  label: `${s} Price`,
                  data: history[s] || [],
                  borderColor: "blue",
                  backgroundColor: "lightblue"
                },
              ],
            }}
            height={150}
          />
        </div>
      ))}
    </div>
  );
}
