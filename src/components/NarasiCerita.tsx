import React, { useState } from 'react';
import { BookOpen, PenTool, Copy, Check, Sparkles } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';

export const NarasiCerita: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('');
  const [format, setFormat] = useState('Script Video Pendek');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExample = () => {
    setTopic('Perjuangan merintis usaha kopi susu dari nol yang sempat sepi berbulan-bulan, lalu akhirnya viral.');
    setStyle('Emosional, Inspiratif, Sedikit Humoris');
    setFormat('Script Video Pendek');
    setMessage('Konsistensi adalah kunci, jangan menyerah di saat paling gelap.');
    setReference('Hook: Dulu aku kira jualan kopi itu gampang...\nBody: Ternyata ekspektasi tak seindah realita...\nCTA: Buat kalian yang lagi berjuang, semangat ya!');
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const prompt = `Buatkan naskah / narasi cerita dengan detail berikut:
Topik: ${topic}
Gaya Penyampaian: ${style || 'Natural'}
Format Output: ${format}
Pesan Utama: ${message || 'Tidak ada pesan spesifik'}

${reference ? `SANGAT PENTING: Tiru gaya bahasa, struktur kalimat, dan flow dari contoh naskah berikut ini secara persis:\n"""\n${reference}\n"""\n` : ''}

Tuliskan naskahnya sekarang, langsung ke konten tanpa intro/basa-basi.`;

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
          <BookOpen className="text-brand-primary" /> Narasi Cerita
        </h2>
        <p className="text-slate-400 mt-2">Buat script atau naskah cerita yang menyentuh dan engaging.</p>
      </div>

      <BrandBanner />

      <div className="card p-6 md:p-8 space-y-6">
        <div className="flex justify-end">
          <button 
            onClick={handleExample}
            className="text-xs font-bold text-brand-primary border border-brand-primary/20 px-3 py-1.5 rounded-full hover:bg-brand-primary/5 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Isian Contoh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-lg font-semibold mb-2 text-slate-800">1. Topik / Ide Cerita</label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-field min-h-[80px]"
              placeholder="Contoh: Perjuangan barista merintis kedai kopi sendiri..."
            />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2 text-slate-800">2. Gaya Penyampaian</label>
            <input 
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="input-field"
              placeholder="Contoh: Emosional, Lucu, Inspiratif"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2 text-slate-800">3. Format Output</label>
            <select 
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="input-field"
            >
              <option value="Script Video Pendek">Script Video Pendek (TikTok/Reels)</option>
              <option value="Thread Twitter">Thread Twitter (Kul-Twit)</option>
              <option value="Caption Instagram">Caption Instagram (Storytelling)</option>
              <option value="LinkedIn Post">LinkedIn Post (Profesional)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-lg font-semibold mb-2 text-slate-800">4. Pesan Utama</label>
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field"
              placeholder="Contoh: Jangan takut gagal, teruslah mencoba"
            />
          </div>
        </div>

        <div className="bg-brand-primary/5 p-6 rounded-xl border border-brand-primary/10">
          <label className="block text-lg font-bold mb-1 text-slate-900">5. Contoh Naskah / Referensi Gaya (Disarankan)</label>
          <p className="text-xs text-slate-500 mb-3">Tempelkan contoh naskah dengan gaya yang Anda inginkan. AI akan meniru struktur dan tone-nya.</p>
          <textarea 
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="input-field min-h-[120px] bg-white"
            placeholder="Paste naskah contoh di sini..."
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="btn-primary w-full text-lg"
        >
          {loading ? (
            <><div className="loader-icon w-5 h-5 mr-2" /> Menulis Narasi...</>
          ) : (
            <><PenTool className="w-5 h-5 mr-2" /> Buat Narasi Sesuai Gaya</>
          )}
        </button>
      </div>

      {result && (
        <div className="card p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">Hasil Narasi</h3>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'TERSALIN' : 'SALIN'}
            </button>
          </div>
          <div className="whitespace-pre-wrap text-slate-800 leading-relaxed font-sans">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};
