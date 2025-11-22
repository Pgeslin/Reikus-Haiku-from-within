import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import HaikuCard from './components/HaikuCard';
import { Haiku, AppState } from './types';
import { HAIKU_DATA, THEMES } from './constants';
import { matchHaikuWithGemini, generateHaigaImage } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>(AppState.HOME);
  const [selectedHaiku, setSelectedHaiku] = useState<Haiku | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [userFeeling, setUserFeeling] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  
  // Image generation state
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Random background image for home
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    setBgImage(`https://picsum.photos/seed/int_bg_${Math.floor(Math.random() * 100)}/1920/1080`);
  }, []);

  // Trigger image generation when a Haiku is selected and shown in RESULT view
  useEffect(() => {
    if (selectedHaiku && view === AppState.RESULT) {
      const hasCachedImage = generatedImages[selectedHaiku.id];
      
      if (!hasCachedImage) {
        const fetchImage = async () => {
          setIsGeneratingImage(true);
          const imgUrl = await generateHaigaImage(selectedHaiku.text, selectedHaiku.tags);
          if (imgUrl) {
            setGeneratedImages(prev => ({
              ...prev,
              [selectedHaiku.id]: imgUrl
            }));
          }
          setIsGeneratingImage(false);
        };
        fetchImage();
      }
    }
  }, [selectedHaiku, view, generatedImages]);

  const handleNavigateHome = () => {
    setView(AppState.HOME);
    setSelectedHaiku(null);
    setUserFeeling("");
    setError("");
  };

  const handleNavigateGallery = () => {
    setView(AppState.GALLERY);
    setSelectedHaiku(null);
  };

  const handleTagClick = (tag: string) => {
    // Find a random haiku with this tag
    const matches = HAIKU_DATA.filter(h => h.tags.includes(tag));
    if (matches.length > 0) {
      const randomMatch = matches[Math.floor(Math.random() * matches.length)];
      setSelectedHaiku(randomMatch);
      setExplanation(`Reflecting on the theme of "${tag}".`);
      setView(AppState.RESULT);
    }
  };

  const handleAnalyzeFeeling = async () => {
    if (!userFeeling.trim()) return;
    
    setIsProcessing(true);
    setError("");
    
    try {
      const result = await matchHaikuWithGemini(userFeeling);
      
      if (result) {
        const foundHaiku = HAIKU_DATA.find(h => h.id === result.haikuId);
        if (foundHaiku) {
          setSelectedHaiku(foundHaiku);
          setExplanation(result.explanation);
          setView(AppState.RESULT);
        } else {
          setError("The spirits are silent. Please try again.");
        }
      } else {
         // Fallback to simple keyword search
         const lowerInput = userFeeling.toLowerCase();
         const simpleMatch = HAIKU_DATA.find(h => 
            h.tags.some(t => lowerInput.includes(t.toLowerCase())) || 
            h.translation?.toLowerCase().includes(lowerInput)
         );
         
         if (simpleMatch) {
            setSelectedHaiku(simpleMatch);
            setExplanation("Selected based on matching keywords.");
            setView(AppState.RESULT);
         } else {
             const random = HAIKU_DATA[Math.floor(Math.random() * HAIKU_DATA.length)];
             setSelectedHaiku(random);
             setExplanation("The universe chose this for you.");
             setView(AppState.RESULT);
         }
      }
    } catch (err) {
      console.error(err);
      setError("Connection to the muse failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 max-w-4xl mx-auto text-center relative z-10">
      <h1 className="text-4xl md:text-6xl font-thin tracking-widest mb-4 text-white drop-shadow-lg haiku-font italic">
        Changer le Monde de l’Intérieur
      </h1>
      <p className="text-lg md:text-xl font-light text-gray-200 mb-12 tracking-wide max-w-2xl mx-auto drop-shadow-md">
        Enter a sanctuary of words and images. Explore the illustrated Haikus of Pierre Geslin.
      </p>

      <div className="w-full max-w-lg bg-black/40 backdrop-blur-md p-8 rounded-xl border border-white/10 shadow-2xl">
        <label className="block text-sm font-medium text-gray-300 mb-4 uppercase tracking-widest">
          How does your inner world feel today?
        </label>
        <div className="relative mb-6">
          <input
            type="text"
            value={userFeeling}
            onChange={(e) => setUserFeeling(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeFeeling()}
            placeholder="e.g., peaceful, storms ahead, searching for light..."
            className="w-full bg-transparent border-b border-gray-500 text-white placeholder-gray-500 py-3 px-2 focus:outline-none focus:border-white transition-colors text-lg text-center"
          />
          {isProcessing && (
             <div className="absolute right-0 top-3">
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             </div>
          )}
        </div>
        <button 
          onClick={handleAnalyzeFeeling}
          disabled={isProcessing || !userFeeling}
          className={`w-full py-3 px-6 rounded border border-white/30 uppercase tracking-widest text-sm font-semibold transition-all duration-300 ${
            !userFeeling ? 'opacity-50 cursor-not-allowed text-gray-500' : 'hover:bg-white hover:text-black text-white'
          }`}
        >
          Reflect
        </button>
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      </div>

      <div className="mt-12">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Or choose a theme</p>
        <div className="flex flex-wrap justify-center gap-3">
          {THEMES.slice(0, 8).map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-4 py-2 bg-white/5 hover:bg-white/20 border border-white/10 rounded-full text-xs uppercase tracking-wider text-gray-300 transition-all"
            >
              {tag}
            </button>
          ))}
          <button 
             onClick={handleNavigateGallery}
             className="px-4 py-2 text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-gray-600"
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className="container mx-auto px-4 py-12 z-10 relative">
      <h2 className="text-3xl font-light text-center mb-12 tracking-widest text-white haiku-font italic">Gallery</h2>
      <p className="text-center text-gray-400 mb-12 max-w-xl mx-auto text-sm">Select a Haiku to generate its unique "Haiga" illustration.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {HAIKU_DATA.map(haiku => (
          <div 
            key={haiku.id} 
            onClick={() => {
              setSelectedHaiku(haiku);
              setExplanation("");
              setView(AppState.RESULT);
            }}
            className="cursor-pointer transform hover:-translate-y-2 transition-transform duration-300"
          >
            {/* In Gallery view, we show the placeholder card, but maybe without generating image yet to save bandwidth/API */}
            <HaikuCard 
              haiku={haiku} 
              // Check if we already have it generated
              generatedImageUrl={generatedImages[haiku.id]} 
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 z-10 relative animate-fade-in-up">
       {selectedHaiku && (
         <HaikuCard 
           haiku={selectedHaiku} 
           explanation={explanation}
           onClose={() => setView(AppState.HOME)}
           className="transform scale-100 md:scale-110"
           generatedImageUrl={generatedImages[selectedHaiku.id]}
           isLoadingImage={isGeneratingImage && !generatedImages[selectedHaiku.id]}
         />
       )}
       <div className="mt-16 text-center">
          <button 
            onClick={() => setView(AppState.HOME)}
            className="text-sm text-gray-400 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white pb-1 transition-all"
          >
            Return to Center
          </button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-100 overflow-x-hidden relative selection:bg-gray-700 selection:text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#1a1a1a]/90 to-[#1a1a1a]" />
          <img src={bgImage} alt="" className="w-full h-full object-cover opacity-20 grayscale" />
      </div>

      <Header onNavigateHome={handleNavigateHome} onNavigateGallery={handleNavigateGallery} />

      <main className="relative z-10 pt-8 pb-20">
        {view === AppState.HOME && renderHome()}
        {view === AppState.GALLERY && renderGallery()}
        {view === AppState.RESULT && renderResult()}
      </main>
      
      <footer className="fixed bottom-4 w-full text-center text-[10px] text-gray-600 uppercase tracking-widest z-50 pointer-events-none">
        Based on "Changer le Monde de l’Intérieur" by Pierre Geslin
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;