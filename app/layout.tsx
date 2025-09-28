import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Webtools by Minerva Juppiter",
  description: "Webtools by minerva-jupiter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
