
import React, { useEffect } from 'react';
import { useData } from './DataContext';

const SEOHead: React.FC = () => {
  const { getSeoForPage } = useData();
  
  // Since this app currently primarily serves the landing page content on the main route,
  // we default to the 'home' page ID. In a router-based app, this would take a prop or read the URL.
  const seoSettings = getSeoForPage('home');

  useEffect(() => {
    if (!seoSettings) return;

    // Update Title
    document.title = seoSettings.title;

    // Helper to update/create meta tags
    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update/create OG tags
    const updateOg = (property: string, content: string) => {
       let element = document.querySelector(`meta[property="${property}"]`);
       if (!element) {
         element = document.createElement('meta');
         element.setAttribute('property', property);
         document.head.appendChild(element);
       }
       element.setAttribute('content', content);
    };

    updateMeta('description', seoSettings.description);
    updateMeta('keywords', seoSettings.keywords);
    
    updateOg('og:title', seoSettings.title);
    updateOg('og:description', seoSettings.description);
    updateOg('og:image', seoSettings.ogImage);
    updateOg('og:type', 'website');

  }, [seoSettings]);

  return null;
};

export default SEOHead;
