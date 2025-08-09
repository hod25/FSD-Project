import React from 'react';
import { FaUsers, FaUserShield, FaUser, FaUserTie } from 'react-icons/fa';
import styles from './UserSummary.module.css';

interface UserSummaryProps {
  userAnalytics: {
    admin: number;
    viewer: number;
    supervisor: number;
    total: number;
  };
}

const UserSummary: React.FC<UserSummaryProps> = ({ userAnalytics }) => {
  // Ensure userAnalytics has default values
  const safeUserAnalytics = {
    admin: userAnalytics?.admin || 0,
    viewer: userAnalytics?.viewer || 0,
    supervisor: userAnalytics?.supervisor || 0,
    total: userAnalytics?.total || 0
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>👥 User Summary</h3>
      <div className={styles.userCards}>
        <div className={styles.userCard}>
          <div className={styles.iconContainer}>
            <FaUsers className={styles.icon} />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userCount}>{safeUserAnalytics.total}</div>
            <div className={styles.userLabel}>Total Users</div>
          </div>
        </div>
        
        <div className={styles.userCard}>
          <div className={styles.iconContainer}>
            <FaUserShield className={styles.icon} />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userCount}>{safeUserAnalytics.admin}</div>
            <div className={styles.userLabel}>Admins</div>
          </div>
        </div>
        
        <div className={styles.userCard}>
          <div className={styles.iconContainer}>
            <FaUser className={styles.icon} />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userCount}>{safeUserAnalytics.viewer}</div>
            <div className={styles.userLabel}>Viewers</div>
          </div>
        </div>
        
        <div className={styles.userCard}>
          <div className={styles.iconContainer}>
            <FaUserTie className={styles.icon} />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userCount}>{safeUserAnalytics.supervisor}</div>
            <div className={styles.userLabel}>Supervisors</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSummary; 