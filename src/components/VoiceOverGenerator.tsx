import React, { useState } from 'react';
import { Mic, Play, Download, Volume2 } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';

export const VoiceOverGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const voices = [
    { id: 'Kore', name: 'Kore (Wanita, Tenang)' },
    { id: 'Puck', name: 'Puck (Pria, Energik)' },
    { id: 'Charon', name: 'Charon (Pria, Berat)' },
    { id: 'Fenrir', name: 'Fenrir (Pria, Cepat)' },
    { id: 'Leda', name: 'Leda (Wanita, Lembut)' },
    { id: 'Zephyr', name: 'Zephyr (Wanita, Jernih)' },
    { id: 'Aoede', name: 'Aoede (Wanita, Elegan)' },
    { id: 'Orus', name: 'Orus (Pria, Berwibawa)' },
  ];

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setAudioUrl(null);
    try {
      const url = await geminiService.generateSpeech(text, voice, instruction);
      setAudioUrl(url);
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
          <Mic className="text-brand-primary" /> Buat Voice Over
        </h2>
        <p className="text-slate-400 mt-2">Ubah teks menjadi suara profesional dengan AI.</p>
      </div>

      <BrandBanner />

      <div className="card p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-lg font-semibold mb-3 text-slate-800">1. Naskah Voice Over</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input-field min-h-[150px]"
            placeholder="Tulis naskah yang ingin diucapkan di sini..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-semibold mb-3 text-slate-800">2. Pilih Suara</label>
            <select 
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="input-field"
            >
              {voices.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold mb-3 text-slate-800">3. Instruksi Gaya Bicara</label>
            <input 
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="input-field"
              placeholder="Contoh: Bicara dengan nada semangat, Bicara sambil berbisik..."
            />
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          className="btn-primary w-full text-lg"
        >
          {loading ? (
            <><div className="loader-icon w-5 h-5 mr-2" /> Menghasilkan Audio...</>
          ) : (
            <><Volume2 className="w-5 h-5 mr-2" /> Generate Audio</>
          )}
        </button>

        {audioUrl && (
          <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-lg font-bold text-slate-900">Hasil Audio</h3>
            <div className="flex flex-col items-center gap-6">
              <audio src={audioUrl} controls className="w-full max-w-md" />
              <a 
                href={audioUrl} 
                download="voice_over.wav"
                className="btn-primary bg-slate-800 hover:bg-slate-900"
              >
                <Download className="w-4 h-4 mr-2" /> Download Audio
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
