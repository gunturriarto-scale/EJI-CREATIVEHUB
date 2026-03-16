import React, { useState } from 'react';
import { Image, Sparkles, Download, Wand2 } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import { ImageUpload } from './ImageUpload';
import { ImageData } from '../types';
import { useUsage } from '../hooks/useUsage';
import { AlertCircle } from 'lucide-react';

export const ProductPhotography: React.FC = () => {
  const [images, setImages] = useState<(ImageData | null)[]>([null, null]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [magicLoading, setMagicLoading] = useState(false);
  const { isLimitReached } = useUsage();

  const handleUpload = (index: number, data: ImageData) => {
    const newImages = [...images];
    newImages[index] = data;
    if (newImages.length < 5 && newImages.every(img => img !== null)) {
      newImages.push(null);
    }
    setImages(newImages);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    while (newImages.length < 2) newImages.push(null);
    if (newImages[newImages.length - 1] !== null && newImages.length < 5) {
      newImages.push(null);
    }
    setImages(newImages);
  };

  const handleMagicPrompt = async () => {
    const validImages = images.filter((img): img is ImageData => img !== null);
    if (validImages.length === 0) return;
    
    setMagicLoading(true);
    try {
      const text = await geminiService.generateText(
        "Buatkan instruksi singkat untuk menggabungkan gambar-gambar ini menjadi satu komposisi yang menarik untuk iklan produk premium.",
        { data: validImages[0].base64, mimeType: validImages[0].mimeType }
      );
      setPrompt(text.trim());
    } catch (e: any) {
      alert(e.message);
    } finally {
      setMagicLoading(false);
    }
  };

  const handleGenerate = async () => {
    const validImages = images.filter((img): img is ImageData => img !== null);
    if (validImages.length < 2) return;

    setLoading(true);
    setResults([]);
    const newResults: string[] = [];
    
    try {
      // Generate 4 variations
      for (let i = 0; i < 4; i++) {
        const imageUrl = await geminiService.generateImage(
          `${prompt}. Variation ${i + 1}. High quality, professional product photography.`,
          validImages.map(img => ({ data: img.base64, mimeType: img.mimeType }))
        );
        newResults.push(imageUrl);
        setResults([...newResults]);
        // Small delay to avoid rate limits
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
          <Image className="text-brand-primary" /> Gabungkan Gambar
        </h2>
        <p className="text-slate-400 mt-2">Unggah 2-5 gambar, tulis instruksi, dan biarkan AI menggabungkannya.</p>
      </div>

      <BrandBanner />

      <div className="card p-6 md:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">1. Unggah Gambar (min 2, maks 5)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <ImageUpload 
                key={idx}
                value={img}
                onUpload={(data) => handleUpload(idx, data)}
                onRemove={() => handleRemove(idx)}
                className="h-32 md:h-40"
                label="+"
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">2. Instruksi</h3>
          <div className="relative">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-field min-h-[120px] pr-12"
              placeholder="Contoh: Gabungkan kucing dan astronot dalam suasana luar angkasa yang sinematik..."
            />
            <button 
              onClick={handleMagicPrompt}
              disabled={magicLoading || images.filter(i => i).length === 0}
              className="absolute right-3 top-3 p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
              title="Buat Instruksi Otomatis"
            >
              {magicLoading ? <div className="loader-icon w-4 h-4" /> : <Wand2 className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading || images.filter(i => i).length < 2 || !prompt.trim() || isLimitReached}
          className={`btn-primary w-full text-lg ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        >
          {loading ? (
            <><div className="loader-icon w-5 h-5 mr-2" /> Menggabungkan Gambar...</>
          ) : isLimitReached ? (
            <><AlertCircle className="w-5 h-5 mr-2" /> Limit Generate Tercapai</>
          ) : (
            <><Sparkles className="w-5 h-5 mr-2" /> Buat 4 Variasi</>
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-center text-white">Hasil Gabungan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {results.map((url, idx) => (
              <div key={idx} className="card group relative overflow-hidden aspect-square">
                <img src={url} className="w-full h-full object-cover" alt={`Result ${idx}`} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a 
                    href={url} 
                    download={`gabungan_${idx + 1}.png`}
                    className="p-4 bg-white text-slate-900 rounded-full shadow-xl hover:scale-110 transition-transform"
                  >
                    <Download className="w-6 h-6" />
                  </a>
                </div>
              </div>
            ))}
            {loading && results.length < 4 && (
              <div className="card aspect-square flex flex-col items-center justify-center bg-slate-800/50 border-slate-700">
                <div className="loader-icon w-10 h-10 mb-4" />
                <p className="text-slate-400 text-sm">Menghasilkan variasi berikutnya...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
