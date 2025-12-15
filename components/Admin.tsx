
import React, { useState, useEffect } from 'react';
import { useData, SeoSettings, Space, Event, BlogPost, Testimonial, SuccessStory } from './DataContext';
import SeoScore from './SeoScore';
import RichTextEditor from './RichTextEditor';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import { Trash2, Plus, LogOut, Calendar, LayoutGrid, Edit2, RotateCcw, Database, HardDrive, Inbox, Search, Globe, Image as ImageIcon, Copy, Check, Upload, BookOpen, MessageSquare, Users, Award, X, AlertTriangle, CloudLightning } from 'lucide-react';

interface AdminProps {
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ onLogout }) => {
  const { user, signOut } = useAuth();

  const {
    spaces, events, leads, media, blogs, testimonials, rsvps, successStories,
    getSeoForPage, updateSeoPage,
    addSpace, updateSpace, removeSpace,
    addNeighborhood, fetchNeighborhoods, neighborhoods,
    addEvent, updateEvent, removeEvent,
    addBlog, updateBlog, removeBlog,
    addTestimonial, updateTestimonial, removeTestimonial,
    addSuccessStory, updateSuccessStory, removeSuccessStory,
    removeLead, removeRsvp, uploadFile, resetData, seedDatabase, source
  } = useData();

  const [activeTab, setActiveTab] = useState<'spaces' | 'events' | 'blogs' | 'leads' | 'rsvps' | 'seo' | 'media' | 'testimonials' | 'success-stories' | 'pending'>('pending');

  // Space Form State
  const [editingSpaceId, setEditingSpaceId] = useState<string | number | null>(null);
  const [spaceForm, setSpaceForm] = useState<Partial<Space>>({
    name: '', neighborhood: '', address: '', vibe: '', imageUrl: '',
    description: '', website: '', status: 'approved'
  });

  // Event Form State
  const [editingEventId, setEditingEventId] = useState<string | number | null>(null);
  const [eventForm, setEventForm] = useState({ topic: '', date: '', time: '', image: '', location: '', description: '' });

  // Blog Form State
  const [editingBlogId, setEditingBlogId] = useState<string | number | null>(null);
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', author: '', imageUrl: '', tags: '' });

  // Testimonial Form State
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | number | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({ name: '', title: '', space: '', quote: '' });

  // Success Story Form State
  const [editingSuccessStoryId, setEditingSuccessStoryId] = useState<string | number | null>(null);
  const [successStoryForm, setSuccessStoryForm] = useState({ type: '', title: '', stat: '', time: '', desc: '', image: '' });

  // Media Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [copiedMediaId, setCopiedMediaId] = useState<string | number | null>(null);

  // Media Picker Modal State
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [onMediaSelect, setOnMediaSelect] = useState<((url: string) => void) | null>(null);

  // SEO Form State
  const [selectedPageId, setSelectedPageId] = useState('home');
  const [seoForm, setSeoForm] = useState<SeoSettings>({
    id: 'home', title: '', description: '', keywords: '', ogImage: '', logoUrl: ''
  });
  const [seoSaved, setSeoSaved] = useState(false);

  // Google Calendar Integration State
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [checkingGoogleStatus, setCheckingGoogleStatus] = useState(true);

  // Load SEO data when page selection changes
  useEffect(() => {
    const data = getSeoForPage(selectedPageId);
    setSeoForm(data);
    setSeoSaved(false);
  }, [selectedPageId, activeTab]);

  useEffect(() => {
    if (user) {
      checkGoogleConnection();
    }
  }, [user]);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code && user) {
        await exchangeCodeForToken(code);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleOAuthCallback();
  }, [user]);

  const checkGoogleConnection = async () => {
    setCheckingGoogleStatus(true);
    try {
      const { data, error } = await supabase
        .from('admin_tokens')
        .select('*')
        .eq('token_type', 'google_oauth')
        .maybeSingle();

      setIsGoogleConnected(!error && data && data.refresh_token);
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setIsGoogleConnected(false);
    } finally {
      setCheckingGoogleStatus(false);
    }
  };

  const handleConnectGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    const scope = 'https://www.googleapis.com/auth/calendar.events';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  const exchangeCodeForToken = async (code: string) => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
      const redirectUri = `${window.location.origin}${window.location.pathname}`;

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();

      const { error } = await supabase
        .from('admin_tokens')
        .upsert({
          token_type: 'google_oauth',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          scope: tokenData.scope,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      alert('Google Calendar connected successfully!');
      setIsGoogleConnected(true);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      alert('Failed to connect Google Calendar. Please try again.');
    }
  };

  const openMediaPicker = (callback: (url: string) => void) => {
    setOnMediaSelect(() => callback);
    setShowMediaModal(true);
  };

  const handleSelectMedia = (url: string) => {
    if (onMediaSelect) {
      onMediaSelect(url);
    }
    setShowMediaModal(false);
  };

  // --- SPACE HANDLERS ---
  const handleSubmitSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceForm.name || !spaceForm.imageUrl) return;

    // Construct full address string for display
    const fullAddress = [
      spaceForm.addressStreet,
      spaceForm.addressCity,
      spaceForm.addressState,
      spaceForm.addressZip
    ].filter(Boolean).join(', ');

    try {
      if (editingSpaceId) {
        await updateSpace(editingSpaceId, { ...spaceForm, address: fullAddress });
        setEditingSpaceId(null);
      } else {
        await addSpace({
          ...spaceForm,
          status: 'approved',
          ownerId: user?.id,
          name: spaceForm.name!,
          neighborhood: spaceForm.neighborhood!,
          address: fullAddress, // Calculated full address
          vibe: spaceForm.vibe || '',
          imageUrl: spaceForm.imageUrl!,
          // Pass individual address fields
          addressStreet: spaceForm.addressStreet,
          addressCity: spaceForm.addressCity,
          addressState: spaceForm.addressState,
          addressZip: spaceForm.addressZip
        });
      }
      setSpaceForm({
        name: '', neighborhood: '', address: '', vibe: '', imageUrl: '', description: '', website: '', status: 'approved',
        addressStreet: '', addressCity: '', addressState: '', addressZip: ''
      });
      alert("Space saved successfully!");
    } catch (error: any) {
      console.error("Error saving space:", error);
      alert("Failed to save space. " + (error.message || "Unknown error"));
    }
  };

  const handleEditSpace = (space: Space) => {
    setEditingSpaceId(space.id);
    setSpaceForm({
      name: space.name,
      neighborhood: space.neighborhood,
      address: space.address || '',
      vibe: space.vibe,
      imageUrl: space.imageUrl,
      description: space.description || '',
      website: space.website || '',
      status: space.status,
      addressStreet: space.addressStreet || '',
      addressCity: space.addressCity || '',
      addressState: space.addressState || '',
      addressZip: space.addressZip || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelSpaceEdit = () => {
    setEditingSpaceId(null);
    setSpaceForm({
      name: '', neighborhood: '', address: '', vibe: '', imageUrl: '', description: '', website: '', status: 'approved',
      addressStreet: '', addressCity: '', addressState: '', addressZip: ''
    });
  };

  const handleAddNeighborhood = async () => {
    const name = prompt("Enter new neighborhood name:");
    if (name) {
      await addNeighborhood(name);
    }
  };

  const handleApproveSpace = async (space: Space) => {
    if (window.confirm(`Approve "${space.name}"? It will go live immediately.`)) {
      await updateSpace(space.id, { status: 'approved' });
      alert("Space Approved!");
    }
  };

  const handleRejectSpace = async (space: Space) => {
    if (window.confirm(`Reject "${space.name}"?`)) {
      await updateSpace(space.id, { status: 'rejected' });
    }
  };

  // --- EVENT HANDLERS ---
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.topic || !eventForm.date) return;

    if (editingEventId) {
      await updateEvent(editingEventId, eventForm);
      setEditingEventId(null);
    } else {
      await addEvent(eventForm);

      if (isGoogleConnected) {
        try {
          const { data: newEvents } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

          if (newEvents && newEvents.length > 0) {
            const newEvent = newEvents[0];
            await syncEventToGoogleCalendar(newEvent);
          }
        } catch (error) {
          console.error('Failed to sync event to Google Calendar:', error);
        }
      }
    }
    setEventForm({ topic: '', date: '', time: '', image: '', location: '', description: '' });
  };

  const syncEventToGoogleCalendar = async (event: any) => {
    try {
      const startDateTime = parseDateTimeToISO(event.date, event.time);
      const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-calendar-event`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          title: event.topic,
          description: event.description || '',
          startDateTime,
          endDateTime,
          location: event.location || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Google Calendar event');
      }

      const result = await response.json();
      console.log('Event synced to Google Calendar:', result);
      alert('Event created and synced to Google Calendar!');
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error);
      alert('Event created but failed to sync to Google Calendar. You can manually add attendees later.');
    }
  };

  const parseDateTimeToISO = (date: string, time: string): string => {
    const dateStr = date;
    const timeStr = time || '12:00 PM';

    const dateTimeParts = dateStr.split(/[\s,]+/);
    const timeParts = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)?/i);

    if (!timeParts) {
      return new Date().toISOString();
    }

    let hours = parseInt(timeParts[1]);
    const minutes = timeParts[2] ? parseInt(timeParts[2]) : 0;
    const meridiem = timeParts[3]?.toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    const eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    return eventDate.toISOString();
  };

  const handleEditEvent = (event: Event) => {
    setEditingEventId(event.id);
    setEventForm({
      topic: event.topic,
      date: event.date,
      time: event.time,
      image: event.image,
      location: event.location || '',
      description: event.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEventEdit = () => {
    setEditingEventId(null);
    setEventForm({ topic: '', date: '', time: '', image: '', location: '', description: '' });
  };

  // --- BLOG HANDLERS ---
  const handleSubmitBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) return;

    const tagsArray = blogForm.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const payload = {
      title: blogForm.title,
      excerpt: blogForm.excerpt,
      content: blogForm.content,
      author: blogForm.author || 'Alliance Editor',
      imageUrl: blogForm.imageUrl,
      tags: tagsArray,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    if (editingBlogId) {
      updateBlog(editingBlogId, payload);
      setEditingBlogId(null);
    } else {
      addBlog(payload);
    }
    setBlogForm({ title: '', excerpt: '', content: '', author: '', imageUrl: '', tags: '' });
  };

  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlogId(blog.id);
    setBlogForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      imageUrl: blog.imageUrl,
      tags: blog.tags.join(', ')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelBlogEdit = () => {
    setEditingBlogId(null);
    setBlogForm({ title: '', excerpt: '', content: '', author: '', imageUrl: '', tags: '' });
  };

  // --- TESTIMONIAL HANDLERS ---
  const handleSubmitTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.name || !testimonialForm.quote) return;

    if (editingTestimonialId) {
      updateTestimonial(editingTestimonialId, testimonialForm);
      setEditingTestimonialId(null);
    } else {
      addTestimonial(testimonialForm);
    }
    setTestimonialForm({ name: '', title: '', space: '', quote: '' });
  };

  const handleEditTestimonial = (t: Testimonial) => {
    setEditingTestimonialId(t.id);
    setTestimonialForm({ name: t.name, title: t.title, space: t.space, quote: t.quote });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelTestimonialEdit = () => {
    setEditingTestimonialId(null);
    setTestimonialForm({ name: '', title: '', space: '', quote: '' });
  };

  // --- SUCCESS STORY HANDLERS ---
  const handleSubmitSuccessStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!successStoryForm.title || !successStoryForm.stat) return;

    if (editingSuccessStoryId) {
      updateSuccessStory(editingSuccessStoryId, successStoryForm);
      setEditingSuccessStoryId(null);
    } else {
      addSuccessStory(successStoryForm);
    }
    setSuccessStoryForm({ type: '', title: '', stat: '', time: '', desc: '', image: '' });
  };

  const handleEditSuccessStory = (s: SuccessStory) => {
    setEditingSuccessStoryId(s.id);
    setSuccessStoryForm({
      type: s.type,
      title: s.title,
      stat: s.stat,
      time: s.time,
      desc: s.desc,
      image: s.image
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelSuccessStoryEdit = () => {
    setEditingSuccessStoryId(null);
    setSuccessStoryForm({ type: '', title: '', stat: '', time: '', desc: '', image: '' });
  };


  // --- MEDIA HANDLERS ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, GIF, etc.)');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      await uploadFile(file);
      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      alert("Failed to upload file. Please try again.");
      e.target.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (url: string, id: string | number) => {
    navigator.clipboard.writeText(url);
    setCopiedMediaId(id);
    setTimeout(() => setCopiedMediaId(null), 2000);
  };

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSeoPage(selectedPageId, seoForm);
    setSeoSaved(true);
    setTimeout(() => setSeoSaved(false), 2000);
  };

  // --- MEDIA PICKER MODAL COMPONENT ---
  const MediaPickerModal = () => {
    if (!showMediaModal) return null;

    return (
      <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl rounded-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
            <h3 className="font-heavy uppercase text-lg">Select Media</h3>
            <button onClick={() => setShowMediaModal(false)} className="text-neutral-500 hover:text-black">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-neutral-100">
            {/* Quick Upload in Modal */}
            <div className="mb-6 border-2 border-dashed border-neutral-300 p-6 text-center bg-white rounded-sm">
              <input
                type="file"
                id="modalMediaUpload"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,video/*"
              />
              <label htmlFor="modalMediaUpload" className="cursor-pointer flex flex-col items-center justify-center">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
                ) : (
                  <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                )}
                <span className="text-sm font-bold uppercase">{isUploading ? "Uploading..." : "Upload New Image"}</span>
              </label>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {media.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <ImageIcon className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                  <p className="text-neutral-500 font-medium">No images uploaded yet.</p>
                  <p className="text-neutral-400 text-sm mt-2">Upload your first image above to get started.</p>
                </div>
              ) : (
                media.map(item => (
                  <div
                    key={item.id}
                    className="aspect-square bg-white border border-neutral-200 cursor-pointer hover:border-blue-500 group relative"
                    onClick={() => handleSelectMedia(item.url)}
                  >
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Check className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSignOut = async () => {
    await signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <MediaPickerModal />

      {/* Admin Header */}
      <header className="bg-black text-white py-4 px-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <span className="font-heavy text-xl uppercase tracking-wider mr-4">Denver Coworks CMS</span>
            {source === 'supabase' ? (
              <span className="bg-green-600 text-xs font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                <Database className="w-3 h-3" /> Supabase Live
              </span>
            ) : (
              <span className="bg-red-600 text-xs font-bold px-2 py-1 rounded uppercase flex items-center gap-1 text-white animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Not Connected to Database
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {source === 'local' ? (
              <button onClick={resetData} className="flex items-center text-xs font-bold uppercase text-neutral-400 hover:text-white transition-colors bg-neutral-800 px-3 py-2 rounded">
                <RotateCcw className="w-3 h-3 mr-2" /> Factory Reset
              </button>
            ) : (
              <button onClick={seedDatabase} className="flex items-center text-xs font-bold uppercase text-blue-300 hover:text-white transition-colors bg-neutral-800 border border-blue-900 px-3 py-2 rounded">
                <CloudLightning className="w-3 h-3 mr-2" /> Seed Database (Populate Demo Data)
              </button>
            )}
            <button onClick={handleSignOut} className="flex items-center text-sm font-bold uppercase hover:text-neutral-300">
              <LogOut className="w-4 h-4 mr-2" /> Logout / View Site
            </button>
          </div>
        </div>
      </header>



      <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'pending' ? 'bg-white border-l-4 border-yellow-500 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <AlertTriangle className="w-5 h-5 mr-3" />
            Pending Approvals
            {spaces.filter(s => s.status === 'pending').length > 0 && (
              <span className="ml-auto bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {spaces.filter(s => s.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('spaces')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'spaces' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <LayoutGrid className="w-5 h-5 mr-3" /> Alliance Spaces
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'events' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <Calendar className="w-5 h-5 mr-3" /> Upcoming Events
          </button>
          <button
            onClick={() => setActiveTab('blogs')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'blogs' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <BookOpen className="w-5 h-5 mr-3" /> Blog Posts
          </button>
          <button
            onClick={() => setActiveTab('success-stories')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'success-stories' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <Award className="w-5 h-5 mr-3" /> Success Stories
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'testimonials' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <MessageSquare className="w-5 h-5 mr-3" /> Testimonials
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'media' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <ImageIcon className="w-5 h-5 mr-3" /> Media Library
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'leads' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <Inbox className="w-5 h-5 mr-3" /> Inquiries
            {leads.length > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{leads.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('rsvps')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'rsvps' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <Users className="w-5 h-5 mr-3" /> Event RSVPs
            {rsvps.length > 0 && (
              <span className="ml-auto bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{rsvps.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'seo' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <Search className="w-5 h-5 mr-3" /> SEO Settings
          </button>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9">

          {/* PENDING APPROVALS */}
          {activeTab === 'pending' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-2xl font-heavy uppercase flex items-center gap-2">
                <Check className="w-6 h-6 text-green-600" /> Pending Approvals
              </h3>

              {spaces.filter(s => s.status === 'pending').length === 0 ? (
                <div className="bg-white p-12 text-center border border-neutral-200 rounded">
                  <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-bold text-lg">All Caught Up!</h4>
                  <p className="text-neutral-500">There are no pending space submissions.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {spaces.filter(s => s.status === 'pending').map(space => (
                    <div key={space.id} className="bg-white border-l-4 border-yellow-500 shadow-md p-6 relative">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <img src={space.imageUrl} alt={space.name} className="w-full h-48 object-cover rounded bg-neutral-100 mb-2" />
                          <div className="grid grid-cols-4 gap-2">
                            {space.images?.slice(0, 4).map((img, i) => (
                              <img key={i} src={img} className="w-full h-16 object-cover rounded" />
                            ))}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-2xl font-bold uppercase">{space.name}</h4>
                              <p className="text-neutral-500 text-sm font-bold uppercase mb-4">{space.neighborhood} • {space.address}</p>
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold uppercase px-3 py-1 rounded-full">Pending Review</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <p className="font-bold text-neutral-400 text-xs uppercase">Vibe</p>
                              <p>{space.vibe}</p>
                            </div>
                            <div>
                              <p className="font-bold text-neutral-400 text-xs uppercase">Website</p>
                              <p>{space.website || 'N/A'}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="font-bold text-neutral-400 text-xs uppercase">Description</p>
                              <p className="text-neutral-700">{space.description || 'No description provided.'}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="font-bold text-neutral-400 text-xs uppercase">Amenities</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {space.amenities?.map((a, i) => (
                                  <span key={i} className="bg-neutral-100 px-2 py-1 rounded text-xs">{a}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4 pt-4 border-t border-neutral-100">
                            <button onClick={() => handleApproveSpace(space)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 font-bold uppercase rounded flex items-center justify-center gap-2">
                              <Check className="w-5 h-5" /> Approve Space
                            </button>
                            <button onClick={() => handleRejectSpace(space)} className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-black py-3 font-bold uppercase rounded flex items-center justify-center gap-2">
                              <X className="w-5 h-5" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SPACES MANAGER */}
          {activeTab === 'spaces' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-6 shadow-sm border border-neutral-200 sticky top-24 z-10">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-xl font-heavy uppercase">{editingSpaceId ? 'Edit Space' : 'Add New Space'}</h3>
                  {editingSpaceId && (
                    <button onClick={handleCancelSpaceEdit} className="text-xs font-bold uppercase text-red-500 hover:underline">Cancel Edit</button>
                  )}
                </div>
                <form onSubmit={handleSubmitSpace} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Space Name"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={spaceForm.name}
                    onChange={e => setSpaceForm({ ...spaceForm, name: e.target.value })}
                  />
                  {/* Neighborhood Dropdown + Add */}
                  <div className="flex gap-2">
                    <select
                      className="p-3 border bg-neutral-50 font-medium flex-1"
                      value={spaceForm.neighborhood}
                      onChange={e => setSpaceForm({ ...spaceForm, neighborhood: e.target.value })}
                    >
                      <option value="" disabled>Select Neighborhood</option>
                      {neighborhoods.map(n => (
                        <option key={n.id} value={n.name}>{n.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={handleAddNeighborhood} className="bg-neutral-100 border border-neutral-300 px-3 hover:bg-neutral-200 text-xs font-bold uppercase" title="Add Neighborhood">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Multi-field Address */}
                  <input
                    placeholder="Street Address"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={spaceForm.addressStreet}
                    onChange={e => setSpaceForm({ ...spaceForm, addressStreet: e.target.value })}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      placeholder="City"
                      className="p-3 border bg-neutral-50 font-medium"
                      value={spaceForm.addressCity}
                      onChange={e => setSpaceForm({ ...spaceForm, addressCity: e.target.value })}
                    />
                    <input
                      placeholder="State"
                      className="p-3 border bg-neutral-50 font-medium"
                      value={spaceForm.addressState}
                      onChange={e => setSpaceForm({ ...spaceForm, addressState: e.target.value })}
                    />
                    <input
                      placeholder="Zip"
                      className="p-3 border bg-neutral-50 font-medium"
                      value={spaceForm.addressZip}
                      onChange={e => setSpaceForm({ ...spaceForm, addressZip: e.target.value })}
                    />
                  </div>
                  <select
                    className="p-3 border bg-neutral-50 font-medium"
                    value={spaceForm.vibe}
                    onChange={e => setSpaceForm({ ...spaceForm, vibe: e.target.value })}
                  >
                    <option value="" disabled>Select Vibe</option>
                    <option value="Industrial Chic">Industrial Chic</option>
                    <option value="Artistic & Raw">Artistic & Raw</option>
                    <option value="Luxury Professional">Luxury Professional</option>
                    <option value="Startup Energy">Startup Energy</option>
                    <option value="Quiet Focus">Quiet Focus</option>
                    <option value="Corporate Flex">Corporate Flex</option>
                    <option value="Rustic Modern">Rustic Modern</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Community Focused">Community Focused</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      placeholder="Image URL (https://...)"
                      className="p-3 border bg-neutral-50 font-medium flex-1"
                      value={spaceForm.imageUrl}
                      onChange={e => setSpaceForm({ ...spaceForm, imageUrl: e.target.value })}
                    />
                    <button type="button" onClick={() => openMediaPicker((url) => setSpaceForm({ ...spaceForm, imageUrl: url }))} className="bg-neutral-100 border border-neutral-300 px-3 hover:bg-neutral-200 text-xs font-bold uppercase" title="Select from Library">
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    placeholder="Website (https://...)"
                    className="p-3 border bg-neutral-50 font-medium md:col-span-2"
                    value={spaceForm.website}
                    onChange={e => setSpaceForm({ ...spaceForm, website: e.target.value })}
                  />
                  <textarea
                    placeholder="Description"
                    rows={3}
                    className="p-3 border bg-neutral-50 font-medium md:col-span-2"
                    value={spaceForm.description}
                    onChange={e => setSpaceForm({ ...spaceForm, description: e.target.value })}
                  />
                  <button className={`md:col-span-2 font-bold uppercase py-3 flex items-center justify-center transition-colors ${editingSpaceId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-black hover:bg-neutral-800 text-white'}`}>
                    {editingSpaceId ? (
                      <><Edit2 className="w-4 h-4 mr-2" /> Update Space</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" /> Add Space</>
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 shadow-sm border border-neutral-200">
                <h3 className="text-xl font-heavy uppercase mb-6 border-b pb-4">Existing Spaces ({spaces.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {spaces.map(space => (
                    <div key={space.id} className={`flex items-start border p-4 transition-colors group ${String(editingSpaceId) === String(space.id) ? 'border-blue-600 bg-blue-50' : 'hover:border-black'}`}>
                      <img src={space.imageUrl} alt={space.name} className="w-16 h-16 object-cover mr-4 bg-neutral-200" />
                      <div className="flex-1">
                        <h4 className="font-bold uppercase">{space.name}</h4>
                        <p className="text-xs text-neutral-500">{space.neighborhood} • {space.address} • {space.vibe}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditSpace(space)}
                          className="text-neutral-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeSpace(space.id)}
                          className="text-neutral-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EVENTS MANAGER */}
          {activeTab === 'events' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              {/* Google Calendar Connection Status */}
              <div className={`p-4 rounded border ${isGoogleConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-sm uppercase">
                        {checkingGoogleStatus ? 'Checking...' : isGoogleConnected ? 'Google Calendar Connected' : 'Google Calendar Not Connected'}
                      </p>
                      <p className="text-xs text-neutral-600 mt-1">
                        {isGoogleConnected
                          ? 'Events will be automatically synced and RSVPs will send calendar invites'
                          : 'Connect to enable automatic calendar invites for RSVPs'}
                      </p>
                    </div>
                  </div>
                  {!isGoogleConnected && !checkingGoogleStatus && (
                    <button
                      onClick={handleConnectGoogle}
                      className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-xs uppercase hover:bg-blue-700 transition-colors"
                    >
                      Connect Google Calendar
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 shadow-sm border border-neutral-200 sticky top-24 z-10">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-xl font-heavy uppercase">{editingEventId ? 'Edit Event' : 'Add New Event'}</h3>
                  {editingEventId && (
                    <button onClick={handleCancelEventEdit} className="text-xs font-bold uppercase text-red-500 hover:underline">Cancel Edit</button>
                  )}
                </div>
                <form onSubmit={handleSubmitEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Event Topic"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={eventForm.topic}
                    onChange={e => setEventForm({ ...eventForm, topic: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="Image URL"
                      className="p-3 border bg-neutral-50 font-medium flex-1"
                      value={eventForm.image}
                      onChange={e => setEventForm({ ...eventForm, image: e.target.value })}
                    />
                    <button type="button" onClick={() => openMediaPicker((url) => setEventForm({ ...eventForm, image: url }))} className="bg-neutral-100 border border-neutral-300 px-3 hover:bg-neutral-200 text-xs font-bold uppercase" title="Select from Library">
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    placeholder="Date (e.g. Nov 12)"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={eventForm.date}
                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                  />
                  <input
                    placeholder="Time (e.g. 6PM)"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={eventForm.time}
                    onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                  />
                  <input
                    placeholder="Location (e.g. The Hive, or 'Members Only')"
                    className="p-3 border bg-neutral-50 font-medium md:col-span-2"
                    value={eventForm.location}
                    onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                  />
                  <textarea
                    placeholder="Description (for the Events Landing Page)"
                    className="p-3 border bg-neutral-50 font-medium md:col-span-2 h-24"
                    value={eventForm.description}
                    onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                  <button className={`md:col-span-2 font-bold uppercase py-3 flex items-center justify-center transition-colors ${editingEventId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-black hover:bg-neutral-800 text-white'}`}>
                    {editingEventId ? (
                      <><Edit2 className="w-4 h-4 mr-2" /> Update Event</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" /> Add Event</>
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 shadow-sm border border-neutral-200">
                <h3 className="text-xl font-heavy uppercase mb-6 border-b pb-4">Upcoming Events ({events.length})</h3>
                <div className="space-y-4">
                  {events.map(event => {
                    const rsvpCount = rsvps.filter(r => r.eventName === event.topic).length;
                    return (
                      <div key={event.id} className={`flex items-center border p-4 transition-colors ${String(editingEventId) === String(event.id) ? 'border-blue-600 bg-blue-50' : 'hover:border-black'}`}>
                        <img src={event.image} alt={event.topic} className="w-16 h-16 object-cover mr-4 bg-neutral-200" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold uppercase">{event.topic}</h4>
                            {rsvpCount > 0 && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center font-bold">
                                <Users className="w-3 h-3 mr-1" /> {rsvpCount} RSVPs
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">{event.date} @ {event.time}</p>
                          {event.description && <p className="text-xs text-neutral-400 mt-1 truncate max-w-md">{event.description}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-neutral-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeEvent(event.id)}
                            className="text-neutral-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* BLOG MANAGER */}
          {activeTab === 'blogs' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-6 shadow-sm border border-neutral-200 sticky top-24 z-10">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-xl font-heavy uppercase">{editingBlogId ? 'Edit Post' : 'Write New Post'}</h3>
                  {editingBlogId && (
                    <button onClick={handleCancelBlogEdit} className="text-xs font-bold uppercase text-red-500 hover:underline">Cancel Edit</button>
                  )}
                </div>
                <form onSubmit={handleSubmitBlog} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      placeholder="Blog Title"
                      className="p-3 border bg-neutral-50 font-medium"
                      value={blogForm.title}
                      onChange={e => setBlogForm({ ...blogForm, title: e.target.value })}
                      required
                    />
                    <input
                      placeholder="Author"
                      className="p-3 border bg-neutral-50 font-medium"
                      value={blogForm.author}
                      onChange={e => setBlogForm({ ...blogForm, author: e.target.value })}
                    />
                  </div>
                  <textarea
                    placeholder="Short Excerpt (1-2 sentences)"
                    className="w-full p-3 border bg-neutral-50 font-medium h-20"
                    value={blogForm.excerpt}
                    onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  />

                  {/* RICH TEXT EDITOR REPLACEMENT */}
                  <RichTextEditor
                    value={blogForm.content}
                    onChange={(val) => setBlogForm({ ...blogForm, content: val })}
                    label="Post Content"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-2">
                      <input
                        placeholder="Cover Image URL"
                        className="p-3 border bg-neutral-50 font-medium flex-1"
                        value={blogForm.imageUrl}
                        onChange={e => setBlogForm({ ...blogForm, imageUrl: e.target.value })}
                      />
                      <button type="button" onClick={() => openMediaPicker((url) => setBlogForm({ ...blogForm, imageUrl: url }))} className="bg-neutral-100 border border-neutral-300 px-3 hover:bg-neutral-200 text-xs font-bold uppercase" title="Select from Library">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      placeholder="Tags (comma separated: Trends, Marketing)"
                      className="p-3 border bg-neutral-50 font-medium"
                      value={blogForm.tags}
                      onChange={e => setBlogForm({ ...blogForm, tags: e.target.value })}
                    />
                  </div>

                  <button className={`w-full font-bold uppercase py-3 flex items-center justify-center transition-colors ${editingBlogId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-black hover:bg-neutral-800 text-white'}`}>
                    {editingBlogId ? (
                      <><Edit2 className="w-4 h-4 mr-2" /> Update Post</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" /> Publish Post</>
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 shadow-sm border border-neutral-200">
                <h3 className="text-xl font-heavy uppercase mb-6 border-b pb-4">Published Posts ({blogs.length})</h3>
                <div className="space-y-4">
                  {blogs.map(blog => (
                    <div key={blog.id} className={`flex items-start border p-4 transition-colors ${String(editingBlogId) === String(blog.id) ? 'border-blue-600 bg-blue-50' : 'hover:border-black'}`}>
                      <img src={blog.imageUrl} alt={blog.title} className="w-20 h-20 object-cover mr-4 bg-neutral-200" />
                      <div className="flex-1">
                        <h4 className="font-bold uppercase text-lg leading-tight">{blog.title}</h4>
                        <p className="text-xs text-neutral-500 mb-1">{blog.date} • By {blog.author}</p>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {blog.tags.map(t => (
                            <span key={t} className="text-[10px] font-bold bg-neutral-100 px-1.5 py-0.5 uppercase tracking-wider">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="text-neutral-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeBlog(blog.id)}
                          className="text-neutral-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS STORIES MANAGER */}
          {activeTab === 'success-stories' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-6 shadow-sm border border-neutral-200 sticky top-24 z-10">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-xl font-heavy uppercase">{editingSuccessStoryId ? 'Edit Success Story' : 'Add Success Story'}</h3>
                  {editingSuccessStoryId && (
                    <button onClick={handleCancelSuccessStoryEdit} className="text-xs font-bold uppercase text-red-500 hover:underline">Cancel Edit</button>
                  )}
                </div>
                <form onSubmit={handleSubmitSuccessStory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Title (e.g. The Industrial Hub)"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={successStoryForm.title}
                    onChange={e => setSuccessStoryForm({ ...successStoryForm, title: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Type (e.g. Warehouse Conversion)"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={successStoryForm.type}
                    onChange={e => setSuccessStoryForm({ ...successStoryForm, type: e.target.value })}
                  />
                  <input
                    placeholder="Stat (e.g. 90% Occupancy)"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={successStoryForm.stat}
                    onChange={e => setSuccessStoryForm({ ...successStoryForm, stat: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Timeframe (e.g. 4 Months)"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={successStoryForm.time}
                    onChange={e => setSuccessStoryForm({ ...successStoryForm, time: e.target.value })}
                  />
                  <div className="flex gap-2 md:col-span-2">
                    <input
                      placeholder="Image URL"
                      className="p-3 border bg-neutral-50 font-medium flex-1"
                      value={successStoryForm.image}
                      onChange={e => setSuccessStoryForm({ ...successStoryForm, image: e.target.value })}
                    />
                    <button type="button" onClick={() => openMediaPicker((url) => setSuccessStoryForm({ ...successStoryForm, image: url }))} className="bg-neutral-100 border border-neutral-300 px-3 hover:bg-neutral-200 text-xs font-bold uppercase" title="Select from Library">
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Description / Story"
                    className="p-3 border bg-neutral-50 font-medium md:col-span-2 h-24"
                    value={successStoryForm.desc}
                    onChange={e => setSuccessStoryForm({ ...successStoryForm, desc: e.target.value })}
                  />
                  <button className={`md:col-span-2 font-bold uppercase py-3 flex items-center justify-center transition-colors ${editingSuccessStoryId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-black hover:bg-neutral-800 text-white'}`}>
                    {editingSuccessStoryId ? (
                      <><Edit2 className="w-4 h-4 mr-2" /> Update Story</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" /> Add Story</>
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 shadow-sm border border-neutral-200">
                <h3 className="text-xl font-heavy uppercase mb-6 border-b pb-4">Stories ({successStories.length})</h3>
                <div className="space-y-4">
                  {successStories.map(story => (
                    <div key={story.id} className={`flex items-center border p-4 transition-colors ${String(editingSuccessStoryId) === String(story.id) ? 'border-blue-600 bg-blue-50' : 'hover:border-black'}`}>
                      <img src={story.image} alt={story.title} className="w-20 h-20 object-cover mr-4 bg-neutral-200" />
                      <div className="flex-1">
                        <h4 className="font-bold uppercase">{story.title}</h4>
                        <div className="text-xs text-neutral-500 mb-1">{story.type}</div>
                        <div className="flex gap-4 text-xs font-bold">
                          <span className="text-green-600">{story.stat}</span>
                          <span className="text-neutral-400">{story.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditSuccessStory(story)}
                          className="text-neutral-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeSuccessStory(story.id)}
                          className="text-neutral-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TESTIMONIAL MANAGER */}
          {activeTab === 'testimonials' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-6 shadow-sm border border-neutral-200 sticky top-24 z-10">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-xl font-heavy uppercase">{editingTestimonialId ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
                  {editingTestimonialId && (
                    <button onClick={handleCancelTestimonialEdit} className="text-xs font-bold uppercase text-red-500 hover:underline">Cancel Edit</button>
                  )}
                </div>
                <form onSubmit={handleSubmitTestimonial} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Name (e.g. John Doe)"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={testimonialForm.name}
                    onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Title (e.g. Founder)"
                    className="p-3 border bg-neutral-50 font-medium"
                    value={testimonialForm.title}
                    onChange={e => setTestimonialForm({ ...testimonialForm, title: e.target.value })}
                  />
                  <input
                    placeholder="Space / Company (e.g. The Hive)"
                    className="p-3 border bg-neutral-50 font-medium md:col-span-2"
                    value={testimonialForm.space}
                    onChange={e => setTestimonialForm({ ...testimonialForm, space: e.target.value })}
                  />
                  <textarea
                    placeholder="Quote"
                    className="p-3 border bg-neutral-50 font-medium md:col-span-2 h-24"
                    value={testimonialForm.quote}
                    onChange={e => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                    required
                  />
                  <button className={`md:col-span-2 font-bold uppercase py-3 flex items-center justify-center transition-colors ${editingTestimonialId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-black hover:bg-neutral-800 text-white'}`}>
                    {editingTestimonialId ? (
                      <><Edit2 className="w-4 h-4 mr-2" /> Update Testimonial</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" /> Add Testimonial</>
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 shadow-sm border border-neutral-200">
                <h3 className="text-xl font-heavy uppercase mb-6 border-b pb-4">Existing Testimonials ({testimonials.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testimonials.map(t => (
                    <div key={t.id} className={`flex flex-col border p-4 transition-colors ${String(editingTestimonialId) === String(t.id) ? 'border-blue-600 bg-blue-50' : 'hover:border-black'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold uppercase text-sm">{t.name}</h4>
                          <p className="text-xs text-neutral-500">{t.title}, {t.space}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTestimonial(t)}
                            className="text-neutral-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeTestimonial(t.id)}
                            className="text-neutral-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm italic text-neutral-700">"{t.quote}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MEDIA MANAGER */}
          {activeTab === 'media' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-6 shadow-sm border border-neutral-200">
                <h3 className="text-xl font-heavy uppercase mb-6 border-b pb-4">Upload Media</h3>
                <div className="border-2 border-dashed border-neutral-300 p-12 text-center hover:border-black transition-colors bg-neutral-50">
                  <input
                    type="file"
                    id="mediaUpload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                  />
                  <label htmlFor="mediaUpload" className="cursor-pointer flex flex-col items-center">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
                    ) : (
                      <Upload className="w-12 h-12 text-neutral-400 mb-4" />
                    )}
                    <span className="font-bold uppercase text-lg">{isUploading ? "Uploading..." : "Click to Upload Image"}</span>
                    <span className="text-neutral-500 text-sm mt-2">Supports JPG, PNG, GIF</span>
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 shadow-sm border border-neutral-200">
                <h3 className="text-xl font-heavy uppercase mb-6 border-b pb-4">Media Library ({media.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {media.map(item => (
                    <div
                      key={item.id}
                      className="relative group aspect-square bg-neutral-100 cursor-pointer overflow-hidden border border-neutral-200 hover:border-blue-500"
                      onClick={() => copyToClipboard(item.url, item.id)}
                    >
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />

                      {/* Overlay */}
                      <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white transition-opacity ${copiedMediaId === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {copiedMediaId === item.id ? (
                          <>
                            <Check className="w-8 h-8 mb-2 text-green-400" />
                            <span className="text-xs font-bold uppercase">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-8 h-8 mb-2" />
                            <span className="text-xs font-bold uppercase">Click to Copy URL</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {media.length === 0 && (
                    <div className="col-span-full py-12 text-center text-neutral-400 italic">
                      No media uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LEADS MANAGER */}
          {activeTab === 'leads' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-6 shadow-sm border border-neutral-200">
                <h3 className="text-xl font-heavy uppercase mb-6 border-b pb-4">Inbox / Inquiries ({leads.length})</h3>

                {leads.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 italic">
                    No inquiries yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leads.map(lead => (
                      <div key={lead.id} className="border p-6 hover:border-black transition-colors bg-neutral-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg uppercase">{lead.name}</h4>
                            <div className="flex gap-2 text-xs font-bold uppercase mt-1">
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5">{lead.type}</span>
                              <span className="text-neutral-500">{new Date(lead.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeLead(lead.id)}
                            className="text-neutral-300 hover:text-red-600 p-2 transition-colors"
                            title="Archive"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="font-bold text-xs uppercase text-neutral-500">Contact</p>
                            <p><a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a></p>
                            <p>{lead.phone || 'No phone'}</p>
                          </div>
                          <div>
                            <p className="font-bold text-xs uppercase text-neutral-500">Building Info</p>
                            <p>{lead.address || 'N/A'}</p>
                            <p>{lead.buildingSize ? `${lead.buildingSize} sqft` : 'N/A'}</p>
                          </div>
                        </div>

                        <div className="bg-white p-4 border border-neutral-200">
                          <p className="font-bold text-xs uppercase text-neutral-500 mb-2">Message / Topic</p>
                          <p className="text-neutral-800 italic whitespace-pre-wrap">{lead.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RSVP MANAGER */}
          {activeTab === 'rsvps' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-6 shadow-sm border border-neutral-200">
                <h3 className="text-xl font-heavy uppercase mb-6 border-b pb-4">Event Registrations ({rsvps.length})</h3>

                {rsvps.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 italic">
                    No RSVPs yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rsvps.map(rsvp => (
                      <div key={rsvp.id} className="border p-6 hover:border-black transition-colors bg-neutral-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full items-center">
                          {/* Column 1: Event */}
                          <div className="md:col-span-1">
                            <h4 className="font-bold text-sm uppercase">{rsvp.eventName}</h4>
                            <span className="text-xs text-neutral-500">{new Date(rsvp.timestamp).toLocaleDateString()}</span>
                          </div>

                          {/* Column 2: Attendee */}
                          <div className="md:col-span-1">
                            <div className="font-bold text-sm">{rsvp.attendeeName}</div>
                            <a href={`mailto:${rsvp.email}`} className="text-blue-600 text-xs hover:underline block">{rsvp.email}</a>
                          </div>

                          {/* Column 3: Space Name */}
                          <div className="md:col-span-1">
                            <div className="text-xs uppercase font-bold text-neutral-400 mb-1">Space / Company</div>
                            <div className="text-sm font-medium bg-neutral-100 px-2 py-1 inline-block rounded-sm border border-neutral-200">
                              {rsvp.spaceName}
                            </div>
                          </div>

                          {/* Column 4: Actions */}
                          <div className="md:col-span-1 flex justify-end">
                            <button
                              onClick={() => removeRsvp(rsvp.id)}
                              className="text-neutral-300 hover:text-red-600 p-2 transition-colors"
                              title="Archive"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEO MANAGER */}
          {activeTab === 'seo' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="lg:col-span-2 bg-white p-6 shadow-sm border border-neutral-200">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-xl font-heavy uppercase">Edit Metadata</h3>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-neutral-500" />
                    <select
                      value={selectedPageId}
                      onChange={(e) => setSelectedPageId(e.target.value)}
                      className="bg-neutral-50 border border-neutral-300 p-2 text-sm font-medium focus:border-black focus:outline-none rounded-sm"
                    >
                      <option value="home">Home Page (Global)</option>
                      <option value="events-page">Events Landing Page</option>
                      <option value="blog-page">Blog Landing Page</option>
                    </select>
                  </div>
                </div>

                <form onSubmit={handleSaveSeo} className="space-y-6">
                  {selectedPageId === 'home' && (
                    <div className="bg-neutral-50 p-4 border border-neutral-200 mb-4">
                      <label className="font-bold text-xs uppercase mb-2 block">Site Logo URL (Replaces text logo)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={seoForm.logoUrl || ''}
                          onChange={e => setSeoForm({ ...seoForm, logoUrl: e.target.value })}
                          className="w-full p-3 border bg-white font-medium focus:border-black focus:outline-none"
                          placeholder="https://..."
                        />
                        <button type="button" onClick={() => openMediaPicker((url) => setSeoForm({ ...seoForm, logoUrl: url }))} className="bg-neutral-200 border border-neutral-300 px-3 hover:bg-neutral-300 text-xs font-bold uppercase">
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {seoForm.logoUrl && (
                        <div className="mt-2 p-2 bg-black inline-block">
                          <img src={seoForm.logoUrl} alt="Logo Preview" className="h-8 w-auto" />
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-xs uppercase mb-2 block">Page Title</label>
                    <input
                      type="text"
                      value={seoForm.title}
                      onChange={e => setSeoForm({ ...seoForm, title: e.target.value })}
                      className="w-full p-3 border bg-neutral-50 font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-xs uppercase mb-2 block">Meta Description</label>
                    <textarea
                      value={seoForm.description}
                      onChange={e => setSeoForm({ ...seoForm, description: e.target.value })}
                      rows={3}
                      className="w-full p-3 border bg-neutral-50 font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-xs uppercase mb-2 block">Keywords</label>
                    <input
                      type="text"
                      value={seoForm.keywords}
                      onChange={e => setSeoForm({ ...seoForm, keywords: e.target.value })}
                      className="w-full p-3 border bg-neutral-50 font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-xs uppercase mb-2 block">Social Share Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={seoForm.ogImage}
                        onChange={e => setSeoForm({ ...seoForm, ogImage: e.target.value })}
                        className="w-full p-3 border bg-neutral-50 font-medium focus:border-black focus:outline-none"
                      />
                      <button type="button" onClick={() => openMediaPicker((url) => setSeoForm({ ...seoForm, ogImage: url }))} className="bg-neutral-100 border border-neutral-300 px-3 hover:bg-neutral-200 text-xs font-bold uppercase">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </div>
                    {seoForm.ogImage && (
                      <div className="border p-2 inline-block bg-neutral-50 mt-2">
                        <img src={seoForm.ogImage} alt="Preview" className="h-32 object-cover" />
                      </div>
                    )}
                  </div>

                  <button className="bg-black text-white font-bold uppercase py-3 px-8 hover:bg-neutral-800 w-full flex items-center justify-center transition-colors">
                    {seoSaved ? <span className="text-green-400">Changes Saved!</span> : "Save Page Settings"}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-1">
                <SeoScore settings={seoForm} />
              </div>
            </div>
          )}

        </main>
      </div >
    </div >
  );
};

export default Admin;