import { useState } from "react";
import "./styles.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setError("");
    onLogin(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
        />
        {error && <div className="error-message">{error}</div>}
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}