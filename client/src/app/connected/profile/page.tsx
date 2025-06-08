'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { FiUser, FiSave } from 'react-icons/fi';
import { FaEnvelope, FaUserEdit } from 'react-icons/fa';
import { Typography } from '@mui/material'; 
import { useSelector } from 'react-redux';
import { selectUserName } from '../../../store/slices/userSlice';
import { getCurrentUser, updateUserProfile } from '../../../services/userService';

export default function Profile() {
  const username = useSelector(selectUserName) || 'Guest';
  const userEmail = useSelector((state: any) => state.user.email);
  const [user, setUser] = useState({
    _id: '',
    name: '',
    email: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser({
          _id: data._id,
          name: data.name || '',
          email: data.email || '',
        });
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
    setStatus("");
    try {
      // שלח רק שדות ששונו
      const updateData: any = {};
      if (user.name) updateData.name = user.name;
      if (user.email) updateData.email = user.email;
      const updated = await updateUserProfile(user._id, updateData);
      setUser({ ...user, name: updated.name, email: updated.email });
      setStatus("Changes saved successfully!");
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setStatus(err.response.data.message);
      } else {
        setStatus("Failed to save changes.");
      }
      console.error("Error saving:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logoContainer}>
        <FiUser size={72} color="#d18700" className={styles.loginIcon} />
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
              onChange={handleChange}
              className={styles.loginInput}
              placeholder={userEmail || 'email@example.com'}
              disabled={loading}
              required
            />
          </div>
          {status && (
            <Typography
              variant="body2"
              className={status.includes('successfully') ? styles.successMessage : styles.loginError}
              sx={{ mt: 2, textAlign: 'center' }}
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
