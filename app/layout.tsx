import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "To-Do — Catatan Kegiatan",
  description: "To-do list pribadi berbasis dictation & AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="relative min-h-full flex flex-col overflow-x-hidden">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-40 -left-32 size-[32rem] rounded-full bg-violet-700/25 blur-[120px]" />
          <div className="absolute top-1/3 -right-40 size-[28rem] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 size-[24rem] rounded-full bg-fuchsia-600/10 blur-[120px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
