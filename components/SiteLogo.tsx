import React from 'react';
import { useData } from './DataContext';

interface SiteLogoProps {
  scrolled: boolean;
  isLanding: boolean;
}

const SiteLogo: React.FC<SiteLogoProps> = ({ scrolled, isLanding }) => {
  const { getSeoForPage } = useData();
  const settings = getSeoForPage('home');

  // If user uploaded a specific logo in Admin, use it
  // We render it exactly as uploaded without filters/alterations
  if (settings.logoUrl) {
    return (
      <img 
        src={settings.logoUrl} 
        alt={settings.title || 'Site Logo'} 
        className="h-12 md:h-14 w-auto object-contain"
      />
    );
  }

  // Fallback to Text if no image is uploaded
  return (
    <div className={`font-heavy uppercase tracking-tighter leading-none text-2xl md:text-3xl ${
      scrolled || !isLanding ? "text-black" : "text-white"
    }`}>
      Denver<br/>Coworks
    </div>
  );
};

export default SiteLogo;