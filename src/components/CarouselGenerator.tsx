import React, { useState } from 'react';
import { LayoutGrid, Sparkles, Download, Wand2, Info, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import { ImageUpload } from './ImageUpload';
import { ImageData } from '../types';
import { useUsage } from '../hooks/useUsage';
import { AlertCircle } from 'lucide-react';

interface CarouselSlide {
  slide: number;
  text_overlay: string;
  visual_prompt: string;
  imageUrl?: string;
  loading?: boolean;
}

export const CarouselGenerator: React.FC = () => {
  const [productImg, setProductImg] = useState<ImageData | null>(null);
  const [logoImg, setLogoImg] = useState<ImageData | null>(null);
  const [refImg, setRefImg] = useState<ImageData | null>(null);
  
  const [desc, setDesc] = useState('');
  const [style, setStyle] = useState('Modern Minimalist');
  const [slideCount, setSlideCount] = useState(4);
  const [focus, setFocus] = useState('Hardselling');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [magicLoading, setMagicLoading] = useState(false);
  const { isLimitReached } = useUsage();

  const handleMagicDesc = async () => {
    if (!productImg) return;
    setMagicLoading(true);
    try {
      const text = await geminiService.generateText(
        "Buatkan deskripsi produk singkat dan menarik untuk caption Instagram berdasarkan gambar ini.",
        { data: productImg.base64, mimeType: productImg.mimeType }
      );
      setDesc(text.trim());
    } catch (e: any) {
      alert(e.message);
    } finally {
      setMagicLoading(false);
    }
  };

  const handleGenerateConcept = async () => {
    if (!productImg || !desc.trim()) return;
    setLoading(true);
    try {
      const planPrompt = `Buatkan rencana konten carousel Instagram (${slideCount} slide) untuk produk ini.
      Deskripsi: ${desc}
      Gaya: ${style}
      Fokus: ${focus}
      Output format JSON array yang valid: [{"slide": 1, "text_overlay": "Headline singkat", "visual_prompt": "deskripsi gambar detail untuk AI image generator"}, ...]`;
      
      const planTextRaw = await geminiService.generateText(
        planPrompt,
        { data: productImg.base64, mimeType: productImg.mimeType }
      );
      
      const jsonMatch = planTextRaw.match(/\[.*\]/s);
      if (jsonMatch) {
        const parsedSlides = JSON.parse(jsonMatch[0]);
        setSlides(parsedSlides);
      } else {
        throw new Error("Gagal membuat konsep. Format tidak valid.");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSingleSlide = async (idx: number) => {
    const slide = slides[idx];
    const newSlides = [...slides];
    newSlides[idx] = { ...slide, loading: true };
    setSlides(newSlides);

    try {
      let fullPrompt = `Instagram carousel slide. Style: ${style}. ${slide.visual_prompt}. IMPORTANT: Image MUST contain text: "${slide.text_overlay}". High quality.`;
      const inputImages = [productImg!];
      if (logoImg) inputImages.push(logoImg);
      if (refImg) inputImages.push(refImg);

      const imageUrl = await geminiService.generateImage(fullPrompt, inputImages.map(img => ({ data: img.base64, mimeType: img.mimeType })));
      
      const updatedSlides = [...slides];
      updatedSlides[idx] = { ...slide, imageUrl, loading: false };
      setSlides(updatedSlides);
    } catch (e: any) {
      alert(e.message);
      const updatedSlides = [...slides];
      updatedSlides[idx] = { ...slide, loading: false };
      setSlides(updatedSlides);
    }
  };

  const handleRefreshSingleConcept = async (idx: number) => {
    const slide = slides[idx];
    const newSlides = [...slides];
    newSlides[idx] = { ...slide, loading: true };
    setSlides(newSlides);

    try {
      const prompt = `Berikan ide konten alternatif untuk SLIDE ${slide.slide} dari carousel Instagram tentang "${desc}". Gaya: ${style}.
      Output JSON saja: {"text_overlay": "Judul baru", "visual_prompt": "Deskripsi visual baru"}`;
      
      const response = await geminiService.generateText(prompt);
      const jsonMatch = response.match(/\{.*\}/s);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        const updatedSlides = [...slides];
        updatedSlides[idx] = { ...slide, ...data, loading: false };
        setSlides(updatedSlides);
      }
    } catch (e: any) {
      alert(e.message);
      const updatedSlides = [...slides];
      updatedSlides[idx] = { ...slide, loading: false };
      setSlides(updatedSlides);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <LayoutGrid className="text-brand-primary" /> Generator Feed Carousel
        </h2>
        <p className="text-slate-400 mt-2">Buat konsep dan desain carousel Instagram dalam hitungan detik.</p>
      </div>

      <BrandBanner />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-xs font-bold mb-2 text-slate-800">1. Foto Produk</h3>
              <ImageUpload 
                value={productImg}
                onUpload={setProductImg}
                onRemove={() => setProductImg(null)}
                className="h-32"
                label="+"
              />
            </div>
            <div>
              <h3 className="text-xs font-bold mb-2 text-slate-800">2. Logo</h3>
              <ImageUpload 
                value={logoImg}
                onUpload={setLogoImg}
                onRemove={() => setLogoImg(null)}
                className="h-32"
                label="+"
              />
            </div>
            <div>
              <h3 className="text-xs font-bold mb-2 text-slate-800">3. Ref. Desain</h3>
              <ImageUpload 
                value={refImg}
                onUpload={setRefImg}
                onRemove={() => setRefImg(null)}
                className="h-32"
                label="+"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-slate-800">4. Deskripsi Produk/Tema</label>
            <div className="relative">
              <textarea 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="input-field min-h-[100px] pr-12"
                placeholder="Contoh: Kopi susu gula aren dengan biji kopi pilihan..."
              />
              <button 
                onClick={handleMagicDesc}
                disabled={!productImg || magicLoading}
                className="absolute right-3 top-3 p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {magicLoading ? <div className="loader-icon w-4 h-4" /> : <Wand2 className="w-4 h-4 text-slate-600" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-800">5. Gaya Desain</label>
              <input type="text" value={style} onChange={(e) => setStyle(e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-800">6. Slide</label>
              <input type="number" value={slideCount} onChange={(e) => setSlideCount(parseInt(e.target.value))} className="input-field text-sm" min="2" max="6" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-800">7. Fokus</label>
              <select value={focus} onChange={(e) => setFocus(e.target.value)} className="input-field text-sm">
                <option value="Hardselling">Hardselling</option>
                <option value="Softselling">Softselling</option>
                <option value="Edukasi">Edukasi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 text-slate-800">8. Rasio</label>
              <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="input-field text-sm">
                <option value="1:1">1:1 (Persegi)</option>
                <option value="4:5">4:5 (Potret)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerateConcept}
            disabled={loading || !productImg || !desc.trim()}
            className="btn-primary w-full"
          >
            {loading ? <div className="loader-icon w-5 h-5 mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
            Buat Konsep Carousel
          </button>
        </div>

        <div className="space-y-6">
          {slides.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <p className="text-xs text-brand-primary leading-relaxed">
                  Edit teks atau prompt di bawah jika perlu, lalu klik "Generate Slide Ini" satu per satu untuk hasil terbaik.
                </p>
              </div>
              
              <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
                {slides.map((slide, idx) => (
                  <div key={idx} className="card p-4 space-y-4 border-slate-200">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slide {slide.slide}</span>
                      <button 
                        onClick={() => handleRefreshSingleConcept(idx)}
                        disabled={slide.loading}
                        className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${slide.loading ? 'animate-spin' : ''}`} /> Ganti Ide
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Teks Overlay</label>
                          <input 
                            type="text" 
                            value={slide.text_overlay}
                            onChange={(e) => {
                              const newSlides = [...slides];
                              newSlides[idx].text_overlay = e.target.value;
                              setSlides(newSlides);
                            }}
                            className="input-field text-xs py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Visual Prompt</label>
                          <textarea 
                            value={slide.visual_prompt}
                            onChange={(e) => {
                              const newSlides = [...slides];
                              newSlides[idx].visual_prompt = e.target.value;
                              setSlides(newSlides);
                            }}
                            className="input-field text-xs py-2 min-h-[60px]"
                          />
                        </div>
                        <button 
                          onClick={() => handleGenerateSingleSlide(idx)}
                          disabled={slide.loading || isLimitReached}
                          className={`btn-primary w-full py-2 text-xs ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                          {slide.loading ? (
                            <div className="loader-icon w-3 h-3 mr-2" />
                          ) : isLimitReached ? (
                            <AlertCircle className="w-3 h-3 mr-2" />
                          ) : (
                            <ImageIcon className="w-3 h-3 mr-2" />
                          )}
                          {isLimitReached ? 'Limit Tercapai' : 'Generate Slide Ini'}
                        </button>
                      </div>

                      <div className={`bg-slate-100 rounded-lg overflow-hidden relative ${aspectRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square'}`}>
                        {slide.imageUrl ? (
                          <>
                            <img src={slide.imageUrl} className="w-full h-full object-cover" alt={`Slide ${idx}`} />
                            <a 
                              href={slide.imageUrl} 
                              download={`carousel_slide_${idx+1}.png`}
                              className="absolute bottom-2 right-2 p-2 bg-white text-slate-900 rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            {slide.loading ? <div className="loader-icon w-8 h-8" /> : <ImageIcon className="w-8 h-8 opacity-20" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-800/20 border-white/5">
              <LayoutGrid className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-medium opacity-40">Konsep carousel akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
