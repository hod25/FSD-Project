'use client';

import React, { useEffect, useState } from "react";
import { getUserById, register, UserData,getUsersByLocation } from "@/services/userService";
import styles from "./page.module.css";
import { useSelector } from 'react-redux';

type User = {
  _id: string;
  name: string;
  email: string;
  access_level?: string;
  site_location?: string;
};

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const userid = useSelector((state: any) => state.user._id);

    
const fetchUsersWithLocation = async (site_location?: string) => {
  if (!site_location) {
    console.error("❌ Site location is undefined");
    setError("Current user has no site location");
    setLoading(false);
    return;
  }

  try {
    const usersList = await getUsersByLocation(site_location);
    setUsers(usersList);
  } catch (err) {
    console.error("❌ Failed to fetch users", err);
    setError("Failed to fetch users");
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
        // כאן תוכל להכניס גם fetchUsers() אם אתה רוצה למשוך את רשימת המשתמשים לפי אזור
      } catch (error) {
        console.error("❌ Failed to fetch current user", error);
        setError("Could not load user");
      }
    };

    if (userid) {
      fetchCurrentUser();
    }
  }, [userid]);



  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const { name, email, phone, password } = newUser;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{9,12}$/;

    if (!name || !email || !phone || !password) {
      setError("All fields are required.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Invalid email format.");
      return;
    }

    if (!phoneRegex.test(phone)) {
      setError("Phone must be digits only (9–12 digits).");
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
      setNewUser({ name: "", email: "", password: "", phone: "" });
      setSuccessMessage("User created successfully ✅");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        (typeof err === "string" ? err : null) ||
        "Failed to create user";
      setError(message);
    }
  };

  return (
    <div className={styles.userManagementContainer}>
      <div className={styles.userBox}>
        <h2 className={styles.userSubtitle}>User List</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.email}</td>
                  <td>{user.access_level}</td>
                  <td>
                    <button className={styles.deleteBtn}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.userBox}>
        <h1 className={styles.userTitle}>User Management</h1>
        {error && (
          <div style={{ color: "red", textAlign: "center", marginBottom: 12 }}>{error}</div>
        )}
        {successMessage && (
          <div style={{ color: "green", textAlign: "center", marginBottom: 12 }}>
            {successMessage}
          </div>
        )}
        <form onSubmit={handleCreateUser} className={styles.createUserForm}>
          <h2 className={styles.userSubtitle}>Create New User</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                placeholder="Name"
                value={newUser.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                placeholder="Email"
                value={newUser.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                placeholder="Phone Number"
                value={newUser.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <button type="submit" className={styles.submitBtn}>Create User</button>
        </form>
      </div>
    </div>
  );
};

export default UserManagementPage;
