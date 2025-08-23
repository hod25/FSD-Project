'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectIsLoggedIn } from '@/shared/store/slices/userSlice';

export default function UnauthenticatedLayout({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/connected/home');
    } else {
      setCheckingAuth(false);
    }
  }, [isLoggedIn, router]);

  if (checkingAuth) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner} />
        <p style={styles.text}>Loading...</p>

        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}

// ===== Inline Styles =====
const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid rgba(209, 135, 0, 0.2)',
    borderRadius: '50%',
    borderTop: '3px solid #d18700',
    animation: 'spin 1s linear infinite',
    marginBottom: '12px',
  },
  text: {
    fontSize: '16px',
    color: '#666',
  },
};
