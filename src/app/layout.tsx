import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOBILE as WEBCAM",
  description: "Secure, low-latency mobile browser webcam streaming for Windows. Compatible with Microsoft Teams, Zoom, Google Meet, OBS Studio, and Discord.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased select-none">{children}</body>
    </html>
  );
}
