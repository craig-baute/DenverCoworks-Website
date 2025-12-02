import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { db, storage, isConfigured as isFirebaseLive } from './firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Types ---
export interface Space {
  id: number | string;
  name: string;
  neighborhood: string;
  vibe: string;
  imageUrl: string;
}

export interface Event {
  id: number | string;
  image: string;
  topic: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
}

export interface BlogPost {
  id: number | string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  tags: string[];
}

export interface Lead {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  type: string;
  address?: string;
  buildingSize?: string;
  message?: string;
  timestamp: string;
}

export interface Rsvp {
  id: number | string;
  eventName: string;
  attendeeName: string;
  email: string;
  spaceName: string;
  timestamp: string;
}

export interface MediaItem {
  id: string | number;
  url: string;
  name: string;
  uploadedAt: string;
}

export interface SeoSettings {
  id?: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  logoUrl?: string;
}

export interface Testimonial {
  id: number | string;
  name: string;
  title: string;
  space: string;
  quote: string;
}

export interface SuccessStory {
  id: number | string;
  type: string;
  title: string;
  stat: string;
  time: string;
  desc: string;
  image: string;
}

interface DataContextType {
  spaces: Space[];
  events: Event[];
  blogs: BlogPost[];
  leads: Lead[];
  rsvps: Rsvp[];
  seoPages: SeoSettings[];
  media: MediaItem[];
  testimonials: Testimonial[];
  successStories: SuccessStory[];
  
  addSpace: (space: Omit<Space, 'id'>) => void;
  updateSpace: (id: string | number, space: Partial<Space>) => void;
  removeSpace: (id: number | string) => void;
  
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string | number, event: Partial<Event>) => void;
  removeEvent: (id: number | string) => void;

  addBlog: (blog: Omit<BlogPost, 'id'>) => void;
  updateBlog: (id: string | number, blog: Partial<BlogPost>) => void;
  removeBlog: (id: number | string) => void;
  
  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  removeLead: (id: number | string) => void;

  addRsvp: (rsvp: Omit<Rsvp, 'id'>) => Promise<void>;
  removeRsvp: (id: number | string) => void;
  
  updateSeoPage: (pageId: string, settings: SeoSettings) => void;
  getSeoForPage: (pageId: string) => SeoSettings;

  addTestimonial: (t: Omit<Testimonial, 'id'>) => void;
  updateTestimonial: (id: string | number, t: Partial<Testimonial>) => void;
  removeTestimonial: (id: number | string) => void;

  addSuccessStory: (story: Omit<SuccessStory, 'id'>) => void;
  updateSuccessStory: (id: string | number, story: Partial<SuccessStory>) => void;
  removeSuccessStory: (id: number | string) => void;
  
  uploadFile: (file: File) => Promise<string>;
  
  seedDatabase: () => Promise<void>;
  resetData: () => void;
  source: 'firebase' | 'local';
}

