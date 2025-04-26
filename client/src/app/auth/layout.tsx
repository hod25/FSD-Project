'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '@/store/slices/userSlice';
import { useRouter } from 'next/navigation';

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
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
