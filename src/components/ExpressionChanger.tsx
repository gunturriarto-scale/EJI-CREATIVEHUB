import React, { useState } from 'react';
import { SmilePlus, Sparkles, Download, Smile, Frown, Angry, Laugh, Meh, AlertCircle as AlertIcon } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import { ImageUpload } from './ImageUpload';
import { ImageData } from '../types';
import { useUsage } from '../hooks/useUsage';

export const ExpressionChanger: React.FC = () => {
  const [modelImg, setModelImg] = useState<ImageData | null>(null);
  const [expression, setExpression] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { isLimitReached } = useUsage();

  const expressions = [
    { id: 'Senang', name: 'Senang', icon: Smile },
    { id: 'Sedih', name: 'Sedih', icon: Frown },
    { id: 'Marah', name: 'Marah', icon: Angry },
    { id: 'Terkejut', name: 'Kaget', icon: AlertIcon },
    { id: 'Tertawa', name: 'Tawa', icon: Laugh },
    { id: 'Menangis', name: 'Nangis', icon: Meh },
  ];

  const handleGenerate = async () => {
    if (!modelImg || !expression.trim()) return;

    setLoading(true);
    setResults([]);
    const newResults: string[] = [];
    
    try {
      const prompt = `Change the facial expression of the person in this image to: ${expression}. Maintain identity, lighting, and background.`;

      for (let i = 0; i < 3; i++) {
        const imageUrl = await geminiService.generateImage(
          `${prompt} Variation ${i + 1}`,
          [{ data: modelImg.base64, mimeType: modelImg.mimeType }]
        );
        newResults.push(imageUrl);
        setResults([...newResults]);
        if (i < 2) await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <SmilePlus className="text-brand-primary" /> Ubah Ekspresi Wajah
        </h2>
        <p className="text-slate-400 mt-2">Ubah ekspresi wajah model Anda dengan instan.</p>
      </div>

      <BrandBanner />

      <div className="card p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold mb-3 text-slate-800">1. Unggah Foto Wajah</h3>
              <ImageUpload 
                value={modelImg}
                onUpload={setModelImg}
                onRemove={() => setModelImg(null)}
                className="h-64"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">2. Pilih atau Tulis Ekspresi</h3>
              <div className="grid grid-cols-3 gap-2">
                {expressions.map(e => (
                  <button 
                    key={e.id}
                    onClick={() => setExpression(e.id)}
                    className={`option-btn flex items-center justify-center gap-1 py-2 text-xs ${expression === e.id ? 'selected' : ''}`}
                  >
                    <e.icon className="w-4 h-4" />
                    <span>{e.name}</span>
                  </button>
                ))}
              </div>
              <input 
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="input-field"
                placeholder="Tulis ekspresi kustom di sini..."
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !modelImg || !expression.trim() || isLimitReached}
              className={`btn-primary w-full ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {loading ? (
                <div className="loader-icon w-5 h-5 mr-2" />
              ) : isLimitReached ? (
                <AlertIcon className="w-5 h-5 mr-2" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {isLimitReached ? 'Limit Generate Tercapai' : 'Buat 3 Variasi Ekspresi'}
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 min-h-[400px]">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {results.map((url, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden shadow-sm bg-white">
                    <img src={url} className="w-full h-full object-cover" alt={`Result ${idx}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a href={url} download={`ekspresi_${idx+1}.png`} className="p-3 bg-white text-slate-900 rounded-full shadow-lg">
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
                {loading && results.length < 3 && (
                  <div className="aspect-square flex items-center justify-center bg-slate-200 animate-pulse rounded-lg">
                    <div className="loader-icon w-8 h-8" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <SmilePlus className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Hasil ekspresi baru akan muncul di sini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
