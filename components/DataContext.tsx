import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from './supabase';

export interface Space {
  id: number | string;
  name: string;
  neighborhood: string;
  address: string;
  vibe: string;
  imageUrl: string;
  description?: string;
  images?: string[];
  videoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  ownerId?: string;
  amenities?: string[];
  website?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  addressLat?: number;
  addressLng?: number;
}

export interface Neighborhood {
  id: string;
  name: string;
}

export interface Event {
  id: number | string;
  image: string;
  topic: string;
  date: string;
  time: string;
  startTime?: string;
  durationMinutes?: number;
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
  description: string;
  image: string;
}

export interface Profile {
  id: string;
  role: 'super_admin' | 'space_user' | 'user';
  email: string;
  full_name?: string;
  notification_settings: {
    email_alerts: boolean;
  };
}

export interface ExpertSubmission {
  id: string;
  name: string;
  email: string;
  address: string;
  buildingSize: string;
  buildingType: string;
  goal: string;
  createdAt: string;
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
  expertSubmissions: ExpertSubmission[];
  neighborhoods: Neighborhood[];
  profiles: Profile[];

  addSpace: (space: Omit<Space, 'id'>) => void;
  updateSpace: (id: string | number, space: Partial<Space>) => void;
  removeSpace: (id: number | string) => void;

  addNeighborhood: (name: string) => Promise<Neighborhood | null>;
  fetchNeighborhoods: () => Promise<void>;
  fetchProfiles: () => Promise<void>;
  fetchEvents: () => Promise<void>;

  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string | number, event: Partial<Event>) => void;
  removeEvent: (id: number | string) => void;

  addBlog: (blog: Omit<BlogPost, 'id'>) => Promise<void>;
  updateBlog: (id: string | number, data: Partial<BlogPost>) => Promise<void>;
  removeBlog: (id: number | string) => Promise<void>;

  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  removeLead: (id: number | string) => Promise<void>;

  addRsvp: (rsvp: Omit<Rsvp, 'id'>) => Promise<void>;
  removeRsvp: (id: number | string) => Promise<void>;

  addTestimonial: (t: Omit<Testimonial, 'id'>) => Promise<void>;
  updateTestimonial: (id: string | number, data: Partial<Testimonial>) => Promise<void>;
  removeTestimonial: (id: string | number) => Promise<void>;

  removeExpertSubmission: (id: string) => Promise<void>;

  addSuccessStory: (s: Omit<SuccessStory, 'id'>) => Promise<void>;
  updateSuccessStory: (id: string | number, data: Partial<SuccessStory>) => Promise<void>;
  removeSuccessStory: (id: number | string) => Promise<void>;

  updateSeoPage: (pageId: string, settings: SeoSettings) => Promise<void>;
  getSeoForPage: (pageId: string) => SeoSettings;

  uploadFile: (file: File) => Promise<string>;

  seedDatabase: () => Promise<void>;
  resetData: () => void;
  source: 'supabase' | 'local';
}

