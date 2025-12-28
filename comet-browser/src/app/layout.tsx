import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Import Inter
import "./globals.css";

import TitleBar from "@/components/TitleBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Comet Browser",
  description: "An AI-integrated browser application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-deep-space-bg pt-10 overflow-hidden h-screen`}>
        <TitleBar />
        {children}
      </body>
    </html>
  );
}
