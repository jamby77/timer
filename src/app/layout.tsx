import "./globals.css";

import { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Timer App",
  description: "A versatile timer application for workouts and productivity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
