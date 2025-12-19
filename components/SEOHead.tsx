
import React, { useEffect } from 'react';
import { useData } from './DataContext';

interface SEOHeadProps {
  pageId?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ pageId = 'home' }) => {
  const { getSeoForPage, events } = useData();
  const seoSettings = getSeoForPage(pageId);

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

    // Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    // STRUCTURED DATA (JSON-LD)
    const baseUrl = window.location.origin;

    // 1. Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Denver Coworks Alliance",
      "url": baseUrl,
      "logo": seoSettings.logoUrl || `${baseUrl}/logo.png`,
      "description": "Connecting space operators, community managers, and industry experts in Greater Denver since 2012.",
      "foundingDate": "2012",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Denver",
        "addressRegion": "CO",
        "addressCountry": "US"
      }
    };

    // 2. Events Schema (only if pageId is events-page or home)
    let eventSchemas = [];
    if ((pageId === 'events-page' || pageId === 'home') && events && events.length > 0) {
      eventSchemas = events.slice(0, 10).map(event => ({
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.topic,
        "startDate": event.startTime ? `${event.date}T${event.startTime}` : event.date,
        "location": {
          "@type": "Place",
          "name": event.location || "Denver Coworks Space",
          "address": "Denver, CO"
        },
        "image": [event.image],
        "description": event.description || event.topic,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
      }));
    }

    // Combine all schemas
    const combinedSchema = [organizationSchema, ...eventSchemas];

    // Remove existing schema scripts to avoid duplicates
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Inject new schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(combinedSchema);
    document.head.appendChild(script);

    return () => {
      // Clean up on unmount or change
      const scriptToCleanup = document.querySelector('script[type="application/ld+json"]');
      if (scriptToCleanup) scriptToCleanup.remove();
    };

  }, [seoSettings, pageId, events]);

  return null;
};

export default SEOHead;
