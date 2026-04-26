import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// --- THE WHATSAPP & SOCIAL MEDIA PREVIEW ENGINE ---
export const metadata = {
  title: "Quasarized | The Forensic Pharmacist",
  description: "Forensic and DNA Insights from Israel Mordechai. Bridging clinical pharmacy, death investigation, and standardized CBT education.",
  openGraph: {
    title: "Quasarized | The Forensic Pharmacist",
    description: "Forensic and DNA Insights from Israel Mordechai. Bridging clinical pharmacy, death investigation, and standardized CBT education.",
    url: "https://quasarized-platform.vercel.app", // This is your general Vercel domain
    siteName: "Quasarized",
    images: [
      {
        url: "/israel-profile.jpg", // This tells WhatsApp to use your profile picture as the thumbnail
        width: 1200,
        height: 630,
        alt: "Quasarized Platform Preview",
      },
    ],
    locale: "en_NG", // Optimized for Nigerian traffic
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quasarized | The Forensic Pharmacist",
    description: "Forensic and DNA Insights from Israel Mordechai.",
    images: ["/israel-profile.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}