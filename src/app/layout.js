import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Quasarized | The Forensic Pharmacist & Educator",
  description: "Explore the intersection of Clinical Pharmacy and Forensics with Israel Mordechai. Access standardized Biology CBT exams, forensic case studies, and exclusive music production updates.",
  verification: {
    google: "zbGv6itW0PhPWXuP2AAJM9aHyJn3_TcJ1vqmJVDY2km", 
  },
  openGraph: {
    title: "Quasarized | Forensic Insights & Education Portal",
    description: "Decoding the silent killers in your medicine cabinet. Access the Educator's Lab for WAEC/JAMB Biology CBT practice and professional consultations.",
    url: "https://quasarized.vercel.app", 
    siteName: "Quasarized",
    images: [{ url: "https://quasarized.vercel.app/logo.png", width: 1200, height: 630 }],
    locale: "en_NG",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}