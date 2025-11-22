import React from 'react';

interface HeaderProps {
  onNavigateHome: () => void;
  onNavigateGallery: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onNavigateGallery }) => {
  return (
    <header className="w-full p-6 flex justify-between items-center z-50 relative">
      <div 
        onClick={onNavigateHome} 
        className="text-2xl font-light tracking-widest cursor-pointer text-white hover:text-gray-300 transition-colors"
      >
        L'INTÉRIEUR
      </div>
      <nav className="space-x-6 text-sm tracking-wide">
        <button onClick={onNavigateHome} className="hover:text-gray-300 transition-colors">ACCUEIL</button>
        <button onClick={onNavigateGallery} className="hover:text-gray-300 transition-colors">GALERIE</button>
      </nav>
    </header>
  );
};

export default Header;