import { useState } from "react";
import "./styles.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={() => onLogin(email)}>Login</button>
      </div>
    </div>
  );
}
