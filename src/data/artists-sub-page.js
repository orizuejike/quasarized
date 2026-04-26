import React from 'react';
import { artists } from '@/data/artist';
import { Music, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: "Quasarized Artists | Afrobeat Promotion",
  description: "Exclusive music production and promotion for the next generation of artists.",
  openGraph: {
    images: [{ url: "https://quasarized.vercel.app/masko-profile.jpg" }],
  },
};

export default function ArtistsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="flex items-center gap-2 text-cyan-400 mb-12"><ArrowLeft size={20}/> Back Home</a>
        <h1 className="text-5xl font-serif mb-12">Label & Production</h1>
        <div className="space-y-12">
          {artists.map((artist, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center gap-8 bg-slate-900 p-8 rounded-3xl border border-slate-800">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-slate-700 shrink-0">
                <img src={artist.image} alt={artist.name} className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-serif mb-2">{artist.name}</h2>
                <p className="text-cyan-400 tracking-widest uppercase text-sm mb-6 font-bold">Promoted Artist</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {artist.links.map((link, i) => (
                    <a key={i} href={link.url} className="bg-slate-950 border border-slate-800 px-6 py-2 rounded-full flex items-center gap-2 hover:border-cyan-500 transition-colors">
                      <Music size={16}/> {link.name}
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