import React, { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useData, Event } from './DataContext';
import RsvpModal from './RsvpModal';
import { EventCardSkeleton } from './Skeleton';
import { OptimizedImage } from './OptimizedImage';

interface EventsProps {
  onViewCalendar?: () => void;
  hideViewAll?: boolean;
  limit?: number;
}

const Events: React.FC<EventsProps> = ({ onViewCalendar, hideViewAll = false, limit }) => {
  const { events, isLoading } = useData();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  const handleRsvpClick = (event: Event) => {
    setSelectedEvent(event);
  };

  // Helper to parse date string robustly as local date
  const parseEventDate = (dateStr: string | undefined): Date => {
    if (!dateStr) return new Date(2000, 0, 1); // Very old date if missing

    // Check for YYYY-MM-DD format
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]), 0, 0, 0, 0);
    }

    // Handle Month Day, Year or other formats
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date(2000, 0, 1);

    // Normalize to start of day in LOCAL time
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  };

  // Filter events into upcoming and past
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.startDate ? parseEventDate(a.startDate) : parseEventDate(a.date);
    const dateB = b.startDate ? parseEventDate(b.startDate) : parseEventDate(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  const upcomingEvents = sortedEvents.filter(event => {
    const eventDate = event.startDate ? parseEventDate(event.startDate) : parseEventDate(event.date);
    return eventDate.getTime() >= today.getTime();
  });

  const pastEvents = sortedEvents.filter(event => {
    const eventDate = event.startDate ? parseEventDate(event.startDate) : parseEventDate(event.date);
    return eventDate.getTime() < today.getTime();
  }).reverse(); // Most recent first for archive

  const allEvents = [...upcomingEvents, ...pastEvents];
  const displayEvents = limit ? allEvents.slice(0, limit) : allEvents;

  return (
    <section id="events" className="py-24 bg-white text-black border-t border-neutral-200 relative">
      {selectedEvent && (
        <RsvpModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 animate-fade-in-up">
          <div>
            <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
              Events & Gatherings
            </span>
            <h2 className="text-4xl md:text-6xl font-heavy uppercase leading-none">
              Mark Your<br />Calendar
            </h2>
          </div>
          <div className="mt-6 md:mt-0 flex gap-6 items-center">
            {!hideViewAll && (
              <div className="mt-6 md:mt-0">
                {onViewCalendar ? (
                  <button
                    onClick={onViewCalendar}
                    className="text-lg font-bold underline decoration-2 underline-offset-4 hover:text-blue-600 transition-colors"
                  >
                    View Full Calendar →
                  </button>
                ) : (
                  <a href="/events" className="text-lg font-bold underline decoration-2 underline-offset-4 hover:text-blue-600 transition-colors">
                    View Full Calendar →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <EventCardSkeleton key={i} />)
          ) : displayEvents.map((event) => {
            const isPast = parseEventDate(event.startDate || event.date).getTime() < today.getTime();

            return (
              <div key={event.id} className={`group flex flex-col bg-neutral-50 border border-neutral-200 transition-all duration-300 animate-fade-in-up ${isPast ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : 'hover:border-black hover:-translate-y-1'}`}>
                <div className="h-64 overflow-hidden relative">
                  <OptimizedImage
                    src={event.image}
                    alt={event.topic}
                    width={600}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {isPast && (
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                      Past Event
                    </div>
                  )}
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <h3 className={`text-2xl font-heavy uppercase mb-6 leading-tight transition-colors ${isPast ? 'text-neutral-500 group-hover:text-blue-600' : 'group-hover:text-blue-600'}`}>
                    {event.topic}
                  </h3>

                  <div className="space-y-4 mt-auto pt-6 border-t border-neutral-200">
                    <div className="flex items-center text-neutral-700 group-hover:text-black transition-colors">
                      <Calendar className="w-5 h-5 mr-3 stroke-2" />
                      <span className="font-bold text-sm uppercase tracking-wide">{event.date}</span>
                    </div>
                    <div className="flex items-center text-neutral-700 group-hover:text-black transition-colors">
                      <Clock className="w-5 h-5 mr-3 stroke-2" />
                      <span className="font-bold text-sm uppercase tracking-wide">{event.time}</span>
                    </div>
                    <div className="flex items-center text-neutral-500">
                      <MapPin className="w-5 h-5 mr-3 stroke-2" />
                      <span className="font-medium text-sm italic">Location: {event.location || 'Available to Members'}</span>
                    </div>
                  </div>

                  {!isPast && (
                    event.externalUrl ? (
                      <a
                        href={event.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-8 bg-black text-white border-2 border-black font-bold uppercase py-3 hover:bg-neutral-800 transition-colors text-sm tracking-wider flex items-center justify-center"
                      >
                        RSVP
                      </a>
                    ) : (
                      <button
                        onClick={() => handleRsvpClick(event)}
                        className="w-full mt-8 bg-white border-2 border-black text-black font-bold uppercase py-3 hover:bg-black hover:text-white transition-colors text-sm tracking-wider"
                      >
                        RSVP
                      </button>
                    )
                  )}
                  {isPast && (
                    <div className="mt-8 text-center text-xs font-bold uppercase text-neutral-400 tracking-widest italic">
                      Event Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {allEvents.length === 0 && !isLoading && (
            <div className="col-span-full py-12 text-center bg-neutral-50 border-2 border-dashed border-neutral-200">
              <p className="font-bold uppercase text-neutral-400 tracking-widest">No gatherings currently scheduled.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Events;
