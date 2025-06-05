"use client";
import React, { useEffect, useState } from "react";
import { getCurrentUser, register, updateUserProfile } from "@/services/userService";
import { useRouter } from "next/navigation";
import { UserData, RegisterCredentials } from "@/services/userService";
import styles from "./page.module.css";

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState<RegisterCredentials>({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch current user and check admin access
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        if (user.access_level?.toLowerCase() !== "admin") {
          router.replace("/connected/home");
        } else {
          fetchUsers();
        }
      })
      .catch(() => {
        router.replace("/auth/signin");
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
      setNewUser({ name: "", email: "", password: "" });
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className={styles.profileContainer}>
      <h1>ניהול משתמשים</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleCreateUser} className={styles.createUserForm}>
        <h2>יצירת משתמש חדש</h2>
        <input name="name" placeholder="שם" value={newUser.name} onChange={handleInputChange} required />
        <input name="email" placeholder="אימייל" value={newUser.email} onChange={handleInputChange} required />
        <input name="password" placeholder="סיסמה" type="password" value={newUser.password} onChange={handleInputChange} required />
        <button type="submit">צור משתמש</button>
      </form>
      <h2>רשימת משתמשים</h2>
      {loading ? (
        <div>טוען...</div>
      ) : (
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>שם</th>
              <th>אימייל</th>
              <th>הרשאה</th>
              <th>מיקום</th>
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
  );
};

export default UserManagementPage;
