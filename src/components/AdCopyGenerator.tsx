import React, { useState } from 'react';
import { FileText, Sparkles, Copy, Check, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import { ImageUpload } from './ImageUpload';
import { ImageData } from '../types';

export const AdCopyGenerator: React.FC = () => {
  const [tab, setTab] = useState<'manual' | 'design'>('manual');
  const [productName, setProductName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('Profesional');
  const [outputType, setOutputType] = useState('Caption Instagram');
  const [manualImg, setManualImg] = useState<ImageData | null>(null);
  const [designImg, setDesignImg] = useState<ImageData | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  const handleGetRecommendations = async () => {
    if (!manualImg) return;
    setRecLoading(true);
    try {
      const text = await geminiService.generateText(
        "Berdasarkan gambar produk ini, berikan 3 ide caption singkat dan 3 ide visual photoshoot yang menarik. Format: Ide 1: ..., Ide 2: ...",
        { data: manualImg.base64, mimeType: manualImg.mimeType }
      );
      setRecommendations(text.split('\n').filter(t => t.trim()));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRecLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      let prompt = "";
      let img = null;

      if (tab === 'manual') {
        prompt = `Buatkan ${outputType} untuk produk bernama "${productName}".
Kata Kunci: ${keywords}
Gaya Bahasa: ${tone}.
Berikan hasil yang kreatif, menarik, dan menggunakan formatting yang rapi.`;
        img = manualImg;
      } else {
        prompt = `Berdasarkan desain iklan ini, buatkan 3 opsi caption yang menarik dengan gaya bahasa ${tone}.`;
        img = designImg;
      }

      const text = await geminiService.generateText(
        prompt, 
        img ? { data: img.base64, mimeType: img.mimeType } : undefined
      );
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
          <FileText className="text-brand-primary" /> Bikin Caption & Ide
        </h2>
      </div>

      <BrandBanner />

      <div className="card overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setTab('manual')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'manual' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Buat Manual
          </button>
          <button 
            onClick={() => setTab('design')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'design' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Buat dari Desain
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {tab === 'manual' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-3 text-slate-800">1. Unggah Foto Produk (Opsional)</h3>
                <ImageUpload 
                  value={manualImg}
                  onUpload={setManualImg}
                  onRemove={() => setManualImg(null)}
                  className="h-48"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-800">2. Nama Produk</label>
                  <input 
                    type="text" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="input-field"
                    placeholder="Contoh: Kopi Susu Gula Aren"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-800">3. Kata Kunci</label>
                  <input 
                    type="text" 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="input-field"
                    placeholder="Contoh: Segar, Murah, Viral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-800">4. Gaya Bahasa</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-field">
                    <option value="Profesional">Profesional</option>
                    <option value="Santai">Santai</option>
                    <option value="Inspiratif">Inspiratif</option>
                    <option value="Humoris">Humoris</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-800">5. Jenis Teks</label>
                  <select value={outputType} onChange={(e) => setOutputType(e.target.value)} className="input-field">
                    <option value="Caption Instagram">Caption Instagram</option>
                    <option value="Deskripsi Produk">Deskripsi Produk</option>
                    <option value="Script Iklan TikTok">Script Iklan TikTok</option>
                  </select>
                </div>
              </div>
              
              {manualImg && (
                <button 
                  onClick={handleGetRecommendations}
                  disabled={recLoading}
                  className="w-full py-2.5 bg-brand-primary/10 text-brand-primary font-bold rounded-lg border border-brand-primary/20 hover:bg-brand-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {recLoading ? <div className="loader-icon w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
                  Dapatkan Rekomendasi AI dari Gambar
                </button>
              )}

              {recommendations.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                  {recommendations.map((rec, i) => (
                    <p key={i} className="text-xs text-slate-600">• {rec}</p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <h3 className="text-sm font-bold mb-3 text-slate-800 text-center">1. Unggah Desain Iklan</h3>
                <ImageUpload 
                  value={designImg}
                  onUpload={setDesignImg}
                  onRemove={() => setDesignImg(null)}
                  icon={<ImageIcon className="w-10 h-10 text-slate-400" />}
                  className="h-64"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-800">2. Gaya Bahasa</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-field">
                  <option value="Profesional">Profesional</option>
                  <option value="Santai">Santai</option>
                  <option value="Inspiratif">Inspiratif</option>
                </select>
              </div>
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={loading || (tab === 'manual' && !productName.trim()) || (tab === 'design' && !designImg)}
            className="btn-primary w-full text-lg"
          >
            {loading ? <div className="loader-icon w-5 h-5 mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
            Buat Teks Iklan
          </button>
        </div>
      </div>

      {result && (
        <div className="card p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">Hasil Teks Iklan</h3>
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
