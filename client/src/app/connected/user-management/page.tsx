"use client";
import React, { useEffect, useState } from "react";
import { getCurrentUser, register, updateUserProfile } from "@/services/userService";
import { useRouter } from "next/navigation";
import { UserData, RegisterCredentials } from "@/services/userService";
import styles from "./page.module.css";

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState<RegisterCredentials>({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch current user and check admin access
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        // if (user.access_level?.toLowerCase() !== "admin") {
        //   router.replace("/connected/home");
        // } else {
          fetchUsers();
        // }
      })
      .catch(() => {
        // router.replace("/auth/signin");
      });
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users"); // You may need to implement this API route
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError("Failed to fetch users");
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(newUser);
      setNewUser({ name: "", email: "", password: "", phone: "" });
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create user");
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
                <th>Email</th>
                <th>Role</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.access_level}</td>
                  <td>{user.site_location || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className={styles.userBox}>
        <h1 className={styles.userTitle}>User Management</h1>
        {error && <div style={{ color: "red", textAlign: "center", marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleCreateUser} className={styles.createUserForm}>
          <h2 className={styles.userSubtitle}>Create New User</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="name">Name</label>
              <input id="name" name="name" placeholder="Name" value={newUser.name} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="email">Email</label>
              <input id="email" name="email" placeholder="Email" value={newUser.email} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" placeholder="Phone Number" value={newUser.phone} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.inputLabel} htmlFor="password">Password</label>
              <input id="password" name="password" placeholder="Password" type="password" value={newUser.password} onChange={handleInputChange} required />
            </div>
          </div>
          <button type="submit">Create User</button>
        </form>
      </div>
    </div>
  );
};

export default UserManagementPage;
