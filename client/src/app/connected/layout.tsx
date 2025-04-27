// 'use client';

// import { useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useRouter, usePathname } from 'next/navigation';
// import { selectIsLoggedIn } from '@/store/slices/userSlice';
// import ConnectedLayout from '@/components/ConnectedLayout';

// export default function ConnectedRootLayout({ children }: { children: React.ReactNode }) {
//   const isLoggedIn = useSelector(selectIsLoggedIn);
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (!isLoggedIn && pathname !== '/auth/signin') {
//       router.replace('/auth/signin');
//     }
//   }, [isLoggedIn, pathname, router]);

//   if (!isLoggedIn) {
//     return (
//       <div
//         style={{
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//           gap: '12px',
//         }}
//       >
//         <div
//           style={{
//             width: '50px',
//             height: '50px',
//             border: '5px solid #ccc',
//             borderTop: '5px solid #0070f3',
//             borderRadius: '50%',
//             animation: 'spin 1s linear infinite',
//           }}
//         />

//         <p
//           style={{
//             fontSize: '16px',
//             color: '#666',
//           }}
//         >
//           Loading...
//         </p>

//         <style>{`
//           @keyframes spin {
//             to {
//               transform: rotate(360deg);
//             }
//           }
//         `}</style>
//       </div>
//     );
//   }

//   return <ConnectedLayout>{children}</ConnectedLayout>;
// }

'use client';

import ConnectedLayout from '@/components/ConnectedLayout';

export default function ConnectedRootLayout({ children }: { children: React.ReactNode }) {
  // Temporary: Always assume the user is logged in for development

  return <ConnectedLayout>{children}</ConnectedLayout>;
}
