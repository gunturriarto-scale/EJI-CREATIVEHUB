import React from 'react';
import { BrandBanner } from './BrandBanner';
import { Video, ExternalLink, PlayCircle, Info } from 'lucide-react';

interface VideoPlatform {
  name: string;
  link: string;
  tutorial: string;
  description: string;
}

const platforms: VideoPlatform[] = [
  {
    name: 'Gemini',
    link: 'https://gemini.google.com/app',
    tutorial: 'https://youtu.be/bbsygrmRqMs?si=jSrCdPtsubSBRSkC',
    description: 'AI multimodal dari Google yang mendukung pembuatan skrip dan ide video kreatif.'
  },
  {
    name: 'Grok Ai',
    link: 'https://grok.com',
    tutorial: 'https://youtu.be/Pq4VWxd98ns?si=q7PdTB0bDjWTDhV0',
    description: 'AI dari xAI (Elon Musk) yang terintegrasi dengan data real-time dari platform X.'
  },
  {
    name: 'Gemini Flow',
    link: 'https://labs.google/fx/tools/flow',
    tutorial: 'https://youtu.be/l7PiIiPP84o?si=zrn8ZgdZ7vcv7wz9',
    description: 'Alat eksperimental dari Google Labs untuk alur kerja kreatif berbasis AI.'
  },
  {
    name: 'Pixverse AI',
    link: 'https://app.pixverse.ai/onboard',
    tutorial: 'https://youtu.be/iCeI1MX-WdQ?si=ndFOBfvVSc8pd7N-',
    description: 'Platform khusus untuk generate video sinematik berkualitas tinggi dari teks atau gambar.'
  },
  {
    name: 'Meta AI',
    link: 'https://www.meta.ai',
    tutorial: 'https://www.youtube.com/watch?v=DC3sDw8kAyo&feature=youtu.be',
    description: 'Asisten AI dari Meta yang mendukung berbagai pembuatan konten kreatif di ekosistem Facebook/Instagram.'
  }
];

export const VideoGenerator: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Video className="text-brand-primary" /> Generate Video AI
        </h2>
        <p className="text-slate-400 mt-2">Akses platform terbaik untuk membuat video AI dan pelajari cara penggunaannya.</p>
      </div>

      <BrandBanner />

      <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-4 flex items-start gap-3 max-w-3xl mx-auto">
        <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
        <p className="text-xs text-brand-primary leading-relaxed">
          Gunakan platform di bawah ini untuk membuat video AI berkualitas tinggi. Kami menyediakan tautan langsung ke platform dan video tutorial untuk membantu Anda memulai.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform, idx) => (
          <div key={idx} className="card p-6 flex flex-col h-full border-white/5 hover:border-brand-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-brand-primary/10 rounded-xl">
                <Video className="w-6 h-6 text-brand-primary" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform {idx + 1}</span>
            </div>
            
            <h3 className="text-xl font-bold text-blue-600 mb-2 group-hover:text-brand-primary transition-colors">{platform.name}</h3>
            <p className="text-sm text-slate-400 mb-6 flex-grow">{platform.description}</p>
            
            <div className="space-y-3">
              <a 
                href={platform.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-brand-primary hover:text-white transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Buka Platform
              </a>
              <a 
                href={platform.tutorial} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 text-white font-bold rounded-xl border border-white/10 hover:bg-slate-700 transition-all"
              >
                <PlayCircle className="w-4 h-4" /> Video Tutorial
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
