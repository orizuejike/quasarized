import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Quasarized | The Forensic Pharmacist",
  description: "Forensic and DNA Insights from Israel Mordechai. Bridging clinical pharmacy, death investigation, and standardized CBT education.",
  verification: {
    // I corrected this line to ONLY include the code from your screenshot
    google: "zbGv6itW0PhPWXuP2AAJM9aHyJn3_TcJ1vqmJVDY2km", 
  },
  openGraph: {
    title: "Quasarized | The Forensic Pharmacist",
    description: "Forensic and DNA Insights from Israel Mordechai.",
    url: "https://quasarized.vercel.app", 
    siteName: "Quasarized",
    images: [
      {
        url: "https://quasarized.vercel.app/logo.png",
        width: 1200,
        height: 630,
        alt: "Quasarized Platform Logo",
      }
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quasarized | The Forensic Pharmacist",
    description: "Forensic and DNA Insights from Israel Mordechai.",
    images: ["https://quasarized.vercel.app/logo.png"],
  },
};

// I also ensured the 'L' in Layout is capitalized here
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}