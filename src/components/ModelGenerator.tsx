import React, { useState } from 'react';
import { UserPlus, Sparkles, Download, Wand2, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import { useUsage } from '../hooks/useUsage';

export const ModelGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [setting, setSetting] = useState('flat_bg');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [magicLoading, setMagicLoading] = useState(false);
  const { isLimitReached } = useUsage();

  const handleRandom = async () => {
    setMagicLoading(true);
    try {
      const text = await geminiService.generateText(
        "Buatkan deskripsi fisik model fashion wanita/pria Indonesia secara acak dan detail (rambut, pakaian, pose, background). Gunakan Bahasa Indonesia yang natural dan deskriptif."
      );
      setPrompt(text.trim());
    } catch (e: any) {
      alert(e.message);
    } finally {
      setMagicLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResults([]);
    const newResults: string[] = [];
    
    try {
      const settingText = setting === 'flat_bg' ? "Solid flat background" : setting === 'scenic_bg' ? "Scenic outdoor background" : "Holding a generic product";
      const fullPrompt = `Professional fashion model photography. ${prompt}. ${settingText}. High quality, 4k, photorealistic.`;

      for (let i = 0; i < 4; i++) {
        const imageUrl = await geminiService.generateImage(`${fullPrompt} Variation ${i + 1}`);
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
          <UserPlus className="text-brand-primary" /> Buat Model AI
        </h2>
        <p className="text-slate-400 mt-2">Jelaskan model yang Anda inginkan, atau biarkan AI berkreasi.</p>
      </div>

      <BrandBanner />

      <div className="card p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2 text-slate-800">Pengaturan Model</label>
            <select 
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              className="input-field"
            >
              <option value="flat_bg">Model dengan background flat</option>
              <option value="scenic_bg">Model dengan background pemandangan</option>
              <option value="with_product">Model dengan produk generik</option>
            </select>
          </div>
          <div className="relative">
            <label className="block font-semibold mb-2 text-slate-800">Deskripsi Model</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-field min-h-[120px] pr-12"
              placeholder="Contoh: Model wanita Indonesia dengan rambut panjang bergelombang, mengenakan kebaya modern warna emerald, pose elegan..."
            />
            <button 
              onClick={handleRandom}
              disabled={magicLoading}
              className="absolute right-3 bottom-3 p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              title="Buat Deskripsi Acak"
            >
              {magicLoading ? <div className="loader-icon w-4 h-4" /> : <Wand2 className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || isLimitReached}
          className={`btn-primary w-full text-lg ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        >
          {loading ? (
            <div className="loader-icon w-5 h-5 mr-2" />
          ) : isLimitReached ? (
            <AlertCircle className="w-5 h-5 mr-2" />
          ) : (
            <Sparkles className="w-5 h-5 mr-2" />
          )}
          {isLimitReached ? 'Limit Generate Tercapai' : 'Buat 4 Model (Variasi Pose)'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center text-white">Hasil Foto Model</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.map((url, idx) => (
              <div key={idx} className="card group relative aspect-[3/4] overflow-hidden">
                <img src={url} className="w-full h-full object-cover" alt={`Model ${idx}`} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a href={url} download={`model_${idx+1}.png`} className="p-3 bg-white text-slate-900 rounded-full shadow-lg">
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
            {loading && results.length < 4 && (
              <div className="card aspect-[3/4] flex items-center justify-center bg-slate-800/50 border-slate-700">
                <div className="loader-icon w-8 h-8" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
