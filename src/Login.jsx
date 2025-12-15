import { useState } from "react";
import "./styles.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }
    onLogin(email);
  };

  return (
    <div className="login-container">
      <div className="container" style={{ maxWidth: "480px", minHeight: "auto" }}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}
