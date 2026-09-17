import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoSync AI | Autohaus Frisch",
  description: "Synchronizing physical workshops with digital operations",
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
