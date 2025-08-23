'use client';

import React, { useEffect, useState } from 'react';
import {
  getUserById,
  register,
  UserData,
  getUsersByLocation,
  deleteUser,
} from '@/shared/services/userService';
import styles from './page.module.css';
import { useSelector } from 'react-redux';

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  access_level?: string;
  site_location?: string;
};

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userid = useSelector((state: any) => state.user._id);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const adminCount = users.filter((user) => user.access_level === 'admin').length;
  const viewerCount = users.filter((user) => user.access_level === 'viewer').length;

  const fetchUsersWithLocation = async (site_location?: string) => {
    if (!site_location) {
      console.error('❌ Site location is undefined');
      setError('Current user has no site location');
      setLoading(false);
      return;
    }

    try {
      const usersList = await getUsersByLocation(site_location);
      setUsers(usersList);
    } catch (err) {
      console.error('❌ Failed to fetch users', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const fullUser = await getUserById(userid);
        setCurrentUser(fullUser);
        await fetchUsersWithLocation(fullUser.site_location);
      } catch (error) {
        console.error('❌ Failed to fetch current user', error);
        setError('Could not load user');
      }
    };

    if (userid) {
      fetchCurrentUser();
    }
  }, [userid]);

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      if (currentUser?.site_location) {
        await fetchUsersWithLocation(currentUser.site_location);
      }
      setSuccessMessage('🗑️ User deleted successfully!');

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('❌ Failed to delete user', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to delete user');
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const { name, email, phone, password } = newUser;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{9,12}$/;

    if (!name || !email || !phone || !password) {
      setError('All fields are required.');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return;
    }

    if (!phoneRegex.test(phone)) {
      setError('Phone must be digits only (9–12 digits).');
      return;
    }

    if (!currentUser?.site_location) {
      setError("Current user's site location is missing.");
      return;
    }

    try {
      await register({
        ...newUser,
        site_location: currentUser.site_location,
      });
      await fetchUsersWithLocation(currentUser.site_location);
      setNewUser({ name: '', email: '', password: '', phone: '' });
      setSuccessMessage('User created successfully!');

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        (typeof err === 'string' ? err : null) ||
        'Failed to create user';
      setError(message);
    }
  };

  if (!loading && currentUser?.access_level === 'viewer') {
    return (
      <div className={styles.userManagementContainer}>
        <div className={styles.accessDeniedBox}>
          <h2 className={styles.accessDeniedTitle}>Access Denied</h2>
          <p className={styles.accessDeniedText}>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userManagementContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.mainTitle}>User Management</h1>
        <p className={styles.mainSubtitle}>Manage team members and access permissions</p>
      </div>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statsItem}`}>
          <div className={styles.statsNumber}>{users.length}</div>
          <div className={styles.statsLabel}>Total Users</div>
        </div>
        <div className={`${styles.statsItem} ${styles.adminStats}`}>
          <div className={styles.statsNumber}>{adminCount}</div>
          <div className={styles.statsLabel}>Administrators</div>
        </div>
        <div className={`${styles.statsItem} ${styles.viewerStats}`}>
          <div className={styles.statsNumber}>{viewerCount}</div>
          <div className={styles.statsLabel}>Viewers</div>
        </div>
      </div>

      {/* User List Section */}
      <div className={styles.userBox}>
        <h2 className={styles.sectionTitle}>User Directory</h2>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            Loading users...
          </div>
        ) : (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span
                      className={`${styles.roleBadge} ${
                        user.access_level === 'admin' ? styles.adminBadge : styles.viewerBadge
                      }`}
                    >
                      {user.access_level}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this user?')) {
                          handleDeleteUser(user._id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    {searchTerm ? (
                      <div>
                        <div className={styles.emptyStateText}>No users found</div>
                        <div className={styles.emptyStateSubtext}>
                          Try adjusting your search terms
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className={styles.emptyStateText}>No users registered yet</div>
                        <div className={styles.emptyStateSubtext}>Create your first user below</div>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Section */}
      <div className={styles.userBox}>
        <h2 className={styles.sectionTitle}>Create New User</h2>

        {error && (
          <div className={`${styles.messageContainer} ${styles.errorMessage}`}>{error}</div>
        )}

        {successMessage && (
          <div className={`${styles.messageContainer} ${styles.successMessage}`}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleCreateUser} className={styles.createUserForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={newUser.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={newUser.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={newUser.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter secure password"
                value={newUser.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserManagementPage;
