
import React from 'react';
import { MessageSquare, TrendingUp, Users, Zap, HeartHandshake, Lightbulb } from 'lucide-react';

interface AllianceInfoProps {
  onJoinClick?: () => void;
}

const AllianceInfo: React.FC<AllianceInfoProps> = ({ onJoinClick }) => {
  const benefits = [
    {
      icon: <MessageSquare className="w-8 h-8 mb-4 text-yellow-400" />,
      title: "Honest Conversations",
      description: "No fluff. We meet every few weeks to share the real struggles and wins of running shared workspaces. Get the unvarnished truth."
    },
    {
      icon: <TrendingUp className="w-8 h-8 mb-4 text-green-400" />,
      title: "Ahead of Trends",
      description: "Stay ahead of the curve. We discuss emerging trends in the Denver flexible office market before they hit the mainstream news."
    },
    {
      icon: <Zap className="w-8 h-8 mb-4 text-blue-400" />,
      title: "Marketing Experiments",
      description: "We share what's working (and what's not) in acquisition strategies. Save money by learning from our collective experiments."
    },
    {
      icon: <HeartHandshake className="w-8 h-8 mb-4 text-red-400" />,
      title: "Support System",
      description: "Running a space can be lonely. We are a support network that makes all of us stronger. A rising tide lifts all boats."
    }
  ];

  return (
    <section id="alliance" className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 items-center">
          <div className="animate-fade-in-up">
            <h2 className="text-5xl md:text-7xl font-heavy uppercase mb-8 leading-none">
              Why Join<br/>The Alliance?
            </h2>
            <div className="h-2 w-24 bg-blue-600 mb-8"></div>
            <p className="text-xl text-neutral-300 font-light leading-relaxed mb-8">
              For coworking entrepreneurs and operators, the Denver Coworks Alliance is your competitive advantage. 
              We are a collective of industry experts committed to excellence, collaboration, and mutual growth.
            </p>
            <button 
              onClick={onJoinClick}
              className="inline-block bg-white text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-colors"
            >
              Apply for Membership
            </button>
          </div>
          <div className="relative group perspective-1000">
             <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" 
              alt="Coworking members collaborating" 
              className="w-full h-auto rounded-sm shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] group-hover:rotate-1"
            />
            {/* Updated Badge to only highlight Established 2012 */}
            <div className="absolute -bottom-6 -left-6 border-4 border-blue-600 p-6 bg-black hidden md:block z-10 shadow-xl">
              <p className="text-3xl font-heavy uppercase text-white leading-none tracking-wide">
                Established <br/><span className="text-blue-500">2012</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((feature, index) => (
            <div key={index} className={`border-t border-neutral-800 pt-8 hover:bg-neutral-900/50 transition-colors duration-300 group pr-4 animate-fade-in-up`} style={{animationDelay: `${index * 100}ms`}}>
              <div className="text-white group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold uppercase mb-3 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllianceInfo;
