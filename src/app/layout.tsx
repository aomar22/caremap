import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareMap — find the right health service in Ontario",
  description:
    "A bilingual (English / Arabic) guide to Ontario health services: OHIP, Health811, family doctors, walk-in clinics, urgent care and pharmacists. General information only, not medical advice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
