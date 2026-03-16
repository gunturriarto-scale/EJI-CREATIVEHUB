import React, { useState } from 'react';
import { TrendingUp, Zap, Copy, Check } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import ReactMarkdown from 'react-markdown';

export const RisetIde: React.FC = () => {
  const [theme, setTheme] = useState('Bisnis & Keuangan');
  const [angle, setAngle] = useState('Analisis Keuntungan & Cuan');
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const themes = [
    'Bisnis & Keuangan', 'Umum & Lifestyle', 'Kesehatan & Wellness', 
    'Teknologi & AI', 'Kuliner & Viral Food', 'Fashion & Beauty', 
    'Edukasi & Self Growth', 'Hiburan & Pop Culture'
  ];

  const angles = [
    'Analisis Keuntungan & Cuan', 'Edukasi Lucu & Relatable', 'Tips & Trik Cepat',
    'Perbandingan & Battle', 'POV & Komedi Situasi', 'Behind The Scene & Proses'
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const prompt = `Lakukan riset berita dan tren ekonomi/bisnis/lifestyle yang sedang SANGAT PANAS dan VIRAL di Indonesia hari ini. 
      Tema: "${theme}". Angle Pembahasan: "${angle}".
      
      Instruksi Khusus: 
      - Jika tema adalah Bisnis, prioritaskan topik seperti: Analisis cuan Makan Bergizi Gratis (MBG), tren Lapangan Padel, perbandingan jualan Bakso/Gorengan vs Franchise.
      - Berikan data angka perkiraan (simulasi cuan) jika relevan.
      - Struktur jawaban harus rapi dengan Markdown (### untuk Header).
      
      Permintaan User: "${request || 'Berikan topik paling viral hari ini'}".`;

      const text = await geminiService.generateText(prompt);
      setResult(text);
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <TrendingUp className="text-brand-primary" /> Riset Ide Viral & Tren
        </h2>
        <p className="text-slate-400 mt-2">Temukan topik panas hari ini untuk strategi Instagram & TikTok Anda.</p>
      </div>

      <BrandBanner />

      <div className="card p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-lg font-semibold mb-3 text-slate-800">1. Pilih Tema Topik</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {themes.map(t => (
              <button 
                key={t}
                onClick={() => setTheme(t)}
                className={`option-btn text-xs md:text-sm ${theme === t ? 'selected' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold mb-3 text-slate-800">2. Pilih Angle Pembahasan</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {angles.map(a => (
              <button 
                key={a}
                onClick={() => setAngle(a)}
                className={`option-btn text-xs md:text-sm ${angle === a ? 'selected' : ''}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold mb-3 text-slate-800">3. Permintaan Khusus (Opsional)</label>
          <textarea 
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            className="input-field min-h-[100px]"
            placeholder="Contoh: Cari berita tentang Makan Bergizi Gratis (MBG) atau bisnis Lapangan Padel yang lagi hot..."
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full text-lg"
        >
          {loading ? (
            <><div className="loader-icon w-5 h-5 mr-2" /> Menganalisis Tren...</>
          ) : (
            <><Zap className="w-5 h-5 mr-2 fill-current" /> Riset Ide Viral Sekarang</>
          )}
        </button>
      </div>

      {result && (
        <div className="card p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">📊 Strategi Konten Panas</h3>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'TERSALIN' : 'SALIN SEMUA'}
            </button>
          </div>
          <div className="markdown-body">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
