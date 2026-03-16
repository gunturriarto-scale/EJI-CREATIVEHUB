import React from 'react';

export const BrandBanner: React.FC = () => {
  return (
    <div className="w-full flex justify-center py-4 px-2 overflow-hidden">
      <div className="max-w-3xl w-full bg-black/40 backdrop-blur-sm rounded-xl border border-white/5 p-4 flex items-center justify-around gap-4 md:gap-8 flex-wrap">
        <span className="text-white font-bold text-xl tracking-tighter opacity-80 hover:opacity-100 transition-opacity cursor-default">#FYNE</span>
        <span className="text-white font-serif text-lg tracking-widest opacity-80 hover:opacity-100 transition-opacity cursor-default">HANASUI</span>
        <span className="text-white font-sans font-semibold text-xl opacity-80 hover:opacity-100 transition-opacity cursor-default">Eomma</span>
        <span className="text-white font-sans text-2xl tracking-tighter opacity-80 hover:opacity-100 transition-opacity cursor-default">N°CO</span>
      </div>
    </div>
  );
};
