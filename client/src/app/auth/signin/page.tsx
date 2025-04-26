"use client";

import { useState } from "react";
import styles from "./page.module.css";  

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields must be filled.");
      return;
    }

    console.log("Logging in with:", { email, password });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Login</h2>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <label className={styles.loginLabel}>Email</label>
          <input
            type="email"
            className={styles.loginInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
          />
          <label className={styles.loginLabel}>Password</label>
          <input
            type="password"
            className={styles.loginInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
          />
          {error && <p className={styles.loginError}>{error}</p>}
          <button type="submit" className={styles.loginButton}>Log In</button>
        </form>
      </div>
    </div>
  );
}
