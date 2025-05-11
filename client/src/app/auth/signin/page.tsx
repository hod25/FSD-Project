'use client';
import { useRouter } from "next/navigation";

import { useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (!email || !password) {
      setError("All fields must be filled.");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
  
      console.log("Login successful", data);
      router.push("/connected/home");
    } catch (err) {
      setError("An error occurred. Try again.");
    }
  };
  

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoContainer}>
        <Image src="/prosafe-white-logo.png" alt="ProSafe Logo" width={200} height={100} />
      </div>
      
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
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              className={styles.loginInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className={styles.eyeIcon}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {error && <p className={styles.loginError}>{error}</p>}
          <button type="submit" className={styles.loginButton}>Log In</button>
        </form>

        <div className="text-center mt-4">
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowInfo(!showInfo)}
          >
            Info <FaChevronDown className="ms-2" />
          </button>
        </div>

        {showInfo && (
          <div className="infoBox alert alert-info mt-2 text-start" dir="ltr">
            <p style={{ fontSize: "16px", fontFamily: "Roboto", color: "#333" }}>
              ProSafe uses advanced computer vision and real-time video analysis to detect workers not wearing essential safety gear like helmets. With ProSafe, organizations can take a proactive step toward preventing accidents and ensuring compliance efficiently, accurately, and at scale.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
