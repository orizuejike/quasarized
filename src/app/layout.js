import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Quasarized | The Forensic Pharmacist",
  description: "Forensic and DNA Insights from Israel Mordechai. Bridging clinical pharmacy, death investigation, and standardized CBT education.",
  openGraph: {
    title: "Quasarized | The Forensic Pharmacist",
    description: "Forensic and DNA Insights from Israel Mordechai.",
    url: "https://quasarized.vercel.app", 
    siteName: "Quasarized",
    images: [
      {
        url: "https://quasarized.vercel.app/israel-profile.jpg", // Absolute URL for WhatsApp strict rules
        width: 1200,
        height: 630,
        alt: "Quasarized Platform Preview",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quasarized | The Forensic Pharmacist",
    description: "Forensic and DNA Insights from Israel Mordechai.",
    images: ["https://quasarized.vercel.app/israel-profile.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}