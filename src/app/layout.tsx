import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoonWhale Voice-Over | Iraqi Arabic Text-to-Speech",
  description: "Professional Iraqi Arabic text-to-speech service powered by AI. Convert your text to natural-sounding Iraqi Arabic voice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <AuthProvider>
          <Navbar />
          <div className="px-4 sm:px-8 md:px-16 lg:px-32">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
