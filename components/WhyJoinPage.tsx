
import React, { useState } from 'react';
import { Users, MessageSquare, Map, TrendingUp, Share2, Settings, FileText, Check } from 'lucide-react';
import { useData } from './DataContext';

const WhyJoinPage: React.FC = () => {
  const { addLead } = useData();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    
    // Add to leads DB as a newsletter signup
    await addLead({
        name: 'Newsletter Subscriber',
        email: email,
        type: 'newsletter',
        message: 'Signed up via Why Join Page footer',
        timestamp: new Date().toISOString()
    });

    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  const benefits = [
    {
      title: "Regular In-Person Gatherings",
      icon: <Users className="w-8 h-8 text-blue-500" />,
      desc: "Coworking is about working together so we can all succeed. Trust and honesty are the foundations of our group. We meet in-person, no video calls, so we can share how our spaces are doing, share wins and struggles, and share how we've overcome these struggles."
    },
    {
      title: "Space Tours with Q + As",
      icon: <Map className="w-8 h-8 text-green-500" />,
      desc: "We frequently tour each other's spaces and have the space operator share their decision making process in design, pricing, market positioning, and staffing. It's amazing how much each operator has to share when prompted by curiosity."
    },
    {
      title: "Trend Updates and Research",
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      desc: "Get regular updates on trends going on in Denver and nationally. The alliance works with DenSwap for coworking market research to know where opportunities exist and insights."
    },
    {
      title: "Lead Sharing",
      icon: <Share2 className="w-8 h-8 text-yellow-500" />,
      desc: "If someone comes into our spaces and we don't fit what they're looking for, we share their information and recommend a tour to the space that is the best fit. Member finds the best spot. One of us gets new $$."
    },
    {
      title: "Software Recommendations",
      icon: <Settings className="w-8 h-8 text-red-500" />,
      desc: "Ask the group and get a trusted answer from people that understand your company. We've all tested out a bunch of coworking management stuff, IT stuff, door access controls, email marketing, etc."
    },
    {
      title: "Policy Recommendations",
      icon: <FileText className="w-8 h-8 text-orange-500" />,
      desc: "Stop reinventing the wheel. From member agreements to pet policies and cancellation terms, we share what works legally and operationally in the Denver market to protect your business."
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative py-32 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
             <img 
               src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80" 
               alt="Group collaboration" 
               className="w-full h-full object-cover"
             />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-heavy uppercase mb-6 leading-none">
            What We're<br/>About
          </h1>
          <div className="h-2 w-24 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl font-medium text-neutral-200 max-w-2xl mx-auto">
            Sharing Knowledge so we run profitable spaces that build community.
          </p>
        </div>
      </section>

      {/* True Collaboration Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="relative">
              <div className="absolute top-4 left-4 w-full h-full border-4 border-black -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=800&q=80" 
                alt="The Alliance Group" 
                className="w-full h-auto shadow-xl"
              />
           </div>
           <div className="space-y-8">
              <h2 className="text-5xl md:text-7xl font-heavy uppercase leading-[0.9]">
                True<br/>Collaboration.
              </h2>
              <div className="prose prose-lg text-neutral-600 leading-relaxed">
                <p>
                  The Alliance is a group of coworking veterans ready to help others in greater Denver.
                </p>
                <p className="font-bold text-black">
                  We started out at 6 members in 2012 and we're now the largest regional alliance in the US.
                </p>
                <p>
                  We offer honest insight and work together so all coworking can succeed and build community. Unlike national chains, we believe that a rising tide lifts all boats. When one independent space succeeds, the entire ecosystem becomes stronger.
                </p>
              </div>
           </div>
        </div>
      </section>

      {/* A Few Things We Do Section */}
      <section className="py-24 bg-neutral-50 border-y border-neutral-200">
         <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
               <h2 className="text-3xl font-bold uppercase border-l-8 border-black pl-6 py-2">A Few Things We Do:</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {benefits.map((item, idx) => (
                  <div key={idx} className="bg-white border-2 border-neutral-200 p-8 hover:border-black hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col h-full">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-heavy uppercase pr-4">{item.title}</h3>
                        <div className="bg-neutral-50 p-3 rounded-full border border-neutral-100">
                           {item.icon}
                        </div>
                     </div>
                     <p className="text-neutral-600 leading-relaxed flex-grow">
                        {item.desc}
                     </p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 px-6 text-center bg-white">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-heavy uppercase mb-6">Don't Miss A Thing.</h2>
            <p className="text-xl text-neutral-500 mb-12">
               Sign up for event updates, market reports, and alliance news delivered to your inbox.
            </p>
            
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto relative">
               <input 
                  type="email" 
                  placeholder="Your Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-5 border-2 border-black bg-neutral-50 text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
               />
               <button 
                  disabled={status === 'submitting' || status === 'success'}
                  className={`mt-4 w-full font-heavy uppercase py-5 tracking-widest text-white transition-all ${status === 'success' ? 'bg-green-500' : 'bg-black hover:bg-neutral-800'}`}
               >
                  {status === 'submitting' ? 'Signing Up...' : status === 'success' ? 'Welcome to the Alliance!' : 'Sign Up Now'}
               </button>
               {status === 'success' && (
                  <p className="mt-4 text-green-600 font-bold flex items-center justify-center animate-fade-in-up">
                     <Check className="w-4 h-4 mr-2" /> You've been added to the list.
                  </p>
               )}
            </form>
         </div>
      </section>
    </div>
  );
};

export default WhyJoinPage;
