import "./globals.css";

import { ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { Metadata } from "next";
import { Inter } from "next/font/google";

import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Timer App",
  description: "A versatile timer application for workouts and productivity",
};

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <main className="bg-background">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;
