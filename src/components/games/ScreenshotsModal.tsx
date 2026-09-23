import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { RawgScreenshot } from '../../types/rawg';

interface ScreenshotsModalProps {
  screenshots: RawgScreenshot[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
}

export const ScreenshotsModal: React.FC<ScreenshotsModalProps> = ({
  screenshots,
  initialIndex = 0,
  isOpen,
  onClose,
  gameTitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || screenshots.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative max-w-5xl w-full flex flex-col items-center">
        {/* Top bar */}
        <div className="w-full flex items-center justify-between pb-3 text-white text-sm">
          <span className="font-semibold truncate max-w-md">{gameTitle} — Screenshots</span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">
              {currentIndex + 1} de {screenshots.length}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image */}
        <div className="relative w-full aspect-[16/9] bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
          <img
            src={screenshots[currentIndex].image}
            alt={`${gameTitle} screenshot ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />

          {screenshots.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm border border-slate-700 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm border border-slate-700 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails row */}
        {screenshots.length > 1 && (
          <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-2">
            {screenshots.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-20 aspect-video rounded-lg overflow-hidden border-2 shrink-0 transition ${
                  idx === currentIndex ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={s.image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
