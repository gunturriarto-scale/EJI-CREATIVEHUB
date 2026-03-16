import React, { useState } from 'react';
import { UserCog, Sparkles, Download, User, Image as ImageIcon } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import { ImageUpload } from './ImageUpload';
import { ImageData } from '../types';
import { useUsage } from '../hooks/useUsage';
import { AlertCircle } from 'lucide-react';

export const PoseChanger: React.FC = () => {
  const [tab, setTab] = useState<'text' | 'image'>('text');
  const [modelImg, setModelImg] = useState<ImageData | null>(null);
  const [refImg, setRefImg] = useState<ImageData | null>(null);
  const [posePrompt, setPosePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { isLimitReached } = useUsage();

  const poses = [
    { id: 'Berdiri', name: 'Berdiri', icon: User },
    { id: 'Duduk', name: 'Duduk', icon: User },
    { id: 'Jalan', name: 'Jalan', icon: User },
    { id: 'Tertawa', name: 'Tertawa', icon: User },
  ];

  const handleGenerate = async () => {
    if (!modelImg) return;
    if (tab === 'image' && !refImg) return;
    if (tab === 'text' && !posePrompt.trim()) return;

    setLoading(true);
    setResults([]);
    const newResults: string[] = [];
    
    try {
      const prompt = tab === 'text'
        ? `Change the pose of the person in this image to: ${posePrompt}. Maintain identity and background.`
        : `Change the pose of the person in the first image to match the pose in the second image. Maintain identity of the first person.`;

      const inputImages = tab === 'text' ? [modelImg] : [modelImg, refImg!];

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
          <UserCog className="text-brand-primary" /> Ubah Pose Model
        </h2>
      </div>

      <BrandBanner />

      <div className="card overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setTab('text')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'text' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Ubah Pose (Teks)
          </button>
          <button 
            onClick={() => setTab('image')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === 'image' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Ubah Pose (Ref. Gambar)
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className={`grid gap-4 ${tab === 'image' ? 'grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>
                <div>
                  <h3 className="text-sm font-bold mb-3 text-slate-800 text-center">Foto Model</h3>
                  <ImageUpload 
                    value={modelImg}
                    onUpload={setModelImg}
                    onRemove={() => setModelImg(null)}
                    className="h-64"
                  />
                </div>
                {tab === 'image' && (
                  <div>
                    <h3 className="text-sm font-bold mb-3 text-slate-800 text-center">Ref. Pose</h3>
                    <ImageUpload 
                      value={refImg}
                      onUpload={setRefImg}
                      onRemove={() => setRefImg(null)}
                      icon={<ImageIcon className="w-8 h-8 text-slate-400" />}
                      className="h-64"
                    />
                  </div>
                )}
              </div>

              {tab === 'text' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">Pilih atau Tulis Pose</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {poses.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => setPosePrompt(p.id)}
                        className={`option-btn flex flex-col items-center gap-1 py-3 ${posePrompt === p.id ? 'selected' : ''}`}
                      >
                        <p.icon className="w-5 h-5" />
                        <span className="text-[10px]">{p.name}</span>
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text"
                    value={posePrompt}
                    onChange={(e) => setPosePrompt(e.target.value)}
                    className="input-field"
                    placeholder="Tulis pose kustom di sini..."
                  />
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={loading || !modelImg || (tab === 'image' && !refImg) || (tab === 'text' && !posePrompt.trim()) || isLimitReached}
                className={`btn-primary w-full ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {loading ? (
                  <div className="loader-icon w-5 h-5 mr-2" />
                ) : isLimitReached ? (
                  <AlertCircle className="w-5 h-5 mr-2" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isLimitReached ? 'Limit Generate Tercapai' : 'Buat 4 Pose Baru'}
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 min-h-[400px]">
              {results.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {results.map((url, idx) => (
                    <div key={idx} className="group relative aspect-[3/4] rounded-lg overflow-hidden shadow-sm bg-white">
                      <img src={url} className="w-full h-full object-cover" alt={`Result ${idx}`} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a href={url} download={`pose_${idx+1}.png`} className="p-2 bg-white text-slate-900 rounded-full shadow-lg">
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {loading && results.length < 4 && (
                    <div className="aspect-[3/4] flex items-center justify-center bg-slate-200 animate-pulse rounded-lg">
                      <div className="loader-icon w-6 h-6" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <UserCog className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">Hasil pose baru akan muncul di sini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
