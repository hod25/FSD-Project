import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// הטמעת פונטים מגוגל עם משתנים מותאמים
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// מטאדאטה שתופיע בכותרת הדף
export const metadata: Metadata = {
  title: "ProSafe – Live Detection",
  description: "Live helmet detection powered by YOLO & FastAPI",
};

// Layout ראשי – עוטף את כל הדפים
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
