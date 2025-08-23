'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { FiSave } from 'react-icons/fi';
import { FaEnvelope, FaUserEdit } from 'react-icons/fa';
import { Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectUserName } from '@/shared/store/slices/userSlice';
import { updateUserProfile } from '@/shared/services/userService';
import { getUserById } from '@/shared/services/userService';

export default function Profile() {
  const username = useSelector(selectUserName) || '';
  const userEmail = useSelector((state: { user: { email: string } }) => state.user.email);
  const userPhone = useSelector((state: { user: { phone: string } }) => state.user.phone);
  const userid = useSelector((state: { user: { _id: string } }) => state.user._id);
  const [user, setUser] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
  });
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserPhoneById = async () => {
      try {
        if (userid) {
          const userData = await getUserById(userid);
          setUser((prev) => ({
            ...prev,
            phone: userData.phone || '',
          }));
        }
      } catch (err) {
        console.error('Failed to fetch user phone:', err);
      }
    };

    fetchUserPhoneById();
  }, [userid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');

    // ניקוי רווחים מהקלטים
    const trimmedName = user.name.trim();
    const trimmedEmail = user.email.trim();
    const trimmedPhone = user.phone?.trim();
    const trimmedPassword = password.trim();

    // אם השדות ריקים, נשמור את הערכים הקודמים (מה שכרגע ב-store)
    const finalName = trimmedName || username;
    const finalEmail = trimmedEmail || userEmail;
    const finalPhone = trimmedPhone || userPhone || '';

    // בדיקת תקינות אימייל
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finalEmail)) {
      setStatus('Please enter a valid email address.');
      return;
    }

    // בדיקת תקינות טלפון - רק ספרות
    const phoneRegex = /^\d*$/;
    if (finalPhone && !phoneRegex.test(finalPhone)) {
      setStatus('Phone number must contain only digits.');
      return;
    }

    // חובה שיהיה שם ואימייל
    if (!finalName || !finalEmail) {
      setStatus('Name and Email cannot be empty.');
      return;
    }

    // בדיקה אם לא שונה כלום (גם לא סיסמה)
    if (
      finalName === username.trim() &&
      finalEmail === userEmail.trim() &&
      finalPhone === (userPhone?.trim() || '') &&
      trimmedPassword === ''
    ) {
      setStatus('No changes to save.');
      return;
    }

    setLoading(true);
    try {
      const updateData: {
        name: string;
        email: string;
        phone: string;
        password?: string;
      } = {
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
      };
      if (trimmedPassword) updateData.password = trimmedPassword;

      const updated = await updateUserProfile(userid, updateData);
      setUser({
        ...user,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
      });
      setPassword('');
      setStatus('Changes saved successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (error?.response?.data?.message) {
        setStatus(error.response.data.message);
      } else {
        setStatus('Failed to save changes.');
      }
      console.error('Error saving:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* <div className={styles.logoContainer}>
        <FiUser size={72} color="#d18700" className={styles.loginIcon} />
      </div> */}
      <div className={styles.loginBox}>
        <h2 className={styles.loginTitle}>My Profile</h2>
        <p className={styles.loginSubtitle}>View or update account information</p>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label className={styles.loginLabel}>
              <FaUserEdit className="me-2" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={username}
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
          <div className={styles.formGroup}>
            <label className={styles.loginLabel}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className={styles.loginInput}
              placeholder="Phone Number"
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.loginLabel}>New Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.loginInput}
              placeholder="New Password"
              disabled={loading}
            />
          </div>
          {status && (
            <Typography
              variant="body2"
              className={
                status.includes('successfully') ? styles.successMessage : styles.loginError
              }
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
