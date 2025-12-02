
import React, { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useData, Event } from './DataContext';
import RsvpModal from './RsvpModal';

interface EventsProps {
  onViewCalendar?: () => void;
  hideViewAll?: boolean;
}

const Events: React.FC<EventsProps> = ({ onViewCalendar, hideViewAll = false }) => {
  const { events } = useData();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleRsvpClick = (event: Event) => {
    if (onViewCalendar && !hideViewAll) {
        // If we are on the homepage widget, we might want to just go to the events page? 
        // Or open the modal directly? The prompt says "Click RSVP button, pop up form".
        // So we open the modal directly regardless of where we are.
    }
    setSelectedEvent(event);
  };

  return (
    <section id="events" className="py-24 bg-white text-black border-t border-neutral-200 relative">
      {selectedEvent && (
        <RsvpModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 animate-fade-in-up">
          <div>
             <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
              Mark Your Calendar
            </span>
            <h2 className="text-4xl md:text-6xl font-heavy uppercase leading-none">
              Upcoming<br/>Gatherings
            </h2>
          </div>
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
                 <a href="#contact" className="text-lg font-bold underline decoration-2 underline-offset-4 hover:text-blue-600 transition-colors">
                    View Full Calendar →
                 </a>
               )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.slice(0, 3).map((event) => (
            <div key={event.id} className="group flex flex-col bg-neutral-50 border border-neutral-200 hover:border-black transition-all duration-300 hover:-translate-y-1">
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={event.image} 
                  alt={event.topic} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="text-2xl font-heavy uppercase mb-6 leading-tight group-hover:text-blue-600 transition-colors">
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

                <button 
                  onClick={() => handleRsvpClick(event)}
                  className="w-full mt-8 bg-white border-2 border-black text-black font-bold uppercase py-3 hover:bg-black hover:text-white transition-colors text-sm tracking-wider"
                >
                  RSVP
                </button>
              </div>
            </div>
          ))}

          {events.length === 0 && (
             <div className="col-span-full py-12 text-center bg-neutral-50">
                <p className="font-bold uppercase text-neutral-400">No upcoming events scheduled.</p>
             </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Events;
