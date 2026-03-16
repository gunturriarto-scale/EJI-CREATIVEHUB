import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Eraser, Undo2, Redo2, Trash2, Download, Send, UploadCloud } from 'lucide-react';
import { geminiService } from '../services/gemini';
import { BrandBanner } from './BrandBanner';
import { ImageData } from '../types';
import { useUsage } from '../hooks/useUsage';
import { AlertCircle } from 'lucide-react';

export const PhotoEditor: React.FC = () => {
  const [image, setImage] = useState<ImageData | null>(null);
  const [brushSize, setBrushSize] = useState(40);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const { isLimitReached } = useUsage();

  const saveState = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      setUndoStack(prev => [...prev.slice(-19), dataUrl]);
      setRedoStack([]);
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0 && canvasRef.current) {
      const currentState = canvasRef.current.toDataURL();
      setRedoStack(prev => [...prev, currentState]);
      
      const prevState = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx?.drawImage(img, 0, 0);
      };
      img.src = prevState;
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0 && canvasRef.current) {
      const currentState = canvasRef.current.toDataURL();
      setUndoStack(prev => [...prev, currentState]);
      
      const nextState = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx?.drawImage(img, 0, 0);
      };
      img.src = nextState;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const img = new Image();
        img.onload = () => {
          if (canvasRef.current && drawCanvasRef.current) {
            const canvas = canvasRef.current;
            const drawCanvas = drawCanvasRef.current;
            canvas.width = img.width;
            canvas.height = img.height;
            drawCanvas.width = img.width;
            drawCanvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            
            const dataUrl = re.target?.result as string;
            const parts = dataUrl.split(',');
            setImage({
              base64: parts[1],
              mimeType: parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg',
              dataUrl
            });
            saveState();
          }
        };
        img.src = re.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !drawCanvasRef.current) return;
    
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = drawCanvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const handleGenerate = async () => {
    if (!image || !prompt.trim()) return;
    setLoading(true);
    try {
      // In a real app, we'd send the mask too. 
      // For this demo, we'll send the current canvas state and prompt.
      const currentImageBase64 = canvasRef.current?.toDataURL('image/jpeg', 0.8).split(',')[1];
      if (!currentImageBase64) return;

      const resultUrl = await geminiService.generateImage(
        `Edit this image according to the prompt: ${prompt}. Maintain consistency.`,
        [{ data: currentImageBase64, mimeType: 'image/jpeg' }]
      );

      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx?.drawImage(img, 0, 0);
        
        // Clear mask
        const drawCtx = drawCanvasRef.current?.getContext('2d');
        drawCtx?.clearRect(0, 0, drawCanvasRef.current!.width, drawCanvasRef.current!.height);
        
        saveState();
      };
      img.src = resultUrl;
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const clearMask = () => {
    const ctx = drawCanvasRef.current?.getContext('2d');
    ctx?.clearRect(0, 0, drawCanvasRef.current!.width, drawCanvasRef.current!.height);
  };

  const removeImage = () => {
    setImage(null);
    setUndoStack([]);
    setRedoStack([]);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    clearMask();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Edit2 className="text-brand-primary" /> Edit & Perbaiki Foto
        </h2>
        <p className="text-slate-400 mt-2">Gunakan kuas untuk menandai area yang ingin diubah, lalu tulis instruksinya.</p>
      </div>

      <BrandBanner />

      <div className="card p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-6 items-center">
          {image && (
            <div className="flex justify-between items-center w-full max-w-2xl">
              <div className="flex gap-2">
                <button 
                  onClick={handleUndo} 
                  disabled={undoStack.length === 0}
                  className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleRedo} 
                  disabled={redoStack.length === 0}
                  className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={clearMask}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-xs font-bold rounded-lg hover:bg-slate-200"
                >
                  <Eraser className="w-4 h-4" /> Bersihkan Mask
                </button>
                <button 
                  onClick={removeImage}
                  className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div 
            className={`relative w-full max-w-2xl aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden ${!image ? 'cursor-pointer' : 'cursor-crosshair'}`}
            onClick={() => !image && document.getElementById('ef-input')?.click()}
          >
            {!image ? (
              <div className="text-center p-8">
                <UploadCloud className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-medium">Klik untuk unggah foto</p>
                <input type="file" id="ef-input" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
                <canvas 
                  ref={drawCanvasRef} 
                  className="absolute top-0 left-0 w-full h-full object-contain opacity-50 pointer-events-auto"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="loader-icon w-12 h-12 mb-4" />
                <p className="text-slate-900 font-bold">Sedang Mengedit...</p>
              </div>
            )}
          </div>

          {image && (
            <div className="w-full max-w-2xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Ukuran Kuas: {brushSize}px</label>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Contoh: Hapus orang di belakang, Ubah warna baju jadi merah..."
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim() || isLimitReached}
                  className={`btn-primary px-4 ${isLimitReached ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  title={isLimitReached ? 'Limit Generate Tercapai' : 'Kirim Instruksi'}
                >
                  {isLimitReached ? <AlertCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex justify-center">
                <a 
                  href={image.dataUrl} 
                  download="edited_photo.png"
                  className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline"
                >
                  <Download className="w-4 h-4" /> Download Hasil Akhir
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
