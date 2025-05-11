'use client';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import { FaChevronDown, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('All fields must be filled.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      console.log('Login successful', data);
      router.push('/connected/home');
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Try again.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoContainer}>
        <Image src="/ProSafe_Logo.svg" alt="ProSafe Logo" width={240} height={120} priority />
      </div>

      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Welcome Back</h2>
        <p className={styles.loginSubtitle}>Sign in to continue to ProSafe</p>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label className={styles.loginLabel}>Email</label>
            <div className={styles.inputContainer}>
              <input
                type="email"
                className={styles.loginInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.passwordLabelContainer}>
              <label className={styles.loginLabel}>Password</label>
              <a href="#" className={styles.forgotPassword}>
                Forgot password?
              </a>
            </div>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.loginInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                placeholder="••••••••"
              />
              <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {error && <p className={styles.loginError}>{error}</p>}

          <button type="submit" className={styles.loginButton}>
            <FiLogIn className={styles.loginIcon} />
            Sign In
          </button>
        </form>

        <div className={styles.infoToggleContainer}>
          <button className={styles.infoToggleButton} onClick={() => setShowInfo(!showInfo)}>
            About ProSafe <FaChevronDown className={showInfo ? styles.chevronUp : ''} />
          </button>
        </div>

        {showInfo && (
          <div className={styles.infoBox}>
            <p>
              ProSafe uses advanced computer vision and real-time video analysis to detect workers
              not wearing essential safety gear like helmets. With ProSafe, organizations can take a
              proactive step toward preventing accidents and ensuring compliance efficiently,
              accurately, and at scale.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
