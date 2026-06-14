import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karan88 Exports — Furniture Catalogue",
  description: "Premium Mango Wood, Acacia & Sheesham furniture from New Delhi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