const INITIAL_SPACES: Space[] = [
  { id: 1, name: "The Hive", neighborhood: "LoDo", address: "123 Innovation Dr", vibe: "Industrial Chic", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80", status: 'approved', description: "A buzzing community of innovators." },
  { id: 2, name: "Canvas Collective", neighborhood: "RiNo", address: "", vibe: "Artistic & Raw", imageUrl: "https://images.unsplash.com/photo-1518542698889-ca82262f08d5?auto=format&fit=crop&w=800&q=80", status: 'approved' },
  { id: 3, name: "Union Hall", neighborhood: "Union Station", address: "", vibe: "Luxury Professional", imageUrl: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80", status: 'approved' },
  { id: 4, name: "Basecamp", neighborhood: "Boulder", address: "", vibe: "Startup Energy", imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80", status: 'approved' },
  { id: 5, name: "The Study", neighborhood: "Highlands", address: "", vibe: "Quiet Focus", imageUrl: "https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&w=800&q=80", status: 'approved' },
  { id: 6, name: "TechHub", neighborhood: "DTC", address: "", vibe: "Corporate Flex", imageUrl: "https://images.unsplash.com/photo-1593642632823-8f7856677741?auto=format&fit=crop&w=800&q=80", status: 'approved' },
  { id: 7, name: "Ironworks", neighborhood: "Golden", address: "", vibe: "Rustic Modern", imageUrl: "https://images.unsplash.com/photo-1505409859974-78b3d6aa12f3?auto=format&fit=crop&w=800&q=80", status: 'approved' },
  { id: 8, name: "Altitude", neighborhood: "Cherry Creek", address: "", vibe: "Executive Suite", imageUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80", status: 'approved' }
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
  { id: 1, type: "Warehouse Conversion", title: "The Industrial Hub", stat: "90% Occupancy", time: "4 Months", description: "An empty 10,000 sqft warehouse in RiNo sat vacant for 2 years.", image: "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?auto=format&fit=crop&w=800&q=80" },
  { id: 2, type: "Retail Turnaround", title: "Main St. Collective", stat: "3x Revenue", time: "3 Months", description: "A struggling retail strip was converted into a boutique coworking space.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" },
  { id: 3, type: "Office Optimization", title: "The Hybrid Floor", stat: "Zero Vacancy", time: "6 Weeks", description: "A second-generation office floor was transformed into a hybrid flex space.", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80" }
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
  },
  {
    id: 'why-join-page',
    title: "Why Join Denver Coworks Alliance?",
    description: "Discover the benefits of joining Denver's premier collective of coworking space operators and owners.",
    keywords: "join coworking alliance, operator benefits, community manager network, denver coworking",
    ogImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    logoUrl: ""
  },
  {
    id: 'landlord-page',
    title: "For Landlords - Monetize Your Empty Space",
    description: "Turn vacancy into vibrancy. Learn how to convert your property into a high-revenue flexible workspace.",
    keywords: "landlord coworking, asset monetization, flexible office conversion, commercial real estate denver",
    ogImage: "https://images.unsplash.com/photo-1497215842964-2229243e8a01?auto=format&fit=crop&w=1200&q=80",
    logoUrl: ""
  },
  {
    id: 'landlord-schedule',
    title: "Schedule an Expert Consultation",
    description: "Speak with a Denver Coworking expert to identify the best strategy for your commercial property.",
    keywords: "coworking consultation, real estate strategy, landord support, denver office market",
    ogImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    logoUrl: ""
  },
  {
    id: 'apply-page',
    title: "Apply for Alliance Membership",
    description: "Join the Denver Coworks Alliance. Apply today to connect with Denver's top coworking professionals.",
    keywords: "membership application, coworking alliance denver, join community",
    ogImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    logoUrl: ""
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [expertSubmissions, setExpertSubmissions] = useState<ExpertSubmission[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [seoPages, setSeoPages] = useState<SeoSettings[]>(INITIAL_SEO_PAGES);

  const source = 'supabase';

  const mapDbToSpace = (row: any): Space => ({
    id: row.id,
    name: row.name || '',
    neighborhood: row.neighborhood || '',
    address: row.address || '',
    vibe: row.vibe || '',
    imageUrl: row.image_url || '',
    description: row.description || undefined,
    images: row.images || [],
    videoUrl: row.video_url || undefined,
    status: row.status || 'approved',
    ownerId: row.owner_id || undefined,
    amenities: row.amenities || [],
    website: row.website || undefined,
    addressStreet: row.address_street || undefined,
    addressCity: row.address_city || undefined,
    addressState: row.address_state || undefined,
    addressZip: row.address_zip || undefined,
    addressLat: row.address_lat || undefined,
    addressLng: row.address_lng || undefined
  });

  const mapDbToEvent = (row: any): Event => ({
    id: row.id,
    image: row.image,
    topic: row.topic,
    date: row.date,
    time: row.time,
    startTime: row.start_time,
    durationMinutes: row.duration_minutes,
    location: row.location,
    description: row.description
  });

  const mapDbToBlog = (row: any): BlogPost => ({
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    date: row.date,
    imageUrl: row.image_url,
    tags: row.tags || []
  });

  const mapDbToLead = (row: any): Lead => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    type: row.type,
    address: row.address,
    buildingSize: row.building_size,
    message: row.message,
    timestamp: row.timestamp
  });

  const mapDbToRsvp = (row: any): Rsvp => ({
    id: row.id,
    eventName: row.event_name,
    attendeeName: row.attendee_name,
    email: row.email,
    spaceName: row.space_name,
    timestamp: row.timestamp
  });

  const mapDbToMedia = (row: any): MediaItem => ({
    id: row.id,
    url: row.url,
    name: row.name,
    uploadedAt: row.uploaded_at
  });

  const mapDbToTestimonial = (row: any): Testimonial => ({
    id: row.id,
    name: row.name,
    title: row.title,
    space: row.space,
    quote: row.quote
  });

  const mapDbToSuccessStory = (row: any): SuccessStory => ({
    id: row.id,
    type: row.type,
    title: row.title,
    stat: row.stat,
    time: row.time,
    description: row.description,
    image: row.image
  });

  const mapDbToSeoPage = (row: any): SeoSettings => ({
    id: row.id,
    title: row.title,
    description: row.description,
    keywords: row.keywords,
    ogImage: row.og_image,
    logoUrl: row.logo_url
  });

  useEffect(() => {
    fetchSpaces();
    fetchEvents();
    fetchBlogs();
    fetchLeads();
    fetchRsvps();
    fetchMedia();
    fetchTestimonials();
    fetchSuccessStories();
    fetchSeoPages();
    fetchNeighborhoods();
    fetchExpertSubmissions();
    fetchProfiles();

    const spacesSubscription = supabase
      .channel('spaces_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spaces' }, () => {
        fetchSpaces();
      })
      .subscribe();

    const eventsSubscription = supabase
      .channel('events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents();
      })
      .subscribe();

    const blogsSubscription = supabase
      .channel('blogs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blogs' }, () => {
        fetchBlogs();
      })
      .subscribe();

    const leadsSubscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    const rsvpsSubscription = supabase
      .channel('rsvps_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, () => {
        fetchRsvps();
      })
      .subscribe();

    const mediaSubscription = supabase
      .channel('media_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, () => {
        fetchMedia();
      })
      .subscribe();

    const testimonialsSubscription = supabase
      .channel('testimonials_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        fetchTestimonials();
      })
      .subscribe();

    const successStoriesSubscription = supabase
      .channel('success_stories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'success_stories' }, () => {
        fetchSuccessStories();
      })
      .subscribe();

    const seoPagesSubscription = supabase
      .channel('seo_pages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seo_pages' }, () => {
        fetchSeoPages();
      })
      .subscribe();

    const profilesSubscription = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchProfiles();
      })
      .subscribe();

    return () => {
      spacesSubscription.unsubscribe();
      eventsSubscription.unsubscribe();
      blogsSubscription.unsubscribe();
      leadsSubscription.unsubscribe();
      rsvpsSubscription.unsubscribe();
      mediaSubscription.unsubscribe();
      testimonialsSubscription.unsubscribe();
      successStoriesSubscription.unsubscribe();
      seoPagesSubscription.unsubscribe();
      profilesSubscription.unsubscribe();
    };
  }, []);

  const fetchSpaces = async () => {
    const { data, error } = await supabase.from('spaces').select('*');
    if (error) {
      console.error('Error fetching spaces:', error);
      return;
    }
    setSpaces((data || []).map(mapDbToSpace));
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching events:', error);
      return;
    }
    setEvents((data || []).map(mapDbToEvent));
  };

  const fetchBlogs = async () => {
    const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching blogs:', error);
      return;
    }
    setBlogs((data || []).map(mapDbToBlog));
  };

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('leads').select('*').order('timestamp', { ascending: false });
    if (error) {
      console.error('Error fetching leads:', error);
      return;
    }
    setLeads((data || []).map(mapDbToLead));
  };

  const fetchRsvps = async () => {
    const { data, error } = await supabase.from('rsvps').select('*').order('timestamp', { ascending: false });
    if (error) {
      console.error('Error fetching rsvps:', error);
      return;
    }
    setRsvps((data || []).map(mapDbToRsvp));
  };

  const fetchMedia = async () => {
    const { data, error } = await supabase.from('media').select('*').order('uploaded_at', { ascending: false });
    if (error) {
      console.error('Error fetching media:', error);
      return;
    }
    setMedia((data || []).map(mapDbToMedia));
  };

  const fetchTestimonials = async () => {
    const { data, error } = await supabase.from('testimonials').select('*');
    if (error) {
      console.error('Error fetching testimonials:', error);
      return;
    }
    setTestimonials((data || []).map(mapDbToTestimonial));
  };

  const fetchSuccessStories = async () => {
    const { data, error } = await supabase.from('success_stories').select('*');
    if (error) {
      console.error('Error fetching success stories:', error);
      return;
    }
    setSuccessStories((data || []).map(mapDbToSuccessStory));
  };

  const fetchSeoPages = async () => {
    const { data, error } = await supabase.from('seo_pages').select('*');
    if (error) {
      console.error('Error fetching SEO pages:', error);
      return;
    }
    if (data && data.length > 0) {
      setSeoPages(data.map(mapDbToSeoPage));
    }
  };

  const fetchNeighborhoods = async () => {
    const { data, error } = await supabase.from('neighborhoods').select('*').order('name');
    if (error) {
      console.error('Error fetching neighborhoods:', error);
      return;
    }
    setNeighborhoods(data || []);
  };

  const fetchExpertSubmissions = async () => {
    const { data, error } = await supabase
      .from('expert_finder_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expert submissions:', error);
      return;
    }

    setExpertSubmissions((data || []).map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      buildingSize: s.building_size,
      buildingType: s.building_type,
      goal: s.goal,
      createdAt: s.created_at
    })));
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    setProfiles((data || []).map(p => ({
      id: p.id,
      role: p.role,
      email: p.email,
      full_name: p.full_name,
      notification_settings: p.notification_settings || { email_alerts: true }
    })));
  };

  const addNeighborhood = async (name: string): Promise<Neighborhood | null> => {
    const { data, error } = await supabase.from('neighborhoods').insert({ name }).select().single();
    if (error) {
      console.error('Error adding neighborhood:', error);
      alert("Failed to add neighborhood. It might already exist.");
      throw error;
    }
    await fetchNeighborhoods();
    return data;
  };

  const addSpace = async (space: Omit<Space, 'id'>) => {
    const { error } = await supabase.from('spaces').insert({
      name: space.name,
      neighborhood: space.neighborhood,
      address: space.address,
      vibe: space.vibe,
      image_url: space.imageUrl,
      description: space.description,
      images: space.images,
      video_url: space.videoUrl,
      status: space.status || 'pending',
      owner_id: space.ownerId,
      amenities: space.amenities,
      website: space.website,
      address_street: space.addressStreet,
      address_city: space.addressCity,
      address_state: space.addressState,
      address_zip: space.addressZip,
      address_lat: space.addressLat,
      address_lng: space.addressLng
    });
    if (error) {
      console.error('Error adding space:', error);
      throw error;
    }
    await fetchSpaces();
  };

  const updateSpace = async (id: string | number, data: Partial<Space>) => {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.vibe !== undefined) updateData.vibe = data.vibe;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.videoUrl !== undefined) updateData.video_url = data.videoUrl;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.ownerId !== undefined) updateData.owner_id = data.ownerId;
    if (data.amenities !== undefined) updateData.amenities = data.amenities;
    if (data.amenities !== undefined) updateData.amenities = data.amenities;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.addressStreet !== undefined) updateData.address_street = data.addressStreet;
    if (data.addressCity !== undefined) updateData.address_city = data.addressCity;
    if (data.addressState !== undefined) updateData.address_state = data.addressState;
    if (data.addressZip !== undefined) updateData.address_zip = data.addressZip;
    if (data.addressLat !== undefined) updateData.address_lat = data.addressLat;
    if (data.addressLng !== undefined) updateData.address_lng = data.addressLng;

    const { error } = await supabase.from('spaces').update(updateData).eq('id', id);
    if (error) {
      console.error('Error updating space:', error);
      throw error;
    }
    await fetchSpaces();
  };

  const removeSpace = async (id: number | string) => {
    const { error } = await supabase.from('spaces').delete().eq('id', id);
    if (error) {
      console.error('Error deleting space:', error);
      return;
    }
    await fetchSpaces();
  };

  const addEvent = async (event: Omit<Event, 'id'>) => {
    const { error } = await supabase.from('events').insert({
      image: event.image,
      topic: event.topic,
      date: event.date,
      time: event.time,
      start_time: event.startTime,
      duration_minutes: event.durationMinutes,
      location: event.location,
      description: event.description
    });
    if (error) {
      console.error('Error adding event:', error);
      return;
    }
    await fetchEvents();
  };

  const updateEvent = async (id: string | number, data: Partial<Event>) => {
    const updateData: any = {};
    if (data.image !== undefined) updateData.image = data.image;
    if (data.topic !== undefined) updateData.topic = data.topic;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.time !== undefined) updateData.time = data.time;
    if (data.startTime !== undefined) updateData.start_time = data.startTime;
    if (data.durationMinutes !== undefined) updateData.duration_minutes = data.durationMinutes;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.description !== undefined) updateData.description = data.description;

    const { error } = await supabase.from('events').update(updateData).eq('id', id);
    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }
    await fetchEvents();
  };

  const removeEvent = async (id: number | string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('Error deleting event:', error);
      return;
    }
    await fetchEvents();
  };

  const addBlog = async (blog: Omit<BlogPost, 'id'>) => {
    const { error } = await supabase.from('blogs').insert({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      date: blog.date,
      image_url: blog.imageUrl,
      tags: blog.tags
    });
    if (error) {
      console.error('Error adding blog:', error);
      return;
    }
    await fetchBlogs();
  };

  const updateBlog = async (id: string | number, data: Partial<BlogPost>) => {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.author !== undefined) updateData.author = data.author;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
    if (data.tags !== undefined) updateData.tags = data.tags;

    const { error } = await supabase.from('blogs').update(updateData).eq('id', id);
    if (error) {
      console.error('Error updating blog:', error);
      return;
    }
    await fetchBlogs();
  };

  const removeBlog = async (id: number | string) => {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting blog:', error);
      return;
    }
    await fetchBlogs();
  };

  const addLead = async (lead: Omit<Lead, 'id'>) => {
    const { error } = await supabase.from('leads').insert({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      type: lead.type,
      address: lead.address,
      building_size: lead.buildingSize,
      message: lead.message,
      timestamp: lead.timestamp
    });
    if (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  };

  const removeLead = async (id: number | string) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.error('Error deleting lead:', error);
      return;
    }
    await fetchLeads();
  };

  const addRsvp = async (rsvp: Omit<Rsvp, 'id'>) => {
    const { error } = await supabase.from('rsvps').insert({
      event_name: rsvp.eventName,
      attendee_name: rsvp.attendeeName,
      email: rsvp.email,
      space_name: rsvp.spaceName,
      timestamp: rsvp.timestamp
    });
    if (error) {
      console.error('Error adding RSVP:', error);
      throw error;
    }
  };

  const removeRsvp = async (id: number | string) => {
    const { error } = await supabase.from('rsvps').delete().eq('id', id);
    if (error) {
      console.error('Error deleting RSVP:', error);
      return;
    }
    await fetchRsvps();
  };

  const addTestimonial = async (t: Omit<Testimonial, 'id'>) => {
    const { error } = await supabase.from('testimonials').insert(t);
    if (error) {
      console.error('Error adding testimonial:', error);
      return;
    }
    await fetchTestimonials();
  };

  const updateTestimonial = async (id: string | number, data: Partial<Testimonial>) => {
    const { error } = await supabase.from('testimonials').update(data).eq('id', id);
    if (error) {
      console.error('Error updating testimonial:', error);
      return;
    }
    await fetchTestimonials();
  };

  const removeTestimonial = async (id: number | string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) {
      console.error('Error deleting testimonial:', error);
      return;
    }
    await fetchTestimonials();
  };

  const removeExpertSubmission = async (id: string) => {
    const { error } = await supabase.from('expert_finder_submissions').delete().eq('id', id);
    if (error) {
      console.error('Error deleting expert submission:', error);
      return;
    }
    await fetchExpertSubmissions();
  };

  const addSuccessStory = async (story: Omit<SuccessStory, 'id'>) => {
    const { error } = await supabase.from('success_stories').insert({
      type: story.type,
      title: story.title,
      stat: story.stat,
      time: story.time,
      description: story.description,
      image: story.image
    });
    if (error) {
      console.error('Error adding success story:', error);
      return;
    }
    await fetchSuccessStories();
  };

  const updateSuccessStory = async (id: string | number, data: Partial<SuccessStory>) => {
    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.stat !== undefined) updateData.stat = data.stat;
    if (data.time !== undefined) updateData.time = data.time;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image !== undefined) updateData.image = data.image;

    const { error } = await supabase.from('success_stories').update(updateData).eq('id', id);
    if (error) {
      console.error('Error updating success story:', error);
      return;
    }
    await fetchSuccessStories();
  };

  const removeSuccessStory = async (id: number | string) => {
    const { error } = await supabase.from('success_stories').delete().eq('id', id);
    if (error) {
      console.error('Error deleting success story:', error);
      return;
    }
    await fetchSuccessStories();
  };

  const updateSeoPage = async (pageId: string, settings: SeoSettings) => {
    const { error } = await supabase.from('seo_pages').upsert({
      id: pageId,
      title: settings.title,
      description: settings.description,
      keywords: settings.keywords,
      og_image: settings.ogImage,
      logo_url: settings.logoUrl || ''
    });
    if (error) {
      console.error('Error updating SEO page:', error);
      return;
    }
    await fetchSeoPages();
  };

  const getSeoForPage = (pageId: string): SeoSettings => {
    const found = seoPages.find(p => p.id === pageId);
    if (found) return found;
    const specificDefault = INITIAL_SEO_PAGES.find(p => p.id === pageId);
    if (specificDefault) return specificDefault;
    return { ...INITIAL_SEO_PAGES[0], id: pageId };
  };

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const result = reader.result as string;
        try {
          await supabase.from('media').insert({
            url: result,
            name: file.name,
            uploaded_at: new Date().toISOString()
          });
          // Refresh media list immediately after upload
          await fetchMedia();
          resolve(result);
        } catch (error) {
          console.error('Error saving media to database:', error);
          reject(error);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const seedDatabase = async () => {
    if (!window.confirm("This will populate the database with initial data. Continue?")) {
      return;
    }

    try {
      for (const space of INITIAL_SPACES) {
        await addSpace(space);
      }
      for (const event of INITIAL_EVENTS) {
        await addEvent(event);
      }
      for (const blog of INITIAL_BLOGS) {
        await addBlog(blog);
      }
      for (const testimonial of INITIAL_TESTIMONIALS) {
        await addTestimonial(testimonial);
      }
      for (const story of INITIAL_SUCCESS_STORIES) {
        await addSuccessStory(story);
      }
      for (const seoPage of INITIAL_SEO_PAGES) {
        if (seoPage.id) {
          await updateSeoPage(seoPage.id, seoPage);
        }
      }

      await fetchSpaces();
      await fetchEvents();
      await fetchBlogs();
      await fetchTestimonials();
      await fetchSuccessStories();
      await fetchSeoPages();

      alert("Database seeded successfully! The page will reload to show the new data.");
      window.location.reload();
    } catch (e) {
      console.error('Error seeding database:', e);
      alert('Error seeding database. Check console for details.');
    }
  };

  const resetData = () => {
    alert('Reset is not available in Supabase mode. Please manage data through the admin panel.');
  };

  return (
    <DataContext.Provider value={{
      spaces,
      events,
      blogs,
      leads,
      rsvps,
      seoPages,
      media,
      testimonials,
      successStories,
      neighborhoods,
      addSpace, updateSpace, removeSpace,
      addNeighborhood, fetchNeighborhoods,
      addEvent, updateEvent, removeEvent, fetchEvents,
      addBlog, updateBlog, removeBlog,
      addLead, removeLead,
      addRsvp, removeRsvp,
      addTestimonial, updateTestimonial, removeTestimonial,
      removeExpertSubmission,
      addSuccessStory, updateSuccessStory, removeSuccessStory,
      updateSeoPage, getSeoForPage,
      expertSubmissions,
      profiles, fetchProfiles,
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
