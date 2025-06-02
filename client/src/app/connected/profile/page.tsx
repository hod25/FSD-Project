'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { FiUser, FiSave } from 'react-icons/fi';
import { FaEnvelope, FaUserEdit } from 'react-icons/fa';
import { Typography } from '@mui/material'; 
import { useSelector } from 'react-redux';
import { selectUserName } from '../../../store/slices/userSlice';


export default function Profile() {
  const username = useSelector(selectUserName) || 'Guest';
  const [user, setUser] = useState({
    name: '',
    email: '',
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current user data
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.name || '',
            email: data.email || '',
          });
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      // Only send the name for update
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name }),
      });

      if (res.ok) {
        setStatus('Changes saved successfully!');
      } else {
        setStatus('Failed to save changes.');
      }
    } catch (err) {
      console.error('Error saving:', err);
      setStatus('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoContainer}>
        <FiUser size={72} color="#007bff" />
      </div>
      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>Your Profile</h2>
        <p className={styles.loginSubtitle}>View or update your account information</p>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label className={styles.loginLabel}>
              <FaUserEdit className="me-2" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className={styles.loginInput}
              placeholder={username || 'Full Name'}
              disabled={loading}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.loginLabel}>
              <FaEnvelope className="me-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={user.email}
              className={styles.loginInput}
              placeholder="email@example.com"
              disabled
              readOnly
            />
          </div>
          {status && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                fontWeight: 500,
                color: status.includes('successfully') ? 'success.main' : 'error.main',
                textAlign: 'center',
              }}
            >
              {status}
            </Typography>
          )}
          <button type="submit" className={styles.loginButton} disabled={loading}>
            <FiSave className={styles.loginIcon} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
