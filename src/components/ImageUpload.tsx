import React, { useState, useRef } from 'react';
import { Upload, X, Package } from 'lucide-react';
import { ImageData } from '../types';
import { cn } from '../utils';

interface ImageUploadProps {
  onUpload: (data: ImageData) => void;
  onRemove: () => void;
  value?: ImageData | null;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onUpload, 
  onRemove, 
  value, 
  label = "Klik atau seret foto ke sini",
  icon = <Upload className="w-10 h-10 text-slate-400" />,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIMENSION = 1024;
        if (width > height && width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const parts = dataUrl.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const base64 = parts[1];
        onUpload({ base64, mimeType, dataUrl });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className={cn(
        "relative w-full h-48 md:h-64 rounded-xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden cursor-pointer",
        isDragging ? "border-brand-primary bg-brand-primary/5" : "border-slate-200 bg-slate-50",
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={inputRef}
        className="hidden" 
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      
      {value ? (
        <>
          <img src={value.dataUrl} className="w-full h-full object-contain p-2" alt="Preview" />
          <button 
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="text-center p-4">
          <div className="flex justify-center mb-2">{icon}</div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
        </div>
      )}
    </div>
  );
};
