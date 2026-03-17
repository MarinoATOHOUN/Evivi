
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Download, Music, Type as TextIcon, Volume2, VolumeX, Image as ImageIcon, Send, Sparkles, Trash2, Loader2, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storyService } from '../../services/story.service';

const FONT_STYLES = [
  { id: 'classic', name: 'Classic', fontClass: 'font-sans' },
  { id: 'bold', name: 'Bold', fontClass: 'font-extrabold uppercase tracking-tight' },
  { id: 'script', name: 'Script', fontClass: 'font-serif italic' },
  { id: 'neon', name: 'Neon', fontClass: 'font-sans brightness-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' },
];

const COLORS = [
  { name: 'Gray', value: '#A0A0A0' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Orange', value: '#E85D1A' },
  { name: 'Yellow', value: '#FFB703' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Black', value: '#000000' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Teal', value: '#009688' },
];

const CreateStory: React.FC = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[1].value);
  const [backgroundColor, setBackgroundColor] = useState(COLORS[2].value);
  const [isMuted, setIsMuted] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'text' | 'background'>('text');

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'text'>('text');

  const musicInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  // Handle textarea height auto-adjust
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [caption]);

  const handlePost = async () => {
    if (!caption.trim() && !mediaFile) {
      setError("Ajoute du texte ou un média à ta story.");
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const payload: any = {
        media_type: mediaFile ? (mediaFile.type.startsWith('video') ? 'video' : 'image') : 'text',
        caption: caption,
        font_style: selectedFont.id,
        font_color: selectedColor,
        background_color: backgroundColor,
        text_position: { x: 0.5, y: 0.5 }
      };

      if (mediaFile) payload.media = mediaFile;

      await storyService.createStory(payload);
      navigate('/');
    } catch (err: any) {
      console.error("Failed to post story:", err);
      setError("Échec de la publication. Réessaie.");
      setIsPublishing(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaFile(file);
      setMediaType(file.type.startsWith('video') ? 'video' : 'image');
      setEditMode('text');
      setError(null);
    }
  };

  const clearMedia = () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    setMediaFile(null);
    setMediaType('text');
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black z-[120] flex items-center justify-center overflow-hidden font-inter select-none touch-none">

      <input type="file" ref={musicInputRef} accept="audio/*" className="hidden" />
      <input type="file" ref={mediaInputRef} onChange={handleMediaUpload} accept="image/*,video/*" className="hidden" />

      <div className="relative w-full h-full md:max-w-[450px] md:h-[92vh] md:rounded-[48px] md:border-[10px] md:border-[#1A1A1A] bg-black shadow-2xl flex flex-col overflow-hidden transition-all duration-500">

        {/* Background Layer (z-0) */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            {mediaUrl ? (
              <motion.div key="media-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} className="w-full h-full object-cover" autoPlay loop muted={isMuted} playsInline />
                ) : (
                  <img src={mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                )}
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
              </motion.div>
            ) : (
              <motion.div key={backgroundColor} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} exit={{ opacity: 0.5 }} className="absolute inset-0" style={{ backgroundColor: backgroundColor }}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Header (z-40) */}
        <header className="relative z-40 px-4 pt-8 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20 active:scale-90 transition-transform">
            <X size={26} />
          </button>

          <div className="flex items-center gap-3">
            {mediaUrl && (
              <button onClick={clearMedia} className="w-10 h-10 flex items-center justify-center text-red-500 bg-black/40 backdrop-blur-md rounded-full border border-red-500/20 active:scale-90 transition-transform">
                <Trash2 size={20} />
              </button>
            )}
            <button className="w-10 h-10 flex items-center justify-center text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20 active:scale-90 transition-transform">
              <Download size={20} />
            </button>
          </div>
        </header>

        {/* Sidebar (z-40) */}
        <aside className="absolute right-4 top-1/4 z-40 flex flex-col gap-6 items-center">
          <button onClick={() => setEditMode('text')} className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border shadow-lg transition-all ${editMode === 'text' ? 'bg-white text-black border-white' : 'bg-white/10 backdrop-blur-xl text-white border-white/10'}`}>
            <TextIcon size={20} />
            <span className="text-[7px] font-black mt-0.5 uppercase">Texte</span>
          </button>

          {!mediaUrl && (
            <button onClick={() => setEditMode('background')} className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border shadow-lg transition-all ${editMode === 'background' ? 'bg-white text-black border-white' : 'bg-white/10 backdrop-blur-xl text-white border-white/10'}`}>
              <Palette size={20} />
              <span className="text-[7px] font-black mt-0.5 uppercase">Fond</span>
            </button>
          )}

          <button onClick={() => setIsMuted(!isMuted)} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex flex-col items-center justify-center text-white border border-white/10 active:scale-90 transition-transform">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span className="text-[7px] font-black mt-0.5 uppercase">{isMuted ? 'Muet' : 'Son'}</span>
          </button>
        </aside>

        {/* Text Area (z-20) - Compact container to avoid blocking side controls */}
        <main className="flex-1 flex flex-col items-center justify-center relative z-20 px-10 pointer-events-none">
          <div className="w-full pointer-events-auto max-h-[50%] overflow-y-auto hide-scrollbar">
            <textarea
              ref={textAreaRef}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={mediaUrl ? "Une légende..." : "Tape ta story..."}
              className={`w-full bg-transparent text-center focus:outline-none placeholder:text-white/30 text-4xl font-black resize-none transition-all drop-shadow-2xl ${selectedFont.fontClass}`}
              style={{ color: selectedColor }}
              rows={1}
              autoFocus
            />
          </div>
          {error && <div className="mt-4 px-4 py-2 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-full text-red-200 text-[10px] font-black uppercase pointer-events-auto">{error}</div>}
        </main>

        {/* Bottom Area (z-40) */}
        <footer className="relative z-40 pb-10 space-y-6 px-5 bg-gradient-to-t from-black/40 to-transparent pt-4">
          <div className="space-y-4">
            {editMode === 'text' && (
              <div className="flex gap-2 justify-center items-center overflow-x-auto hide-scrollbar pb-1">
                {FONT_STYLES.map((s) => (
                  <button key={s.id} onClick={() => setSelectedFont(s)} className={`px-5 py-1.5 rounded-full text-[9px] font-black tracking-widest border uppercase ${selectedFont.id === s.id ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20'}`}>{s.name}</button>
                ))}
              </div>
            )}

            <div className="flex gap-3.5 justify-center items-center pb-2 overflow-x-auto hide-scrollbar px-4">
              {COLORS.map((c) => (
                <button key={c.name} onClick={() => editMode === 'text' ? setSelectedColor(c.value) : setBackgroundColor(c.value)} className={`w-8 h-8 shrink-0 rounded-full border-2 transition-all active:scale-125 ${(editMode === 'text' ? selectedColor === c.value : backgroundColor === c.value) ? 'border-white scale-125 z-10 shadow-xl' : 'border-white/20 opacity-80'}`} style={{ backgroundColor: c.value }} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button onClick={() => mediaInputRef.current?.click()} className={`w-14 h-14 backdrop-blur-xl rounded-2xl flex items-center justify-center active:scale-95 transition-all border ${mediaUrl ? 'bg-[#E85D1A] border-white/20 text-white' : 'bg-white/5 border-white/10 text-white'}`}>
              <ImageIcon size={24} />
            </button>
            <button onClick={handlePost} disabled={(!caption.trim() && !mediaFile) || isPublishing} className={`relative flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all ${(!caption.trim() && !mediaFile) ? 'bg-white/5 text-white/20 border border-white/10' : 'bg-[#E85D1A] text-white shadow-xl shadow-orange-900/40 active:scale-[0.98]'}`}>
              {isPublishing ? <Loader2 size={24} className="animate-spin" /> : <><Send size={20} /> Publier</>}
            </button>
            <button className="w-14 h-14 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 active:scale-95">
              <Sparkles size={24} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CreateStory;