// --- Initial Mock Data ---
const INITIAL_SPACES: Space[] = [
  { id: 1, name: "The Hive", neighborhood: "LoDo", vibe: "Industrial Chic", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Canvas Collective", neighborhood: "RiNo", vibe: "Artistic & Raw", imageUrl: "https://images.unsplash.com/photo-1518542698889-ca82262f08d5?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Union Hall", neighborhood: "Union Station", vibe: "Luxury Professional", imageUrl: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Basecamp", neighborhood: "Boulder", vibe: "Startup Energy", imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "The Study", neighborhood: "Highlands", vibe: "Quiet Focus", imageUrl: "https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "TechHub", neighborhood: "DTC", vibe: "Corporate Flex", imageUrl: "https://images.unsplash.com/photo-1593642632823-8f7856677741?auto=format&fit=crop&w=800&q=80" },
  { id: 7, name: "Ironworks", neighborhood: "Golden", vibe: "Rustic Modern", imageUrl: "https://images.unsplash.com/photo-1505409859974-78b3d6aa12f3?auto=format&fit=crop&w=800&q=80" },
  { id: 8, name: "Altitude", neighborhood: "Cherry Creek", vibe: "Executive Suite", imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80" }
];

const INITIAL_EVENTS: Event[] = [
  { id: 1, image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80", topic: "Lessons from going from coworking to events", date: "July 23, 2024", time: "1 PM", location: "The Village", description: "RSVP to our next space tour and Q + A with the owner." },
  { id: 2, image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80", topic: "Space Tour with Q & A", date: "September 17, 2024", time: "1 PM", location: "Shhhhh.... you have to sign up", description: "RSVP to our next space tour and Q + A with the owner." },
  { id: 3, image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80", topic: "Launch Strategy. Demand Changes.", date: "November 5, 2024", time: "1 PM", location: "Shhhhh.... you have to sign up", description: "Craig will describe Switchyards launch strategy." },
  { id: 4, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80", topic: "New year insights.", date: "January 14, 2025", time: "1 PM", location: "Shhhhh.... you have to sign up", description: "January is a busy month. We'll share what team sizes we're seeing." }
];

const INITIAL_BLOGS: BlogPost[] = [
  { id: 1, title: "Why Hybrid Work is Here to Stay", excerpt: "The data is in. Employees want flexibility.", content: "<p>The data is in. Employees want flexibility...</p>", author: "Sarah Jenkins", date: "Oct 24, 2024", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80", tags: ["Trends", "Data"] },
  { id: 2, title: "5 Ways to Activate Your Community", excerpt: "Community isn't just a buzzword.", content: "<p>Community isn't just a buzzword...</p>", author: "David Miller", date: "Oct 10, 2024", imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80", tags: ["Community", "Operations"] }
];

const INITIAL_TESTIMONIALS: Testimonial[] = [
    { id: 1, quote: "Joining this alliance changed my business. The marketing experiments we run together have saved me thousands of dollars.", name: "Sarah J.", title: "Operator", space: "The Hive Denver" },
    { id: 2, quote: "I had 5,000 sqft of empty retail space. Denver Coworks connected me with an operator who filled it in 4 months.", name: "Michael R.", title: "Commercial Landlord", space: "RiNo Properties" },
    { id: 3, quote: "The honest conversations are invaluable. It's lonely at the top, but not when you have this group.", name: "David K.", title: "Founder", space: "TechSpace LoDo" }
];

const INITIAL_SUCCESS_STORIES: SuccessStory[] = [
  { id: 1, type: "Warehouse Conversion", title: "The Industrial Hub", stat: "90% Occupancy", time: "4 Months", desc: "An empty 10,000 sqft warehouse in RiNo sat vacant for 2 years.", image: "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=800&q=80" },
  { id: 2, type: "Retail Turnaround", title: "Main St. Collective", stat: "3x Revenue", time: "3 Months", desc: "A struggling retail strip was converted into a boutique coworking space.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" },
  { id: 3, type: "Office Optimization", title: "The Hybrid Floor", stat: "Zero Vacancy", time: "6 Weeks", desc: "A second-generation office floor was transformed into a hybrid flex space.", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80" }
];

const INITIAL_SEO_PAGES: SeoSettings[] = [
  {
    id: 'home',
    title: "Denver Coworks | The Premier Alliance",
    description: "A coworking alliance of space operators, community managers, and industry experts in the greater Denver area.",
    keywords: "coworking, denver, office space, shared workspace, alliance",
    ogImage: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=80",
    logoUrl: ""
  },
  {
    id: 'events-page',
    title: "Upcoming Events - Denver Coworks Alliance",
    description: "Join our community of space operators for in-person gatherings, space tours, and roundtable discussions in Denver.",
    keywords: "coworking events, denver networking, space tours, operator meetups, real estate events",
    ogImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    logoUrl: ""
  },
  {
    id: 'blog-page',
    title: "Alliance Insights - Coworking Trends & Strategy",
    description: "Expert advice, market research, and operational tips from Denver's leading coworking operators.",
    keywords: "coworking blog, office trends, workspace strategy, denver business, commercial real estate",
    ogImage: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    logoUrl: ""
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Local State (Fallback)
  const [localSpaces, setLocalSpaces] = useState<Space[]>(() => {
    try { return JSON.parse(localStorage.getItem('dc_spaces') || 'null') || INITIAL_SPACES; } catch { return INITIAL_SPACES; }
  });
  const [localEvents, setLocalEvents] = useState<Event[]>(() => {
    try { return JSON.parse(localStorage.getItem('dc_events') || 'null') || INITIAL_EVENTS; } catch { return INITIAL_EVENTS; }
  });
  const [localBlogs, setLocalBlogs] = useState<BlogPost[]>(() => {
    try { return JSON.parse(localStorage.getItem('dc_blogs') || 'null') || INITIAL_BLOGS; } catch { return INITIAL_BLOGS; }
  });
  const [localLeads, setLocalLeads] = useState<Lead[]>(() => {
    try { return JSON.parse(localStorage.getItem('dc_leads') || 'null') || []; } catch { return []; }
  });
  const [localRsvps, setLocalRsvps] = useState<Rsvp[]>(() => {
    try { return JSON.parse(localStorage.getItem('dc_rsvps') || 'null') || []; } catch { return []; }
  });
  const [localMedia, setLocalMedia] = useState<MediaItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('dc_media') || 'null') || []; } catch { return []; }
  });
  const [localTestimonials, setLocalTestimonials] = useState<Testimonial[]>(() => {
    try { return JSON.parse(localStorage.getItem('dc_testimonials') || 'null') || INITIAL_TESTIMONIALS; } catch { return INITIAL_TESTIMONIALS; }
  });
  const [localSuccessStories, setLocalSuccessStories] = useState<SuccessStory[]>(() => {
    try { return JSON.parse(localStorage.getItem('dc_success_stories') || 'null') || INITIAL_SUCCESS_STORIES; } catch { return INITIAL_SUCCESS_STORIES; }
  });
  const [localSeoPages, setLocalSeoPages] = useState<SeoSettings[]>(() => {
    try { return JSON.parse(localStorage.getItem('dc_seo_pages') || 'null') || INITIAL_SEO_PAGES; } catch { return INITIAL_SEO_PAGES; }
  });

  // Live State (Firebase)
  const [firebaseSpaces, setFirebaseSpaces] = useState<Space[]>([]);
  const [firebaseEvents, setFirebaseEvents] = useState<Event[]>([]);
  const [firebaseBlogs, setFirebaseBlogs] = useState<BlogPost[]>([]);
  const [firebaseLeads, setFirebaseLeads] = useState<Lead[]>([]);
  const [firebaseRsvps, setFirebaseRsvps] = useState<Rsvp[]>([]);
  const [firebaseMedia, setFirebaseMedia] = useState<MediaItem[]>([]);
  const [firebaseTestimonials, setFirebaseTestimonials] = useState<Testimonial[]>([]);
  const [firebaseSuccessStories, setFirebaseSuccessStories] = useState<SuccessStory[]>([]);
  const [firebaseSeoPages, setFirebaseSeoPages] = useState<SeoSettings[]>(INITIAL_SEO_PAGES);
  
  const source = isFirebaseLive && db ? 'firebase' : 'local';

  // --- Firebase Listeners ---
  useEffect(() => {
    if (source === 'firebase' && db) {
      const unsubSpaces = onSnapshot(collection(db, 'spaces'), (s) => setFirebaseSpaces(s.docs.map(d => ({ id: d.id, ...d.data() } as Space))));
      const unsubEvents = onSnapshot(collection(db, 'events'), (s) => setFirebaseEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as Event))));
      const unsubBlogs = onSnapshot(collection(db, 'blogs'), (s) => setFirebaseBlogs(s.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost))));
      const unsubLeads = onSnapshot(collection(db, 'leads'), (s) => {
         const data = s.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
         data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
         setFirebaseLeads(data);
      });
      const unsubRsvps = onSnapshot(collection(db, 'rsvps'), (s) => {
         const data = s.docs.map(d => ({ id: d.id, ...d.data() } as Rsvp));
         data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
         setFirebaseRsvps(data);
      });
      const unsubMedia = onSnapshot(collection(db, 'media'), (s) => {
         const data = s.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem));
         data.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
         setFirebaseMedia(data);
      });
      const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (s) => setFirebaseTestimonials(s.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial))));
      const unsubStories = onSnapshot(collection(db, 'success_stories'), (s) => setFirebaseSuccessStories(s.docs.map(d => ({ id: d.id, ...d.data() } as SuccessStory))));
      const unsubSeo = onSnapshot(collection(db, 'seo_pages'), (s) => {
         if (!s.empty) setFirebaseSeoPages(s.docs.map(d => ({ id: d.id, ...d.data() } as SeoSettings)));
      });

      return () => {
        unsubSpaces(); unsubEvents(); unsubBlogs(); unsubLeads(); unsubRsvps(); unsubMedia(); unsubTestimonials(); unsubStories(); unsubSeo();
      };
    }
  }, [source]);

  // --- Local Storage Persistence ---
  useEffect(() => {
    if (source === 'local') {
      try {
        localStorage.setItem('dc_spaces', JSON.stringify(localSpaces));
        localStorage.setItem('dc_events', JSON.stringify(localEvents));
        localStorage.setItem('dc_blogs', JSON.stringify(localBlogs));
        localStorage.setItem('dc_leads', JSON.stringify(localLeads));
        localStorage.setItem('dc_rsvps', JSON.stringify(localRsvps));
        localStorage.setItem('dc_media', JSON.stringify(localMedia));
        localStorage.setItem('dc_testimonials', JSON.stringify(localTestimonials));
        localStorage.setItem('dc_success_stories', JSON.stringify(localSuccessStories));
        localStorage.setItem('dc_seo_pages', JSON.stringify(localSeoPages));
      } catch (error) {
        console.error("Error saving to Local Storage (Quota likely exceeded)", error);
      }
    }
  }, [localSpaces, localEvents, localBlogs, localLeads, localRsvps, localMedia, localTestimonials, localSuccessStories, localSeoPages, source]);

  // Helper to handle Firebase Errors
  const handleFirebaseError = (error: any) => {
     console.error("Firebase Error:", error);
     if (error.code === 'permission-denied' || (error.message && error.message.includes("permission-denied"))) {
        alert("Permission denied! Go to Firebase Console > Storage > Rules and change them to 'allow read, write: if true;'");
     } else {
        alert("Error saving data. Check console for details.");
     }
  };

  // --- Actions ---
  const addSpace = async (space: Omit<Space, 'id'>) => {
    if (source === 'firebase' && db) {
      try { await addDoc(collection(db, 'spaces'), space); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalSpaces(prev => [...prev, { ...space, id: Date.now() }]);
    }
  };

  const updateSpace = async (id: string | number, data: Partial<Space>) => {
    if (source === 'firebase' && db) {
      try { await updateDoc(doc(db, 'spaces', String(id)), data); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalSpaces(prev => prev.map(s => String(s.id) === String(id) ? { ...s, ...data } : s));
    }
  };

  const removeSpace = async (id: number | string) => {
    if (source === 'firebase' && db) {
      try { await deleteDoc(doc(db, 'spaces', String(id))); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalSpaces(prev => prev.filter(s => String(s.id) !== String(id)));
    }
  };

  const addEvent = async (event: Omit<Event, 'id'>) => {
    if (source === 'firebase' && db) {
      try { await addDoc(collection(db, 'events'), event); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalEvents(prev => [...prev, { ...event, id: Date.now() }]);
    }
  };

  const updateEvent = async (id: string | number, data: Partial<Event>) => {
    if (source === 'firebase' && db) {
      try { await updateDoc(doc(db, 'events', String(id)), data); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalEvents(prev => prev.map(e => String(e.id) === String(id) ? { ...e, ...data } : e));
    }
  };

  const removeEvent = async (id: number | string) => {
    if (source === 'firebase' && db) {
      try { await deleteDoc(doc(db, 'events', String(id))); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalEvents(prev => prev.filter(e => String(e.id) !== String(id)));
    }
  };

  const addBlog = async (blog: Omit<BlogPost, 'id'>) => {
    if (source === 'firebase' && db) {
      try { await addDoc(collection(db, 'blogs'), blog); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalBlogs(prev => [ { ...blog, id: Date.now() }, ...prev ]);
    }
  };

  const updateBlog = async (id: string | number, data: Partial<BlogPost>) => {
    if (source === 'firebase' && db) {
      try { await updateDoc(doc(db, 'blogs', String(id)), data); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalBlogs(prev => prev.map(b => String(b.id) === String(id) ? { ...b, ...data } : b));
    }
  };

  const removeBlog = async (id: number | string) => {
    if (source === 'firebase' && db) {
      try { await deleteDoc(doc(db, 'blogs', String(id))); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalBlogs(prev => prev.filter(b => String(b.id) !== String(id)));
    }
  };

  const addLead = async (lead: Omit<Lead, 'id'>) => {
     if (source === 'firebase' && db) {
       try { await addDoc(collection(db, 'leads'), lead); } catch (e) { handleFirebaseError(e); throw e; }
    } else {
      setLocalLeads(prev => [ { ...lead, id: Date.now() }, ...prev ]); 
    }
  }

  const removeLead = async (id: number | string) => {
    if (source === 'firebase' && db) {
      try { await deleteDoc(doc(db, 'leads', String(id))); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalLeads(prev => prev.filter(l => String(l.id) !== String(id)));
    }
  };

  const addRsvp = async (rsvp: Omit<Rsvp, 'id'>) => {
    if (source === 'firebase' && db) {
       try { await addDoc(collection(db, 'rsvps'), rsvp); } catch (e) { handleFirebaseError(e); throw e; }
    } else {
      setLocalRsvps(prev => [ { ...rsvp, id: Date.now() }, ...prev ]);
    }
  }

  const removeRsvp = async (id: number | string) => {
    if (source === 'firebase' && db) {
       try { await deleteDoc(doc(db, 'rsvps', String(id))); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalRsvps(prev => prev.filter(r => String(r.id) !== String(id)));
    }
  };

  const addTestimonial = async (t: Omit<Testimonial, 'id'>) => {
    if (source === 'firebase' && db) {
       try { await addDoc(collection(db, 'testimonials'), t); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalTestimonials(prev => [ ...prev, { ...t, id: Date.now() } ]);
    }
  };

  const updateTestimonial = async (id: string | number, data: Partial<Testimonial>) => {
    if (source === 'firebase' && db) {
       try { await updateDoc(doc(db, 'testimonials', String(id)), data); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalTestimonials(prev => prev.map(t => String(t.id) === String(id) ? { ...t, ...data } : t));
    }
  };

  const removeTestimonial = async (id: number | string) => {
    if (source === 'firebase' && db) {
       try { await deleteDoc(doc(db, 'testimonials', String(id))); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalTestimonials(prev => prev.filter(t => String(t.id) !== String(id)));
    }
  };
  
  const addSuccessStory = async (story: Omit<SuccessStory, 'id'>) => {
    if (source === 'firebase' && db) {
       try { await addDoc(collection(db, 'success_stories'), story); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalSuccessStories(prev => [ ...prev, { ...story, id: Date.now() } ]);
    }
  };

  const updateSuccessStory = async (id: string | number, data: Partial<SuccessStory>) => {
    if (source === 'firebase' && db) {
       try { await updateDoc(doc(db, 'success_stories', String(id)), data); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalSuccessStories(prev => prev.map(s => String(s.id) === String(id) ? { ...s, ...data } : s));
    }
  };

  const removeSuccessStory = async (id: number | string) => {
    if (source === 'firebase' && db) {
       try { await deleteDoc(doc(db, 'success_stories', String(id))); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalSuccessStories(prev => prev.filter(s => String(s.id) !== String(id)));
    }
  };

  const updateSeoPage = async (pageId: string, settings: SeoSettings) => {
    const cleanSettings = { ...settings, id: pageId };
    if (source === 'firebase' && db) {
       try { await setDoc(doc(db, 'seo_pages', pageId), cleanSettings); } catch (e) { handleFirebaseError(e); }
    } else {
      setLocalSeoPages(prev => {
        const exists = prev.find(p => p.id === pageId);
        if (exists) return prev.map(p => p.id === pageId ? cleanSettings : p);
        return [...prev, cleanSettings];
      });
    }
  };

  const getSeoForPage = (pageId: string): SeoSettings => {
    const pages = source === 'firebase' ? firebaseSeoPages : localSeoPages;
    const found = pages.find(p => p.id === pageId);
    if (found) return found;
    const specificDefault = INITIAL_SEO_PAGES.find(p => p.id === pageId);
    if (specificDefault) return specificDefault;
    return { ...INITIAL_SEO_PAGES[0], id: pageId };
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (source === 'firebase' && storage && db) {
      try {
        const storageRef = ref(storage, 'uploads/' + Date.now() + '_' + file.name);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        await addDoc(collection(db, 'media'), {
          url: downloadURL,
          name: file.name,
          uploadedAt: new Date().toISOString()
        });

        return downloadURL;
      } catch (error) {
        handleFirebaseError(error);
        throw new Error("Upload failed");
      }
    } else {
      // Fallback: Local Base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const newMedia = {
            id: Date.now(),
            url: result,
            name: file.name,
            uploadedAt: new Date().toISOString()
          };
          setLocalMedia(prev => [newMedia, ...prev]);
          resolve(result);
        };
        reader.onerror = error => reject(error);
      });
    }
  };

  const resetData = () => {
    if (window.confirm('Reset LOCAL data? (Firebase data remains untouched)')) {
      if (source === 'local') {
        setLocalSpaces(INITIAL_SPACES);
        setLocalEvents(INITIAL_EVENTS);
        setLocalBlogs(INITIAL_BLOGS);
        setLocalLeads([]);
        setLocalRsvps([]);
        setLocalMedia([]);
        setLocalTestimonials(INITIAL_TESTIMONIALS);
        setLocalSuccessStories(INITIAL_SUCCESS_STORIES);
        setLocalSeoPages(INITIAL_SEO_PAGES);
        localStorage.clear();
        window.location.reload();
      } else {
        alert("You are in Firebase mode. Bulk reset is disabled for safety.");
      }
    }
  };

  const seedDatabase = async () => {
    if (source !== 'firebase' || !db) {
      alert("Not connected to Firebase.");
      return;
    }
    if (!window.confirm("This will upload all CURRENT data (from your local session) to the live Firebase Database. Continue?")) {
      return;
    }
    
    try {
      // Helper to migrate array of items
      // We prioritize the current state variables (localSpaces, localEvents) which contain user edits
      // if the firebase collection is empty.
      
      const migrateCollection = async (collectionName: string, items: any[]) => {
          for (const item of items) {
             const { id, ...data } = item;
             await addDoc(collection(db!, collectionName), data);
          }
      }

      await migrateCollection('spaces', localSpaces);
      await migrateCollection('events', localEvents);
      await migrateCollection('blogs', localBlogs);
      await migrateCollection('testimonials', localTestimonials);
      await migrateCollection('success_stories', localSuccessStories);
      
      // SEO is special because it uses setDoc with specific IDs
      for (const item of localSeoPages) {
         const { id, ...data } = item;
         if (id) await setDoc(doc(db, 'seo_pages', id), data);
      }

      alert("Database migrated successfully! Refresh the page to see content served from the cloud.");
    } catch (e) {
      handleFirebaseError(e);
    }
  };

  return (
    <DataContext.Provider value={{ 
      spaces: source === 'firebase' ? firebaseSpaces : localSpaces, 
      events: source === 'firebase' ? firebaseEvents : localEvents, 
      blogs: source === 'firebase' ? firebaseBlogs : localBlogs,
      leads: source === 'firebase' ? firebaseLeads : localLeads,
      rsvps: source === 'firebase' ? firebaseRsvps : localRsvps,
      seoPages: source === 'firebase' ? firebaseSeoPages : localSeoPages,
      media: source === 'firebase' ? firebaseMedia : localMedia,
      testimonials: source === 'firebase' ? firebaseTestimonials : localTestimonials,
      successStories: source === 'firebase' ? firebaseSuccessStories : localSuccessStories,
      addSpace, updateSpace, removeSpace, 
      addEvent, updateEvent, removeEvent,
      addBlog, updateBlog, removeBlog,
      addLead, removeLead,
      addRsvp, removeRsvp,
      addTestimonial, updateTestimonial, removeTestimonial,
      addSuccessStory, updateSuccessStory, removeSuccessStory,
      updateSeoPage, getSeoForPage,
      uploadFile, resetData, seedDatabase, source
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};