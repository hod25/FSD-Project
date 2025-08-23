'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectIsLoggedIn } from '@/shared/store/slices/userSlice';
import { ConnectedLayout } from '@/shared/ui/layout';

export default function ConnectedRootLayout({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const router = useRouter();

  useEffect(() => {
    // Global check - if not logged in, redirect to login page
    if (!isLoggedIn) {
      router.replace('/auth/signin');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f0f0f0',
            borderTop: '5px solid #d18700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />

        <p
          style={{
            fontSize: '16px',
            color: '#666',
          }}
        >
          Redirecting...
        </p>

        <style>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return <ConnectedLayout>{children}</ConnectedLayout>;
}
