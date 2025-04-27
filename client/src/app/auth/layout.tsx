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
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '18px',
          color: '#555',
        }}
      >
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
