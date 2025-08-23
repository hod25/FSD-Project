'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUserAsync } from '@/shared/store/slices/userSlice';
import { AppDispatch } from '@/shared/store/store';
import styles from './page.module.css';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiLogIn } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // Dispatch login action which will also fetch location and areas
      const resultAction = await dispatch(loginUserAsync({ email, password }));

      if (loginUserAsync.rejected.match(resultAction)) {
        // Handle login failure
        throw new Error(resultAction.payload as string);
      }

      // Login successful - the location and areas will be fetched automatically
      console.log('Login successful');

      // No navigation here - just update the Redux state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
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
                disabled={loading}
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
                disabled={loading}
              />
              <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {error && <p className={styles.loginError}>{error}</p>}

          <button type="submit" className={styles.loginButton} disabled={loading}>
            <FiLogIn className={styles.loginIcon} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
