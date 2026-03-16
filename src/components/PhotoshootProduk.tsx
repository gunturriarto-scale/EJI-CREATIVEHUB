import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Download, Package, User, Wand2, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import { ImageUpload } from './ImageUpload';
import { ImageData } from '../types';
import { useUsage } from '../hooks/useUsage';

export const PhotoshootProduk: React.FC = () => {
  const [tab, setTab] = useState<'product' | 'model'>('product');
  const [productImg, setProductImg] = useState<ImageData | null>(null);
  const [modelImg, setModelImg] = useState<ImageData | null>(null);
  
  const [lighting, setLighting] = useState('Soft Lighting');
  const [mood, setMood] = useState('Clean & Minimalist');
  const [theme, setTheme] = useState('Marble Surface');
  const [prompt, setPrompt] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { isLimitReached } = useUsage();

  const handleMagicPrompt = async () => {
    if (!productImg) return;
    setMagicLoading(true);
    try {
      const context = tab === 'product' ? 'product photography' : 'fashion photoshoot with a model';
      const text = await geminiService.generateText(
        `Create a highly detailed professional ${context} prompt. 
         Lighting: ${lighting}. 
         Mood: ${mood}. 
         Background/Theme: ${theme}. 
         Focus on high-end commercial quality, photorealistic details, and elegant composition.`,
        { data: productImg.base64, mimeType: productImg.mimeType }
      );
      setPrompt(text.trim());
    } catch (e: any) {
      alert(e.message);
    } finally {
      setMagicLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!productImg) return;
    if (tab === 'model' && !modelImg) return;

    setLoading(true);
    setResults([]);
    const newResults: string[] = [];
    
    try {
      const inputImages = tab === 'product' ? [productImg] : [productImg, modelImg!];
      
      // Construct final prompt: use custom prompt if available, otherwise use options
      const finalPrompt = prompt.trim() 
        ? prompt 
        : `Professional ${tab === 'product' ? 'product photography' : 'fashion photoshoot with a model'}. Lighting: ${lighting}. Mood: ${mood}. Background/Theme: ${theme}.`;

      for (let i = 0; i < 4; i++) {
        const imageUrl = await geminiService.generateImage(
          `${finalPrompt}. Variation ${i + 1}. High quality, 4k, photorealistic.`,
          inputImages.map(img => ({ data: img.base64, mimeType: img.mimeType }))
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <ShoppingBag className="text-brand-primary" /> Photoshoot Produk
        </h2>
      </div>

      <BrandBanner />

      <div className="card overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setTab('product')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'product' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Produk Saja
          </button>
          <button 
            onClick={() => setTab('model')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'model' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Produk + Model
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold mb-3 text-slate-800">Foto Produk</h3>
                  <ImageUpload 
                    value={productImg}
                    onUpload={setProductImg}
                    onRemove={() => setProductImg(null)}
                    icon={<Package className="w-8 h-8 text-slate-400" />}
                    className="h-48"
                  />
                </div>
                {tab === 'model' && (
                  <div>
                    <h3 className="text-sm font-bold mb-3 text-slate-800">Foto Model</h3>
                    <ImageUpload 
                      value={modelImg}
                      onUpload={setModelImg}
                      onRemove={() => setModelImg(null)}
                      icon={<User className="w-8 h-8 text-slate-400" />}
                      className="h-48"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pencahayaan</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Soft Lighting', 'Studio Lighting', 'Natural Sunlight', 'Cinematic', 'Neon/Cyber', 'Golden Hour'].map(l => (
                      <button key={l} onClick={() => setLighting(l)} className={`option-btn text-[10px] py-1.5 ${lighting === l ? 'selected' : ''}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Suasana</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Clean & Minimalist', 'Luxurious', 'Rustic', 'Vibrant', 'Dark & Moody', 'Elegant'].map(m => (
                      <button key={m} onClick={() => setMood(m)} className={`option-btn text-[10px] py-1.5 ${mood === m ? 'selected' : ''}`}>{m}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tema Background</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Marble Surface', 'Wooden Table', 'Podium', 'Nature/Garden', 'Urban/Street', 'Luxury Interior', 'Beach', 'Mountain'].map(t => (
                      <button key={t} onClick={() => setTheme(t)} className={`option-btn text-[10px] py-1.5 ${theme === t ? 'selected' : ''}`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Instruksi Photoshoot</label>
                  <button 
                    onClick={handleMagicPrompt}
                    disabled={magicLoading || !productImg}
                    className="flex items-center gap-1 text-[10px] font-bold text-brand-primary hover:underline disabled:opacity-50"
                  >
                    {magicLoading ? <div className="loader-icon w-3 h-3" /> : <Wand2 className="w-3 h-3" />}
                    Buat Prompt Otomatis
                  </button>
                </div>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="input-field min-h-[100px] text-sm"
                  placeholder="Klik 'Buat Prompt Otomatis' atau tulis instruksi kustom di sini..."
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !productImg || (tab === 'model' && !modelImg) || isLimitReached}
                className={`btn-primary w-full ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {loading ? (
                  <div className="loader-icon w-5 h-5 mr-2" />
                ) : isLimitReached ? (
                  <AlertCircle className="w-5 h-5 mr-2" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isLimitReached ? 'Limit Generate Tercapai' : 'Buat 4 Variasi Photoshoot'}
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 min-h-[400px]">
              {results.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {results.map((url, idx) => (
                    <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden shadow-sm bg-white">
                      <img src={url} className="w-full h-full object-cover" alt={`Result ${idx}`} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a href={url} download={`photoshoot_${idx+1}.png`} className="p-2 bg-white text-slate-900 rounded-full shadow-lg">
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {loading && results.length < 4 && (
                    <div className="aspect-square flex items-center justify-center bg-slate-200 animate-pulse rounded-lg">
                      <div className="loader-icon w-6 h-6" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">Hasil photoshoot akan muncul di sini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
