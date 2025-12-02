
import React, { useState } from 'react';
import { useData } from './DataContext';
import { Mail } from 'lucide-react';
import Events from './Events';

const EventsPage: React.FC = () => {
  const { addLead } = useData();
  const [topic, setTopic] = useState('');
  const [topicStatus, setTopicStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmitTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setTopicStatus('submitting');
    await addLead({
      name: 'Anonymous Topic Submitter',
      email: 'topic@submission.com',
      type: 'topic-submission',
      timestamp: new Date().toISOString(),
      message: `Topic Submission: ${topic}`
    });
    setTimeout(() => {
        setTopicStatus('success');
        setTopic('');
     }, 1000);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-neutral-800 text-white overflow-hidden">
         <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2000&q=80" 
              alt="Industrial Window Background" 
              className="w-full h-full object-cover opacity-40"
            />
         </div>
         <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-heavy uppercase mb-4 tracking-tight">
               Upcoming Events
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium">
               Sharing Knowledge so we run profitable spaces that build community.
            </p>
         </div>
      </section>

      {/* In Person Insights Feature */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
               <img 
                  src="https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1000&q=80" 
                  alt="Coworking Space Overhead" 
                  className="w-full h-auto rounded-sm shadow-lg"
               />
               <div className="h-1 w-24 bg-red-500 mt-8"></div>
            </div>
            <div className="order-1 lg:order-2 text-right lg:text-right">
               <h2 className="text-4xl md:text-6xl font-heavy uppercase leading-[0.9] text-neutral-900 mb-8">
                  IN PERSON<br/>INSIGHTFUL<br/>CONVERSATIONS
               </h2>
               <p className="text-neutral-500 text-sm leading-relaxed mb-8 max-w-md ml-auto">
                  Sign up to join a local group of coworking experts share ideas, trends, insights, and strategies. We rotate between tours, roundtable discussions, and presentations.
               </p>
               <a 
                  href="#contact"
                  className="inline-block border-2 border-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
               >
                  Join Denver Coworks to RSVP
               </a>
            </div>
         </div>
         
         <div className="flex justify-center mt-20 mb-12">
             <div className="h-px w-24 bg-red-500"></div>
         </div>
      </section>

      {/* Reusing the Homepage Events Widget exactly as requested */}
      <Events hideViewAll={true} />

      {/* Submit A Topic Section */}
      <section className="bg-neutral-50 py-24 border-t border-neutral-200">
         <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-heavy uppercase mb-6">Have an idea?</h2>
            <p className="text-sm text-neutral-500 mb-10">
               We are a community-driven alliance. Tell us what you want to discuss, learn, or experiment with at our next gathering.
            </p>

            <form onSubmit={handleSubmitTopic} className="relative max-w-lg mx-auto">
               {topicStatus === 'success' ? (
                  <div className="bg-green-600 text-white p-6 font-bold uppercase text-xl">
                     Topic Submitted! Thanks.
                  </div>
               ) : (
                  <>
                     <textarea 
                        placeholder="I think we should discuss..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-white border border-neutral-300 p-4 text-sm text-black placeholder-neutral-400 focus:outline-none focus:border-black min-h-[100px] mb-4"
                     ></textarea>
                     <button disabled={topicStatus === 'submitting'} className="bg-black text-white font-bold uppercase px-8 py-3 text-xs tracking-widest hover:bg-neutral-800 transition-colors w-full">
                        {topicStatus === 'submitting' ? 'Submitting...' : 'Submit Topic'}
                     </button>
                  </>
               )}
            </form>
         </div>
      </section>
    </div>
  );
};

export default EventsPage;
