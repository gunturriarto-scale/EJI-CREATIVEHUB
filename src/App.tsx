import React, { useState } from 'react';
import { 
  TrendingUp, Image as ImageIcon, ShoppingBag, UserPlus, 
  UserCog, SmilePlus, FileText, Edit2, Type, LayoutGrid, 
  Mic, BookOpen, Palette, Menu, X, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToolId } from './types';
import { RisetIde } from './components/RisetIde';
import { ProductPhotography } from './components/ProductPhotography';
import { PhotoshootProduk } from './components/PhotoshootProduk';
import { ModelGenerator } from './components/ModelGenerator';
import { VoiceOverGenerator } from './components/VoiceOverGenerator';
import { NarasiCerita } from './components/NarasiCerita';
import { PoseChanger } from './components/PoseChanger';
import { ExpressionChanger } from './components/ExpressionChanger';
import { CharacterEditor } from './components/CharacterEditor';
import { AdCopyGenerator } from './components/AdCopyGenerator';
import { BannerGenerator } from './components/BannerGenerator';
import { PhotoEditor } from './components/PhotoEditor';
import { CarouselGenerator } from './components/CarouselGenerator';

const tools = [
  { id: 'riset-ide', name: 'Riset Ide Viral', icon: TrendingUp },
  { id: 'product-photography', name: 'Gabungkan Gambar', icon: ImageIcon },
  { id: 'virtual-try-on', name: 'Photoshoot Produk', icon: ShoppingBag },
  { id: 'buat-model', name: 'Buat Model AI', icon: UserPlus },
  { id: 'ubah-pose', name: 'Ubah Pose Model', icon: UserCog },
  { id: 'ubah-ekspresi', name: 'Ubah Ekspresi', icon: SmilePlus },
  { id: 'teks-iklan', name: 'Bikin Caption & Ide', icon: FileText },
  { id: 'edit-foto', name: 'Edit Foto', icon: Edit2 },
  { id: 'combine-text', name: 'Bikin Banner Iklan', icon: Type },
  { id: 'carousel-feed', name: 'Feed Carousel', icon: LayoutGrid },
  { id: 'voice-over', name: 'Buat Voice Over', icon: Mic },
  { id: 'narasi-cerita', name: 'Narasi Cerita', icon: BookOpen },
  { id: 'edit-karakter', name: 'Edit Gambar Karakter', icon: Palette },
];

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('riset-ide');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderTool = () => {
    switch (activeTool) {
      case 'riset-ide': return <RisetIde />;
      case 'product-photography': return <ProductPhotography />;
      case 'virtual-try-on': return <PhotoshootProduk />;
      case 'buat-model': return <ModelGenerator />;
      case 'voice-over': return <VoiceOverGenerator />;
      case 'narasi-cerita': return <NarasiCerita />;
      case 'ubah-pose': return <PoseChanger />;
      case 'ubah-ekspresi': return <ExpressionChanger />;
      case 'edit-karakter': return <CharacterEditor />;
      case 'teks-iklan': return <AdCopyGenerator />;
      case 'combine-text': return <BannerGenerator />;
      case 'edit-foto': return <PhotoEditor />;
      case 'carousel-feed': return <CarouselGenerator />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
          <Zap className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-xl font-medium">Fitur "{tools.find(t => t.id === activeTool)?.name}" sedang dalam pengembangan.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-main)]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-[var(--color-bg-dark)] border-r border-white/5 fixed h-screen overflow-y-auto z-50">
        <div className="p-8 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg transform -rotate-12">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">EJI // CREATIVE HUB</h1>
        </div>
        <nav className="p-4 space-y-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolId)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTool === tool.id 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'text-blue-400/80 hover:text-blue-300 hover:bg-blue-500/10'
              }`}
            >
              <tool.icon className="w-5 h-5" />
              <span>{tool.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-[var(--color-bg-dark)] border-b border-white/5 p-4 flex items-center gap-2 z-50">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
        <div className="flex items-center gap-2">
          <Zap className="text-brand-primary w-6 h-6 fill-current" />
          <h1 className="text-xl font-bold text-brand-primary">EJI // CREATIVE HUB</h1>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="lg:hidden fixed inset-0 bg-[var(--color-bg-dark)] z-40 pt-20 p-4 overflow-y-auto"
          >
            <nav className="space-y-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveTool(tool.id as ToolId);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-medium transition-all ${
                    activeTool === tool.id 
                      ? 'bg-brand-primary text-white' 
                      : 'text-blue-400/80'
                  }`}
                >
                  <tool.icon className="w-6 h-6" />
                  <span className="text-lg">{tool.name}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-24 lg:pt-12 p-4 md:p-8 lg:p-12">
        <motion.div
          key={activeTool}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {renderTool()}
        </motion.div>
        
        <footer className="mt-20 py-8 border-t border-white/5 text-center text-slate-500 text-sm">
          <p>© 2026 EJI // CREATIVE HUB V.01 • Crafted with GEMINI</p>
        </footer>
      </main>
    </div>
  );
}
