
import React, { useState } from 'react';
import { X, CheckCircle2, CalendarPlus } from 'lucide-react';
import { useData, Event } from './DataContext';

interface RsvpModalProps {
  event: Event;
  onClose: () => void;
}

const RsvpModal: React.FC<RsvpModalProps> = ({ event, onClose }) => {
  const { addRsvp } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    space: '',
    // Honeypot field - hidden from users, visible to bots
    website: '' 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Spam Detection: If the hidden 'website' field is filled, it's likely a bot.
    // We silently fail or just close the modal without saving.
    if (formData.website) {
      console.warn("Bot detected via honeypot.");
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Database (Backend)
      await addRsvp({
        eventName: event.topic,
        attendeeName: formData.name,
        email: formData.email,
        spaceName: formData.space,
        timestamp: new Date().toISOString()
      });

      // Simulate Email Sending (since we don't have a backend mail server here)
      console.log(`
        ---------------------------------------------------
        EMAIL SIMULATION:
        To: bautecm@gmail.com
        Subject: RSVP Confirmed ${event.topic}
        Body:
          Name: ${formData.name}
          Email: ${formData.email}
          Space: ${formData.space}
        ---------------------------------------------------
      `);

      setIsSuccess(true);
      
    } catch (error) {
      console.error("RSVP Error", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    try {
      // Attempt to parse the date string. 
      // We append the current year if it's missing to ensure it parses correctly.
      const currentYear = new Date().getFullYear();
      const dateStr = event.date.includes(String(currentYear)) 
        ? event.date 
        : `${event.date}, ${currentYear}`;
        
      const startDateTime = new Date(`${dateStr} ${event.time}`);
      
      // If date parsing failed, return null or a default
      if (isNaN(startDateTime.getTime())) return null;

      // Assume event is 1 hour long
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

      // Format to YYYYMMDDTHHMMSSZ (UTC)
      const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

      const start = formatTime(startDateTime);
      const end = formatTime(endDateTime);

      const details = `RSVP Confirmed for ${event.topic}. \n\nDescription: ${event.description || ''}`;
      const location = event.location || '';

      const url = new URL('https://calendar.google.com/calendar/render');
      url.searchParams.append('action', 'TEMPLATE');
      url.searchParams.append('text', event.topic);
      url.searchParams.append('dates', `${start}/${end}`);
      url.searchParams.append('details', details);
      url.searchParams.append('location', location);

      return url.toString();
    } catch (e) {
      console.error("Error generating calendar link", e);
      return null;
    }
  };

  const calendarUrl = getGoogleCalendarUrl();

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md p-12 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-black">
             <X className="w-6 h-6" />
          </button>
          <div className="flex justify-center mb-6">
             <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-heavy uppercase mb-4">You're In!</h2>
          <p className="text-neutral-600 mb-8">
            We've confirmed your RSVP for <strong>{event.topic}</strong>. Check your inbox shortly for details.
          </p>
          
          <div className="flex flex-col gap-3">
            {calendarUrl && (
              <a 
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white font-bold uppercase px-8 py-3 hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
              >
                <CalendarPlus className="w-5 h-5" /> Add to Google Calendar
              </a>
            )}
            <button 
              onClick={onClose}
              className="bg-black text-white font-bold uppercase px-8 py-3 hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-10">
          <h2 className="text-3xl font-heavy uppercase mb-2">RSVP Now</h2>
          <p className="text-neutral-500 text-sm mb-6">
            Secure your spot for <span className="font-bold text-black">{event.topic}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Read Only Event Name */}
            <div>
              <label className="font-bold uppercase text-xs mb-1 block text-neutral-400">Event</label>
              <input 
                type="text" 
                value={event.topic} 
                readOnly 
                className="w-full bg-neutral-100 border border-neutral-200 p-3 text-sm font-bold text-neutral-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-xs mb-1 block">Your Name</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name} 
                onChange={handleChange}
                className="w-full bg-white border-2 border-neutral-200 p-3 font-medium focus:border-black focus:outline-none transition-colors"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-xs mb-1 block">Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email} 
                onChange={handleChange}
                className="w-full bg-white border-2 border-neutral-200 p-3 font-medium focus:border-black focus:outline-none transition-colors"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-xs mb-1 block">Name of Space / Company</label>
              <input 
                type="text" 
                name="space"
                required
                value={formData.space} 
                onChange={handleChange}
                className="w-full bg-white border-2 border-neutral-200 p-3 font-medium focus:border-black focus:outline-none transition-colors"
                placeholder="The Hive Denver"
              />
            </div>

            {/* Spam Trap (Honeypot) - Hidden from real users */}
            <div className="hidden">
               <label>Don't fill this out if you are human</label>
               <input 
                  type="text" 
                  name="website" 
                  value={formData.website} 
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
               />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-white font-heavy uppercase py-4 tracking-widest hover:bg-neutral-800 transition-colors mt-4 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Confirm RSVP'}
            </button>
          </form>
        </div>
        
        <div className="bg-neutral-50 p-4 text-center text-xs text-neutral-400 border-t border-neutral-100">
           Protected by Denver Coworks spam detection.
        </div>
      </div>
    </div>
  );
};

export default RsvpModal;
