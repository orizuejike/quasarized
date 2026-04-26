import React from 'react';
import { artists } from '@/data/artist';
import { Music, ExternalLink, ArrowLeft } from 'lucide-react';

// --- CUSTOM PREVIEW FOR THIS PAGE ONLY ---
export const metadata = {
  title: "Quasarized | Promoted Artists & Production",
  description: "Meet the next big names in Afrobeat. Exclusive music promotion and production by Quasarized.",
  openGraph: {
    images: [{ url: "https://quasarized.vercel.app/masko-profile.jpg" }], // Custom image for this link!
  },
};

export default function ArtistsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="flex items-center gap-2 text-cyan-400 mb-12 hover:text-cyan-300">
          <ArrowLeft size={20} /> Back to Quasarized Home
        </a>
        
        <h1 className="font-serif text-5xl text-white mb-6">Label & Production.</h1>
        <p className="text-lg text-slate-400 mb-16">
          Beyond the laboratory, I provide exclusive music promotion and audio production for a select roster of artists.
        </p>

        <div className="space-y-16">
          {artists.map((artist, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-8 items-center bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-slate-700 bg-slate-800">
                <img src={artist.image} alt={artist.name} className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-serif text-4xl text-white mb-2">{artist.name}</h3>
                <p className="text-cyan-400 font-sans tracking-widest text-sm mb-6 uppercase">Promoted Artist</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {artist.links.map((link, lIdx) => (
                    <a key={lIdx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-6 py-2 rounded-full text-slate-300 hover:text-white hover:border-cyan-500 transition-colors">
                      <Music size={16} /> {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}