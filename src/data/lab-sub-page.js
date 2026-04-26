import React from 'react';
import { ArrowLeft, Microscope } from 'lucide-react';

export const metadata = {
  title: "Educator's Lab | Biology CBT",
  description: "Access standardized mock examinations and student resources.",
  openGraph: {
    images: [{ url: "https://quasarized.vercel.app/toxicology-report.jpg" }],
  },
};

export default function LabPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12 flex flex-col items-center">
        <a href="/" className="self-start flex items-center gap-2 text-cyan-400 mb-20"><ArrowLeft size={20}/> Back Home</a>
        <div className="w-20 h-20 bg-cyan-900/20 rounded-full flex items-center justify-center mb-6 border border-cyan-800">
            <Microscope className="text-cyan-400" size={40} />
        </div>
        <h1 className="text-4xl font-serif mb-4">Educator's Lab</h1>
        <p className="text-slate-400 text-center max-w-md">Please return to the Home page and use the "Lab" tab to log in and start your CBT examination.</p>
    </main>
  );
}