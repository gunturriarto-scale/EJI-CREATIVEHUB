import React, { useState } from 'react';
import { Type, Sparkles, Download, Wand2, LayoutTemplate, Image as ImageIcon } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import { ImageUpload } from './ImageUpload';
import { ImageData } from '../types';
import { useUsage } from '../hooks/useUsage';
import { AlertCircle } from 'lucide-react';

export const BannerGenerator: React.FC = () => {
  const [productImg, setProductImg] = useState<ImageData | null>(null);
  const [refImg, setRefImg] = useState<ImageData | null>(null);
  const [text, setText] = useState('');
  const [style, setStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [magicLoading, setMagicLoading] = useState(false);
  const { isLimitReached } = useUsage();

  const handleMagicFill = async (type: 'text' | 'style') => {
    if (!productImg) return;
    setMagicLoading(true);
    try {
      const prompt = type === 'text' 
        ? "Buatkan teks iklan singkat, catchy, dan persuasif untuk banner promosi produk dalam gambar ini. Hanya teks saja, tanpa tanda kutip."
        : "Sarankan gaya desain visual (warna, mood, layout) yang cocok untuk produk ini agar terlihat premium dan menarik. Singkat saja.";
      
      const res = await geminiService.generateText(prompt, { data: productImg.base64, mimeType: productImg.mimeType });
      if (type === 'text') setText(res.trim());
      else setStyle(res.trim());
    } catch (e: any) {
      alert(e.message);
    } finally {
      setMagicLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!productImg) return;
    setLoading(true);
    setResults([]);
    const newResults: string[] = [];
    
    try {
      let prompt = `Professional advertisement banner design. Product shown in image. Text overlay: "${text}". Style: ${style}. High quality, 4k.`;
      const inputImages = [productImg];
      
      if (refImg) {
        inputImages.push(refImg);
        prompt += " Follow the layout and composition of the second reference image provided.";
      }

      for (let i = 0; i < 4; i++) {
        const imageUrl = await geminiService.generateImage(
          `${prompt} Variation ${i + 1}`,
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
          <Type className="text-brand-primary" /> Bikin Banner Iklan
        </h2>
        <p className="text-slate-400 mt-2">Gabungkan foto produk dengan teks dan desain profesional.</p>
      </div>

      <BrandBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold mb-3 text-slate-800">1. Gambar Produk</h3>
              <ImageUpload 
                value={productImg}
                onUpload={setProductImg}
                onRemove={() => setProductImg(null)}
                className="h-40"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold mb-3 text-slate-800">2. Referensi Desain (Opsional)</h3>
              <ImageUpload 
                value={refImg}
                onUpload={setRefImg}
                onRemove={() => setRefImg(null)}
                icon={<LayoutTemplate className="w-8 h-8 text-slate-400" />}
                className="h-40"
                label="Upload contoh desain"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-slate-800">3. Teks Banner</h3>
                <button 
                  onClick={() => handleMagicFill('text')}
                  disabled={!productImg || magicLoading}
                  className="text-[10px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-1 rounded border border-brand-primary/10 flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Isi
                </button>
              </div>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input-field text-sm min-h-[80px]"
                placeholder="Tulis teks yang ingin ditampilkan di banner..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-slate-800">4. Gaya Visual</h3>
                <button 
                  onClick={() => handleMagicFill('style')}
                  disabled={!productImg || magicLoading}
                  className="text-[10px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-1 rounded border border-brand-primary/10 flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" /> Auto-Style
                </button>
              </div>
              <textarea 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="input-field text-sm min-h-[80px]"
                placeholder="Contoh: Modern, Minimalis, Warna Emas..."
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !productImg || isLimitReached}
              className={`btn-primary w-full ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {loading ? (
                <div className="loader-icon w-5 h-5 mr-2" />
              ) : isLimitReached ? (
                <AlertCircle className="w-5 h-5 mr-2" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {isLimitReached ? 'Limit Generate Tercapai' : 'Buat 4 Banner Premium'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((url, idx) => (
                <div key={idx} className="card group relative aspect-[4/5] overflow-hidden">
                  <img src={url} className="w-full h-full object-cover" alt={`Banner ${idx}`} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={url} download={`banner_${idx+1}.png`} className="p-4 bg-white text-slate-900 rounded-full shadow-xl">
                      <Download className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              ))}
              {loading && results.length < 4 && (
                <div className="card aspect-[4/5] flex items-center justify-center bg-slate-800/50 border-slate-700">
                  <div className="loader-icon w-10 h-10" />
                </div>
              )}
            </div>
          ) : (
            <div className="card h-full min-h-[600px] flex flex-col items-center justify-center text-slate-400 bg-slate-800/20 border-white/5">
              <ImageIcon className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-medium opacity-40">Hasil banner akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
