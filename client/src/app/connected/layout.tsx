'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '@/store/slices/userSlice';
import { useRouter } from 'next/navigation';
import ConnectedLayout from '@/components/ConnectedLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/signin'); // or your signin path
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return <ConnectedLayout>{children}</ConnectedLayout>;
}
