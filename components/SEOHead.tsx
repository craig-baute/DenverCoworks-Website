
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from './DataContext';

interface SEOHeadProps {
  pageId?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ pageId = 'home' }) => {
  const { getSeoForPage, events, blogs, spaces } = useData();
  const { id } = useParams<{ id: string }>();

  let seoSettings = getSeoForPage(pageId);

  // Dynamic overrides for detail pages
  if (pageId === 'blog-post' && id && blogs.length > 0) {
    const blog = blogs.find(b => String(b.id) === id || b.title.toLowerCase().replace(/ /g, '-') === id);
    if (blog) {
      seoSettings = {
        ...seoSettings,
        title: `${blog.title} | Denver Coworks Alliance`,
        description: blog.excerpt,
        ogImage: blog.imageUrl
      };
    }
  } else if (pageId === 'space-detail' && id && spaces.length > 0) {
    const space = spaces.find(s => String(s.id) === id);
    if (space) {
      seoSettings = {
        ...seoSettings,
        title: `${space.name} - ${space.neighborhood} | Denver Coworks`,
        description: space.description?.substring(0, 160) || `Explore ${space.name} in ${space.neighborhood}. ${space.vibe} coworking in Denver.`,
        ogImage: space.imageUrl
      };
    }
  }

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
    let eventSchemas: any[] = [];
    if ((pageId === 'events-page' || pageId === 'home') && events && events.length > 0) {
      eventSchemas = events.slice(0, 10).map(event => ({
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.topic,
        "startDate": event.date, // Note: ideally this should be ISO format
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

    // 3. Blog Post Schema
    let blogSchema = null;
    if (pageId === 'blog-post' && id) {
      const blog = blogs.find(b => String(b.id) === id || b.title.toLowerCase().replace(/ /g, '-') === id);
      if (blog) {
        blogSchema = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog.title,
          "image": [blog.imageUrl],
          "datePublished": blog.date,
          "author": [{
            "@type": "Person",
            "name": blog.author || "Denver Coworks Staff"
          }]
        };
      }
    }

    // 4. Place Schema
    let placeSchema = null;
    if (pageId === 'space-detail' && id) {
      const space = spaces.find(s => String(s.id) === id);
      if (space) {
        placeSchema = {
          "@context": "https://schema.org",
          "@type": "CoworkingSpace",
          "name": space.name,
          "description": space.description,
          "image": space.imageUrl,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": space.addressStreet || space.address,
            "addressLocality": space.addressCity || "Denver",
            "addressRegion": space.addressState || "CO",
            "postalCode": space.addressZip,
            "addressCountry": "US"
          },
          "geo": space.addressLat ? {
            "@type": "GeoCoordinates",
            "latitude": space.addressLat,
            "longitude": space.addressLng
          } : undefined
        };
      }
    }

    // Combine all schemas
    const combinedSchema = [organizationSchema, ...eventSchemas];
    if (blogSchema) combinedSchema.push(blogSchema);
    if (placeSchema) combinedSchema.push(placeSchema);

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

  }, [seoSettings, pageId, events, blogs, spaces, id]);

  return null;
};

export default SEOHead;
