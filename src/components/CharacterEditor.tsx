import React, { useState } from 'react';
import { Palette, Sparkles, Download, Image as ImageIcon } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import { ImageUpload } from './ImageUpload';
import { ImageData } from '../types';
import { useUsage } from '../hooks/useUsage';
import { AlertCircle } from 'lucide-react';

export const CharacterEditor: React.FC = () => {
  const [charImg, setCharImg] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState('');
  const [bgOption, setBgOption] = useState('custom');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { isLimitReached } = useUsage();

  const handleGenerate = async () => {
    if (!charImg || !prompt.trim()) return;

    setLoading(true);
    setResults([]);
    const newResults: string[] = [];
    
    try {
      const bg = bgOption === 'white' ? "Solid white background" : "Contextual background";
      const fullPrompt = `Edit character: ${prompt}. Maintain identity and consistent features. ${bg}. High quality, 4k, digital art style.`;

      for (let i = 0; i < 4; i++) {
        const imageUrl = await geminiService.generateImage(
          `${fullPrompt} Variation ${i + 1}`,
          [{ data: charImg.base64, mimeType: charImg.mimeType }]
        );
        newResults.push(imageUrl);
        setResults([...newResults]);
        if (i < 3) await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Palette className="text-brand-primary" /> Edit Gambar Karakter
        </h2>
        <p className="text-slate-400 mt-2">Unggah karaktermu dan ubah gayanya atau posenya dengan konsisten.</p>
      </div>

      <BrandBanner />

      <div className="card p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold mb-3 text-slate-800">1. Unggah Karakter Asli</h3>
              <ImageUpload 
                value={charImg}
                onUpload={setCharImg}
                onRemove={() => setCharImg(null)}
                className="h-64"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold mb-3 text-slate-800">2. Instruksi Edit</h3>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="input-field min-h-[100px]"
                placeholder="Contoh: Buat karakter ini sedang memegang kamera, mengenakan topi merah..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-slate-800">3. Pilihan Background</label>
              <select 
                value={bgOption}
                onChange={(e) => setBgOption(e.target.value)}
                className="input-field"
              >
                <option value="custom">Sesuai Instruksi (Natural)</option>
                <option value="white">Background Putih Polos (PNG style)</option>
              </select>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !charImg || !prompt.trim() || isLimitReached}
              className={`btn-primary w-full ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {loading ? (
                <div className="loader-icon w-5 h-5 mr-2" />
              ) : isLimitReached ? (
                <AlertCircle className="w-5 h-5 mr-2" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {isLimitReached ? 'Limit Generate Tercapai' : 'Buat 4 Variasi Karakter'}
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 min-h-[400px]">
            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {results.map((url, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden shadow-sm bg-white">
                    <img src={url} className="w-full h-full object-cover" alt={`Result ${idx}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a href={url} download={`karakter_${idx+1}.png`} className="p-3 bg-white text-slate-900 rounded-full shadow-lg">
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
                {loading && results.length < 4 && (
                  <div className="aspect-square flex items-center justify-center bg-slate-200 animate-pulse rounded-lg">
                    <div className="loader-icon w-8 h-8" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Palette className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Hasil karakter baru akan muncul di sini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
