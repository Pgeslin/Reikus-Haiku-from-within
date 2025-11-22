import React from 'react';
import { Haiku } from '../types';

interface HaikuCardProps {
  haiku: Haiku;
  explanation?: string;
  onClose?: () => void;
  className?: string;
  generatedImageUrl?: string;
  isLoadingImage?: boolean;
}

const HaikuCard: React.FC<HaikuCardProps> = ({ 
  haiku, 
  explanation, 
  onClose, 
  className = "", 
  generatedImageUrl,
  isLoadingImage = false 
}) => {
  // Fallback placeholder if no generated image is available yet. 
  // We use a grayscale random image to represent "waiting for the color of the poem"
  // or just a texture so it doesn't look "unrelated".
  const placeholderUrl = `https://picsum.photos/seed/${haiku.imageId}/600/800?grayscale&blur=2`;
  
  const displayUrl = generatedImageUrl || placeholderUrl;

  return (
    <div className={`relative group bg-[#1f1f1f] rounded-lg overflow-hidden shadow-2xl max-w-md w-full mx-auto border border-gray-800 ${className}`}>
       {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
        <img 
          src={displayUrl} 
          alt="Haiku visualization" 
          className={`object-cover w-full h-full transition-all duration-1000 ${isLoadingImage ? 'opacity-30 scale-105' : 'opacity-90 group-hover:opacity-100 scale-100'}`}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-90" />

        {/* Loading Indicator */}
        {isLoadingImage && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-t-2 border-r-2 border-white rounded-full animate-spin mb-3"></div>
              <p className="text-xs uppercase tracking-widest text-white/70 animate-pulse">Painting Haiku...</p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
        <div className="mb-6">
          {/* Render Haiku with line breaks */}
          {haiku.text.split('\n').map((line, i) => (
            <p key={i} className="haiku-font text-2xl md:text-3xl text-gray-100 leading-snug drop-shadow-md italic">
              {line}
            </p>
          ))}
        </div>

        {haiku.translation && (
           <div className="mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              {haiku.translation.split('\n').map((line, i) => (
                <p key={i} className="text-sm text-gray-400 font-light tracking-wide">
                  {line}
                </p>
              ))}
           </div>
        )}

        {explanation && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm animate-fade-in-up">
             <p className="text-xs text-yellow-100/80 font-light uppercase tracking-widest mb-1">Insight</p>
             <p className="text-sm text-gray-300 italic">{explanation}</p>
          </div>
        )}
        
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {haiku.tags.map(tag => (
            <span key={tag} className="text-[10px] uppercase tracking-widest border border-gray-600 px-2 py-1 rounded text-gray-400">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HaikuCard;