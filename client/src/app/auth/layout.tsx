'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectIsLoggedIn } from '@/store/slices/userSlice';

export default function UnauthenticatedLayout({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/connected/dashboard');
    } else {
      setChecking(false);
    }
  }, [isLoggedIn, router]);

  if (checking) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '18px',
          color: '#555',
          background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%)',
        }}
      >
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(209, 135, 0, 0.1)',
            borderRadius: '50%',
            borderTop: '3px solid #d18700',
            animation: 'spin 1s linear infinite',
            marginBottom: '15px',
          }}
        />
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
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
