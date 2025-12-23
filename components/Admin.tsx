
import React, { useState, useEffect } from 'react';
import { useData, SeoSettings, Space, Event, BlogPost, Testimonial, SuccessStory, Profile } from './DataContext';
import SeoScore from './SeoScore';
import RichTextEditor from './RichTextEditor';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import { Trash2, Plus, LogOut, Calendar, LayoutGrid, Edit2, RotateCcw, Database, HardDrive, Inbox, Search, Globe, Image as ImageIcon, Copy, Check, Upload, BookOpen, MessageSquare, Users, Award, X, AlertTriangle, CloudLightning, Settings, Mail, Shield, Clock } from 'lucide-react';

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
    removeLead, removeRsvp, uploadFile, resetData, seedDatabase, source,
    expertSubmissions, removeExpertSubmission, fetchEvents,
    profiles, fetchProfiles
  } = useData();

  const currentUserProfile = profiles.find(p => p.id === user?.id);
  const isSuperAdmin = currentUserProfile?.role === 'super_admin';

  const [activeTab, setActiveTab] = useState<'spaces' | 'events' | 'blogs' | 'leads' | 'rsvps' | 'seo' | 'media' | 'testimonials' | 'success-stories' | 'pending' | 'expert' | 'settings'>('pending');

  // Space Form State
  const [editingSpaceId, setEditingSpaceId] = useState<string | number | null>(null);
  const [spaceForm, setSpaceForm] = useState<Partial<Space>>({
    name: '', neighborhood: '', address: '', vibe: '', imageUrl: '',
    description: '', website: '', status: 'approved',
    phone: '',
    hours: {
      monday: '9am - 5pm',
      tuesday: '9am - 5pm',
      wednesday: '9am - 5pm',
      thursday: '9am - 5pm',
      friday: '9am - 5pm',
      saturday: 'Closed',
      sunday: 'Closed'
    }
  });

  // Event Form State
  const [editingEventId, setEditingEventId] = useState<string | number | null>(null);
  const [eventForm, setEventForm] = useState({ topic: '', date: '', time: '', startTime: '18:00', durationMinutes: 60, image: '', location: '', description: '' });

  // Blog Form State
  const [editingBlogId, setEditingBlogId] = useState<string | number | null>(null);
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', author: '', imageUrl: '', tags: '' });

  // Testimonial Form State
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | number | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({ name: '', title: '', space: '', quote: '' });

  // Success Story Form State
  const [editingSuccessStoryId, setEditingSuccessStoryId] = useState<string | number | null>(null);
  const [successStoryForm, setSuccessStoryForm] = useState({ type: '', title: '', stat: '', time: '', description: '', image: '' });

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
  const [inviteForm, setInviteForm] = useState({ email: '', fullName: '', role: 'user' as Profile['role'] });
  const [isInviting, setIsInviting] = useState(false);

  // Google Calendar Integration State
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [checkingGoogleStatus, setCheckingGoogleStatus] = useState(true);
  const [calendarId, setCalendarId] = useState('primary');
  const [timezone, setTimezone] = useState('America/Denver');
  const [ga4Id, setGa4Id] = useState('');
  const [clarityId, setClarityId] = useState('');
  const [notifyEmails, setNotifyEmails] = useState({ landlord: '', expert: '', newSpace: '' });
  const [mapsApiKey, setMapsApiKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

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
        // Clean up OAuth params from URL but keep view=admin
        const params = new URLSearchParams(window.location.search);
        params.delete('code');
        params.delete('scope');
        params.delete('authuser');
        params.delete('prompt');
        const cleanSearch = params.toString() ? `?${params.toString()}` : '';
        window.history.replaceState({}, document.title, window.location.pathname + cleanSearch);
        // Refresh connection status
        checkGoogleConnection();
      }
    };

    handleOAuthCallback();
  }, [user]);

  // Ref for autocomplete instance
  const autocompleteRef = React.useRef<any>(null);

  // Initialize Autocomplete (Google Maps)
  useEffect(() => {
    const win = window as any;
    if (activeTab === 'spaces' && win.google && win.google.maps && win.google.maps.places) {
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const input = document.getElementById('address-autocomplete') as HTMLInputElement;
        if (input) {
          // Initialize autocomplete
          autocompleteRef.current = new win.google.maps.places.Autocomplete(input, {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'geometry']
          });

          // Add listener
          autocompleteRef.current?.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.address_components) {
              let streetNumber = '';
              let route = '';
              let city = '';
              let state = '';
              let zip = '';

              // Parse components
              place.address_components.forEach((component: any) => {
                const types = component.types;
                if (types.includes('street_number')) streetNumber = component.long_name;
                if (types.includes('route')) route = component.long_name;
                if (types.includes('locality')) city = component.long_name;
                if (types.includes('administrative_area_level_1')) state = component.short_name;
                if (types.includes('postal_code')) zip = component.long_name;
              });

              // Update Form
              setSpaceForm(prev => ({
                ...prev,
                addressStreet: `${streetNumber} ${route}`.trim(),
                addressCity: city,
                addressState: state,
                addressZip: zip,
                addressLat: place.geometry?.location?.lat(),
                addressLng: place.geometry?.location?.lng()
              }));
            }
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, editingSpaceId]);

  const checkGoogleConnection = async () => {
    setCheckingGoogleStatus(true);
    try {
      const { data, error } = await supabase
        .from('admin_tokens')
        .select('*')
        .eq('token_type', 'google_oauth')
        .maybeSingle();

      setIsGoogleConnected(!error && data && data.refresh_token);
      if (data) {
        if (data.calendar_id) setCalendarId(data.calendar_id);
        if (data.timezone) setTimezone(data.timezone);
        if (data.google_maps_api_key) setMapsApiKey(data.google_maps_api_key);
        if (data.ga4_measurement_id) setGa4Id(data.ga4_measurement_id);
        if (data.clarity_project_id) setClarityId(data.clarity_project_id);
        setNotifyEmails({
          landlord: data.notify_landlord_emails || '',
          expert: data.notify_expert_emails || '',
          newSpace: data.notify_new_space_emails || ''
        });
      }
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setIsGoogleConnected(false);
    } finally {
      setCheckingGoogleStatus(false);
    }
  };

  // Check Google connection status on mount
  useEffect(() => {
    if (user) {
      checkGoogleConnection();
    } else {
      setCheckingGoogleStatus(false);
    }
  }, [user]);

  const handleConnectGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    // Force a clean base URL without trailing slashes
    const redirectUri = `${window.location.origin}/admin`.replace(/\/+admin$/, '/admin');
    const scope = 'https://www.googleapis.com/auth/calendar.events';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `include_granted_scopes=true&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  const exchangeCodeForToken = async (code: string) => {
    try {
      // Use the exact same forced clean URI as above
      const redirectUri = `${window.location.origin}/admin`.replace(/\/+admin$/, '/admin');
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchange-google-token`;

      console.log('Exchanging code for token...', { redirectUri, apiUrl });

      const { data: result, error: invokeError } = await supabase.functions.invoke('exchange-google-token', {
        body: { code, redirectUri }
      });

      if (invokeError) {
        console.error('Token exchange failed:', invokeError);
        throw new Error(invokeError.message || 'Failed to exchange token');
      }

      console.log('Token exchange successful:', result);

      alert('Google Calendar connected successfully!');
      setIsGoogleConnected(true);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      alert('Failed to connect Google Calendar. Check console for details.');
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
          addressZip: spaceForm.addressZip,
          phone: spaceForm.phone,
          hours: spaceForm.hours
        });
      }
      setSpaceForm({
        name: '', neighborhood: '', address: '', vibe: '', imageUrl: '', description: '', website: '', status: 'approved',
        addressStreet: '', addressCity: '', addressState: '', addressZip: '',
        phone: '',
        hours: {
          monday: '9am - 5pm',
          tuesday: '9am - 5pm',
          wednesday: '9am - 5pm',
          thursday: '9am - 5pm',
          friday: '9am - 5pm',
          saturday: 'Closed',
          sunday: 'Closed'
        }
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
      addressZip: space.addressZip || '',
      phone: space.phone || '',
      hours: space.hours || {
        monday: '9am - 5pm',
        tuesday: '9am - 5pm',
        wednesday: '9am - 5pm',
        thursday: '9am - 5pm',
        friday: '9am - 5pm',
        saturday: 'Closed',
        sunday: 'Closed'
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelSpaceEdit = () => {
    setEditingSpaceId(null);
    setSpaceForm({
      name: '', neighborhood: '', address: '', vibe: '', imageUrl: '', description: '', website: '', status: 'approved',
      addressStreet: '', addressCity: '', addressState: '', addressZip: '',
      phone: '',
      hours: {
        monday: '9am - 5pm',
        tuesday: '9am - 5pm',
        wednesday: '9am - 5pm',
        thursday: '9am - 5pm',
        friday: '9am - 5pm',
        saturday: 'Closed',
        sunday: 'Closed'
      }
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
      try {
        await updateSpace(space.id, { status: 'approved' });

        // Notify the owner via email
        if (space.ownerId) {
          await supabase.functions.invoke('notify-space-approval', {
            body: { spaceName: space.name, ownerId: space.ownerId }
          });
        }

        alert("Space Approved and Partner Notified!");
      } catch (error) {
        console.error('Error approving space:', error);
        alert("Approved in database, but failed to send notification email.");
      }
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

    try {
      if (editingEventId) {
        await updateEvent(editingEventId, eventForm);

        // Re-sync with Google Calendar if connected
        if (isGoogleConnected) {
          const { data: updatedEvent } = await supabase
            .from('events')
            .select('*')
            .eq('id', editingEventId)
            .single();

          if (updatedEvent) {
            await syncEventToGoogleCalendar(updatedEvent);
          }
        }

        setEditingEventId(null);
        alert("Event updated successfully!");
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
      setEventForm({ topic: '', date: '', time: '', startTime: '18:00', durationMinutes: 60, image: '', location: '', description: '' });
    } catch (error: any) {
      console.error("Error saving event:", error);
      alert("Failed to save event: " + (error.message || "Unknown error"));
    }
  };

  const syncEventToGoogleCalendar = async (event: any) => {
    try {
      let startDateTime: string;

      // Check if it looks like a valid ISO or simple "YYYY-MM-DDTHH:mm" format
      if (event.start_time && /^\d{4}-\d{2}-\d{2}T/.test(event.start_time)) {
        startDateTime = event.start_time;
      } else if (event.date && event.start_time) {
        // Handle "YYYY-MM-DD" + "HH:mm"
        startDateTime = `${event.date}T${event.start_time}:00`;
        // Convert to ISO if it's just a local string
        const d = new Date(startDateTime);
        if (!isNaN(d.getTime())) {
          startDateTime = d.toISOString();
        } else {
          startDateTime = parseDateTimeToISO(event.date, event.time);
        }
      } else {
        startDateTime = parseDateTimeToISO(event.date, event.time);
      }

      const durationMinutes = event.duration_minutes || 60;
      const endDateTime = new Date(new Date(startDateTime).getTime() + (durationMinutes * 60 * 1000)).toISOString();

      const { data: result, error: invokeError } = await supabase.functions.invoke('create-calendar-event', {
        body: {
          eventId: event.id,
          title: event.topic,
          description: event.description || '',
          startDateTime,
          endDateTime,
          location: event.location || '',
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to create Google Calendar event');
      }

      console.log('Event synced to Google Calendar:', result);
      alert('Event created and synced to Google Calendar!');
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error);
      alert('Event created but failed to sync to Google Calendar. You can manually add attendees later.');
    }
  };

  const handleSyncGoogleCalendar = async () => {
    if (!isGoogleConnected) {
      alert('Please connect Google Calendar first.');
      return;
    }

    setIsSyncing(true);
    try {
      const { data: result, error: invokeError } = await supabase.functions.invoke('sync-google-calendar');

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to sync Google Calendar');
      }

      console.log('Sync result:', result);

      // Refresh events in the context
      await fetchEvents();

      alert(`Sync completed! ${result.stats.created} new events added, ${result.stats.updated} events updated.`);
    } catch (error) {
      console.error('Error syncing Google Calendar:', error);
      alert('Failed to sync Google Calendar. Check console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  const parseDateTimeToISO = (date: string, time: string): string => {
    try {
      // Try parsing the combined string directly first (handles "Month Day, Year Time")
      const combined = `${date} ${time || '12:00 PM'}`;
      const d = new Date(combined);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    } catch (e) {
      console.warn('Direct date parsing failed, falling back to parts', e);
    }

    const timeStr = time || '12:00 PM';
    const timeParts = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)?/i);

    if (!timeParts) {
      return new Date().toISOString();
    }

    let hours = parseInt(timeParts[1]);
    const minutes = timeParts[2] ? parseInt(timeParts[2]) : 0;
    const meridiem = timeParts[3]?.toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    // Try to parse the date part
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      dateObj.setHours(hours, minutes, 0, 0);
      return dateObj.toISOString();
    }

    // Ultimate fallback to today
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now.toISOString();
  };

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.fullName || !inviteForm.role) return;

    setIsInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('invite-admin', {
        body: inviteForm
      });

      if (error) throw error;

      alert('Invitation sent! The new admin will receive an email shortly.');
      setInviteForm({ email: '', fullName: '', role: 'user' });
      await fetchProfiles();
    } catch (error) {
      console.error('Error inviting admin:', error);
      alert('Failed to invite admin: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsInviting(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEventId(event.id);
    setEventForm({
      topic: event.topic,
      date: event.date,
      time: event.time,
      startTime: event.startTime || '18:00',
      durationMinutes: event.durationMinutes || 60,
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
    setSuccessStoryForm({ type: '', title: '', stat: '', time: '', description: '', image: '' });
  };

  const handleEditSuccessStory = (s: SuccessStory) => {
    setEditingSuccessStoryId(s.id);
    setSuccessStoryForm({
      type: s.type,
      title: s.title,
      stat: s.stat,
      time: s.time,
      description: s.description,
      image: s.image
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelSuccessStoryEdit = () => {
    setEditingSuccessStoryId(null);
    setSuccessStoryForm({ type: '', title: '', stat: '', time: '', description: '', image: '' });
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
            onClick={() => setActiveTab('expert')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'expert' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <Search className="w-5 h-5 mr-3" /> Expert Finder
            {expertSubmissions.length > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{expertSubmissions.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'seo' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <Globe className="w-5 h-5 mr-3" /> SEO Settings
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left p-4 font-bold uppercase flex items-center transition-all ${activeTab === 'settings' ? 'bg-white border-l-4 border-blue-600 shadow-md' : 'text-neutral-500 hover:bg-white'}`}
          >
            <Settings className="w-5 h-5 mr-3" /> Staff & Notifications
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
                    id="address-autocomplete"
                    placeholder="Street Address (Start typing to search...)"
                    className="p-3 border bg-neutral-50 font-medium placeholder:text-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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

                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-neutral-100">
                    <h4 className="text-xs font-heavy uppercase flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" /> SEO & Contact Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Public Phone</label>
                        <input
                          placeholder="(303) 555-0123"
                          className="w-full p-2 border bg-neutral-50 font-medium text-sm"
                          value={spaceForm.phone}
                          onChange={e => setSpaceForm({ ...spaceForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Hours of Operation</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {spaceForm.hours && Object.keys(spaceForm.hours).map((day) => (
                          <div key={day}>
                            <label className="block text-[8px] font-bold uppercase text-neutral-400 mb-1">{day}</label>
                            <input
                              type="text"
                              className="w-full p-1 border bg-neutral-50 font-medium text-[10px]"
                              value={(spaceForm.hours as any)[day]}
                              onChange={(e) => {
                                const newHours = { ...spaceForm.hours, [day]: e.target.value };
                                setSpaceForm(prev => ({ ...prev, hours: newHours }));
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
                  {isGoogleConnected && (
                    <div className="flex flex-col gap-4 mt-4 w-full border-t pt-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={calendarId}
                          onChange={(e) => setCalendarId(e.target.value)}
                          placeholder="primary or your-calendar@group.calendar.google.com"
                          className="flex-1 border border-neutral-300 px-3 py-2 text-sm rounded"
                        />
                        <button
                          onClick={async () => {
                            try {
                              const { error, count } = await supabase
                                .from('admin_tokens')
                                .update({ calendar_id: calendarId }, { count: 'exact' })
                                .eq('token_type', 'google_oauth');

                              if (error) throw error;

                              if (count === 0) {
                                alert('No token found to update or permission denied. Try connecting Google Calendar first.');
                              } else {
                                alert('Calendar ID saved successfully!');
                                // Refresh the connection status to be sure
                                checkGoogleConnection();
                              }
                            } catch (error) {
                              console.error('Error saving calendar ID:', error);
                              alert('Failed to save calendar ID. You might need to check database permissions (RLS).');
                            }
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded font-bold text-xs uppercase hover:bg-green-700 transition-colors whitespace-nowrap"
                        >
                          Save Calendar ID
                        </button>
                        <button
                          onClick={handleSyncGoogleCalendar}
                          disabled={isSyncing}
                          className="bg-black text-white px-4 py-2 rounded font-bold text-xs uppercase hover:bg-neutral-800 transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                          {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handleConnectGoogle}
                          className="text-[10px] font-bold uppercase text-neutral-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          Reconnect Account (Use if sync fails)
                        </button>
                      </div>
                    </div>
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
                  <div>
                    <label className="text-xs font-bold uppercase text-neutral-600 mb-1 block">Event Date</label>
                    <input
                      type="date"
                      className="p-3 border bg-neutral-50 font-medium w-full"
                      value={eventForm.date}
                      onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-neutral-600 mb-1 block">Display Time (e.g., "6PM")</label>
                    <input
                      placeholder="6PM"
                      className="p-3 border bg-neutral-50 font-medium w-full"
                      value={eventForm.time}
                      onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-neutral-600 mb-1 block">Start Time</label>
                    <input
                      type="time"
                      className="p-3 border bg-neutral-50 font-medium w-full"
                      value={eventForm.startTime}
                      onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-neutral-600 mb-1 block">Duration</label>
                    <select
                      className="p-3 border bg-neutral-50 font-medium w-full"
                      value={eventForm.durationMinutes}
                      onChange={e => setEventForm({ ...eventForm, durationMinutes: parseInt(e.target.value) })}
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                      <option value="180">3 hours</option>
                      <option value="240">4 hours</option>
                    </select>
                  </div>
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
                    value={successStoryForm.description}
                    onChange={e => setSuccessStoryForm({ ...successStoryForm, description: e.target.value })}
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

          {/* EXPERT FINDER SUBMISSIONS */}
          {activeTab === 'expert' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-2xl font-heavy uppercase flex items-center gap-2">
                <Search className="w-6 h-6 text-blue-600" /> Expert Finder Submissions
              </h3>

              <div className="bg-white shadow-xl overflow-hidden rounded-sm border border-neutral-200">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="p-4 text-left font-heavy uppercase text-xs">Date</th>
                        <th className="p-4 text-left font-heavy uppercase text-xs">Name</th>
                        <th className="p-4 text-left font-heavy uppercase text-xs">Email</th>
                        <th className="p-4 text-left font-heavy uppercase text-xs">Address</th>
                        <th className="p-4 text-left font-heavy uppercase text-xs">Type/Goal</th>
                        <th className="p-4 text-center font-heavy uppercase text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expertSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-neutral-500 italic">No submissions yet.</td>
                        </tr>
                      ) : (
                        expertSubmissions.map(sub => (
                          <tr key={sub.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                            <td className="p-4 text-sm font-medium text-neutral-500 whitespace-nowrap">
                              {new Date(sub.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-bold">{sub.name}</td>
                            <td className="p-4">
                              <a href={`mailto:${sub.email}`} className="text-blue-600 hover:underline">{sub.email}</a>
                            </td>
                            <td className="p-4 text-sm">{sub.address} ({sub.buildingSize})</td>
                            <td className="p-4 text-sm uppercase font-bold">
                              <span className="text-xs bg-neutral-100 px-1 py-0.5 rounded">{sub.buildingType}</span>
                              <span className="mx-1">→</span>
                              <span className="text-xs bg-blue-50 text-blue-600 px-1 py-0.5 rounded">{sub.goal}</span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => {
                                  if (window.confirm("Delete this submission?")) {
                                    removeExpertSubmission(sub.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 p-2"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
                      <option value="why-join-page">Why Join Page</option>
                      <option value="landlord-page">Landlord Page</option>
                      <option value="landlord-schedule">Consultation Page</option>
                      <option value="apply-page">Apply/Join Page</option>
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

          {/* STAFF & NOTIFICATIONS */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-8 border border-neutral-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-heavy uppercase flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" /> Administrative Staff
                  </h3>
                </div>

                <p className="text-sm text-neutral-500 mb-8 max-w-2xl">
                  The people listed below receive automatic email alerts whenever a new space partner signs up or an expert inquiry is submitted. Roles are managed in your authentication profiles.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-neutral-100">
                        <th className="py-4 font-bold text-xs uppercase text-neutral-400">Name / Email</th>
                        <th className="py-4 font-bold text-xs uppercase text-neutral-400">Role</th>
                        <th className="py-4 font-bold text-xs uppercase text-neutral-400 text-center">Alerts Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {profiles.filter(p => p.role === 'super_admin' || p.role === 'space_user').map(profile => (
                        <tr key={profile.id} className="group">
                          <td className="py-4">
                            <div className="font-bold">{profile.full_name || 'Unnamed Admin'}</div>
                            <div className="text-xs text-neutral-500">{profile.email}</div>
                          </td>
                          <td className="py-4">
                            <span className={`text-[10px] uppercase font-heavy px-2 py-1 rounded ${profile.role === 'super_admin' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-700'
                              }`}>
                              {profile.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full border ${profile.notification_settings?.email_alerts !== false ? 'bg-green-50 text-green-700 border-green-100' : 'bg-neutral-50 text-neutral-400 border-neutral-100'
                              }`}>
                              <span className={`w-2 h-2 rounded-full ${profile.notification_settings?.email_alerts !== false ? 'bg-green-500' : 'bg-neutral-300'}`}></span>
                              {profile.notification_settings?.email_alerts !== false ? 'ACTIVE' : 'MUTED'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="text-slate-900 font-bold uppercase text-xs mb-2">System Status: Dynamic Routing Enabled</h4>
                  <p className="text-slate-700 text-sm">
                    Your site now follows <strong>Best Practice</strong> notification handling. Instead of a hardcoded email address, the system automatically routes alerts to all users with the <code>super_admin</code> role in your database.
                  </p>
                </div>

                {isSuperAdmin && (
                  <div className="mt-12 pt-12 border-t border-neutral-100">
                    <h4 className="text-xl font-heavy uppercase flex items-center gap-2 mb-6">
                      <Plus className="w-5 h-5 text-green-600" /> Invite New Administrative Staff
                    </h4>
                    <form onSubmit={handleInviteAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Jane Doe"
                          className="p-3 border bg-neutral-50 font-medium w-full focus:border-black outline-none"
                          value={inviteForm.fullName}
                          onChange={e => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Email Address</label>
                        <input
                          type="email"
                          placeholder="jane@example.com"
                          className="p-3 border bg-neutral-50 font-medium w-full focus:border-black outline-none"
                          value={inviteForm.email}
                          onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-[10px] font-bold uppercase text-neutral-500 mb-1 block">Permission Level</label>
                        <select
                          className="p-3 border bg-neutral-50 font-medium w-full focus:border-black outline-none"
                          value={inviteForm.role}
                          onChange={e => setInviteForm({ ...inviteForm, role: e.target.value as Profile['role'] })}
                          required
                        >
                          <option value="user">Standard Admin (Events & Content)</option>
                          <option value="super_admin">Super Admin (System & Staff Management)</option>
                          <option value="space_user">Space Partner (Limited Access)</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <button
                          disabled={isInviting}
                          className="bg-black text-white px-8 py-3 font-bold uppercase hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isInviting ? (
                            <>Inviting...</>
                          ) : (
                            <>
                              <Mail className="w-4 h-4" /> Send Invitation Email
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-neutral-400 mt-2 italic flex items-center gap-1">
                          <Shield className="w-3 h-3" /> This user will receive an email with a secure link to create their password.
                        </p>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <div className="bg-white p-8 border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-heavy uppercase flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-blue-600" /> Site Configuration
                </h3>
                <div className="max-w-md space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase text-neutral-600 mb-1 block">Google Calendar ID</label>
                    <input
                      type="text"
                      className="p-3 border bg-neutral-50 font-medium w-full focus:border-black outline-none"
                      value={calendarId}
                      onChange={e => setCalendarId(e.target.value)}
                      placeholder="e.g. primary or your-calendar-id@group.calendar.google.com"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1 italic">
                      Use "primary" for your main calendar, or paste a specific Calendar ID from Google Settings.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-neutral-600 mb-1 block">Site Time Zone</label>
                    <select
                      className="p-3 border bg-neutral-50 font-medium w-full"
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Phoenix">Arizona Time (MT, no DST)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                    <p className="text-[10px] text-neutral-500 mt-1 italic">
                      This setting ensures Google Calendar events are synced with the correct time.
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-neutral-600 mb-1 block">Google Maps API Key</label>
                    <input
                      type="password"
                      className="p-3 border bg-neutral-50 font-medium w-full focus:border-black outline-none"
                      value={mapsApiKey}
                      onChange={e => setMapsApiKey(e.target.value)}
                      placeholder="Paste your Google Maps API Key here"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1 italic">
                      Required for address autocomplete and maps. Changes take effect on next page load.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-neutral-100">
                    <h4 className="font-bold uppercase mb-4 text-sm flex items-center gap-2">
                      <CloudLightning className="w-4 h-4 text-orange-500" /> Analytics & Tracking
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-600 mb-1 block">GA4 Measurement ID</label>
                        <input
                          type="text"
                          className="p-3 border bg-neutral-50 font-medium w-full focus:border-black outline-none text-sm"
                          value={ga4Id}
                          onChange={e => setGa4Id(e.target.value)}
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-neutral-600 mb-1 block">Clarity Project ID</label>
                        <input
                          type="text"
                          className="p-3 border bg-neutral-50 font-medium w-full focus:border-black outline-none text-sm"
                          value={clarityId}
                          onChange={e => setClarityId(e.target.value)}
                          placeholder="e.g. abcdefgh12"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-neutral-100">
                    <h4 className="font-bold uppercase mb-4 text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" /> Form Notifications
                    </h4>
                    <div className="space-y-6">
                      {[
                        { key: 'landlord', label: 'Landlord Inquiry Alerts' },
                        { key: 'expert', label: 'Expert Search Alerts' },
                        { key: 'newSpace', label: 'New Space Submission Alerts' }
                      ].map(category => (
                        <div key={category.key} className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-neutral-500 block">{category.label}</label>
                          <div className="grid grid-cols-1 gap-2 border border-neutral-200 bg-neutral-50 p-4 max-h-40 overflow-y-auto">
                            {profiles.filter(p => p.role === 'super_admin' || p.role === 'space_user').map(admin => {
                              const selectedEmails = (notifyEmails as any)[category.key].split(',').map((e: string) => e.trim()).filter(Boolean);
                              const isChecked = selectedEmails.includes(admin.email);

                              return (
                                <label key={admin.id} className="flex items-center gap-3 cursor-pointer hover:bg-neutral-200 p-2 rounded transition-colors">
                                  <input
                                    type="checkbox"
                                    className="accent-black w-4 h-4 cursor-pointer"
                                    checked={isChecked}
                                    onChange={() => {
                                      let newEmails;
                                      if (isChecked) {
                                        newEmails = selectedEmails.filter((e: string) => e !== admin.email);
                                      } else {
                                        newEmails = [...selectedEmails, admin.email];
                                      }
                                      setNotifyEmails({ ...notifyEmails, [category.key]: newEmails.join(', ') });
                                    }}
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-neutral-800">{admin.full_name || 'Unnamed Admin'}</span>
                                    <span className="text-[10px] text-neutral-500 leading-tight">{admin.email}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-neutral-400 italic">
                        Select one or more administrators to receive email alerts for these forms. If none are selected, alerts will be sent to all Super Admins by default.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('admin_tokens')
                          .update({
                            timezone,
                            calendar_id: calendarId,
                            notify_landlord_emails: notifyEmails.landlord,
                            notify_expert_emails: notifyEmails.expert,
                            notify_new_space_emails: notifyEmails.newSpace,
                            google_maps_api_key: mapsApiKey,
                            ga4_measurement_id: ga4Id,
                            clarity_project_id: clarityId
                          })
                          .eq('token_type', 'google_oauth');

                        if (error) throw error;
                        alert('Site settings saved successfully!');
                      } catch (error) {
                        console.error('Error saving settings:', error);
                        alert('Failed to save settings.');
                      }
                    }}
                    className="bg-black text-white px-6 py-3 font-bold uppercase hover:bg-neutral-800 transition-colors w-full"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div >
    </div >
  );
};

export default Admin;