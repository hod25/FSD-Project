"use client";

import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>ProSafe</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.videoContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="http://localhost:8000/video"
            alt="Live Detection Stream"
            className={styles.videoStream}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} ProSafe AI</p>
      </footer>
    </div>
  );
}
