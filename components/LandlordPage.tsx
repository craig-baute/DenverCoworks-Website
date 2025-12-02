
import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, Map, ClipboardCheck, Users, Rocket, BarChart3 } from 'lucide-react';
import FindExpertTool from './FindExpertTool';
import ContactForm from './ContactForm';

interface LandlordPageProps {
  onScheduleClick?: () => void;
}

const LandlordPage: React.FC<LandlordPageProps> = ({ onScheduleClick }) => {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative py-32 bg-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80" 
            alt="Modern Building Facade" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-4xl animate-fade-in-up">
            <span className="bg-blue-600 text-white px-4 py-1 text-sm font-bold uppercase tracking-widest mb-6 inline-block">
              For Building Owners
            </span>
            <h1 className="text-6xl md:text-8xl font-heavy uppercase mb-8 leading-none">
              We Are The<br/>Denver Experts.
            </h1>
            <p className="text-xl md:text-2xl text-neutral-200 max-w-2xl leading-relaxed">
              Stop guessing. We know what's working, what isn't, and which operators drive revenue. We make the decision fast, easy, and data-backed.
            </p>
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-heavy uppercase mb-6 leading-tight">
              Confidence to<br/>Move Forward.
            </h2>
            <div className="prose prose-lg text-neutral-600 mb-8">
              <p>
                Filling empty space isn't just about signing a lease; it's about activation. 
                The Denver market is unique. What works in RiNo might fail in Cherry Creek. 
                What works in Highlands Ranch could lose you hundreds of thousands in Broomfield.
              </p>
              <p>
                We act as your filter. We review your property and tell you honestly if coworking will work. 
                If it's a "No," we save you money. If it's a "Yes," we connect you with the best operators 
                in the city to ensure execution is flawless.
              </p>
            </div>
            <button 
              onClick={onScheduleClick}
              className="inline-flex items-center font-bold uppercase text-lg border-b-2 border-black pb-1 hover:text-blue-600 hover:border-blue-600 transition-colors"
            >
              Schedule a Call <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
          <div className="order-1 lg:order-2 relative">
             <div className="absolute -top-4 -right-4 w-2/3 h-full bg-neutral-100 -z-10"></div>
             <img 
               src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" 
               alt="Office Blueprint and Planning" 
               className="w-full h-auto shadow-2xl border border-neutral-200"
             />
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-24 bg-black text-white border-y border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-heavy uppercase mb-4">The Process</h2>
            <p className="text-neutral-400 text-xl">From vacancy to vibrant community in 4 steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-neutral-800 -z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 bg-black p-6 border-l-4 border-blue-600 md:border-l-0 md:border-t-4 md:pt-8">
              <div className="bg-neutral-900 w-16 h-16 flex items-center justify-center rounded-full mb-6 border-2 border-black shadow-xl">
                 <Map className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-heavy uppercase mb-3">1. Review</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                We analyze your specific property, location, and neighborhood demographics to establish a baseline.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 bg-black p-6 border-l-4 border-blue-600 md:border-l-0 md:border-t-4 md:pt-8">
              <div className="bg-neutral-900 w-16 h-16 flex items-center justify-center rounded-full mb-6 border-2 border-black shadow-xl">
                 <ClipboardCheck className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-heavy uppercase mb-3">2. Feasibility</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                We determine the exact type of coworking that fits your floor plan (Executive, Creative, Hybrid) and provide a Go/No-Go decision.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 bg-black p-6 border-l-4 border-blue-600 md:border-l-0 md:border-t-4 md:pt-8">
              <div className="bg-neutral-900 w-16 h-16 flex items-center justify-center rounded-full mb-6 border-2 border-black shadow-xl">
                 <Users className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-heavy uppercase mb-3">3. Match</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                We open our rolodex and pair you with the perfect operator who understands your specific asset class.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 bg-black p-6 border-l-4 border-green-500 md:border-l-0 md:border-t-4 md:pt-8">
              <div className="bg-neutral-900 w-16 h-16 flex items-center justify-center rounded-full mb-6 border-2 border-black shadow-xl">
                 <Rocket className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-heavy uppercase mb-3 text-green-500">4. Launch</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Open the doors in as little as <span className="text-white font-bold">3 months</span> (maybe even 2). Start generating revenue immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tool Inserted */}
      <FindExpertTool />

      {/* DenSwap Market Analysis */}
      <section className="py-24 bg-neutral-100">
        <div className="max-w-6xl mx-auto px-6">
           <div className="bg-white shadow-2xl border-2 border-black p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b-2 border-neutral-100 pb-8">
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <BarChart3 className="w-6 h-6" />
                       <span className="font-bold uppercase text-sm tracking-widest text-neutral-500">Powered by DenSwap</span>
                    </div>
                    <h2 className="text-4xl font-heavy uppercase">Denver Market Opportunity</h2>
                 </div>
                 <a 
                    href="https://denswap.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 md:mt-0 bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-blue-600 transition-colors"
                 >
                    Visit DenSwap.com
                 </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {/* Opportunities */}
                 <div>
                    <h3 className="text-2xl font-heavy uppercase mb-6 flex items-center text-green-600">
                       <CheckCircle2 className="w-6 h-6 mr-3" />
                       High Opportunity
                    </h3>
                    <p className="text-sm text-neutral-500 mb-6">
                       These neighborhoods are showing high demand signals with low saturation of flexible workspace options.
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {['Uptown / Cap Hill', 'Congress Park', 'Lakewood', 'Broomfield', 'Lafayette', 'Parker', 'Old Towne Arvada', 'Littleton'].map(city => (
                          <li key={city} className="flex items-center font-bold text-neutral-800 border border-neutral-200 p-3 bg-neutral-50">
                             <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                             {city}
                          </li>
                       ))}
                    </ul>
                 </div>

                 {/* Avoid */}
                 <div>
                    <h3 className="text-2xl font-heavy uppercase mb-6 flex items-center text-red-500">
                       <XCircle className="w-6 h-6 mr-3" />
                       Market Saturated
                    </h3>
                    <p className="text-sm text-neutral-500 mb-6">
                       These areas currently have an oversupply of coworking desks relative to current demand.
                    </p>
                    <ul className="space-y-3">
                       {['Cherry Creek', 'Upper Downtown', 'Lone Tree'].map(city => (
                          <li key={city} className="flex items-center font-bold text-neutral-400 border border-neutral-100 p-3">
                             <div className="w-2 h-2 bg-red-300 rounded-full mr-3"></div>
                             {city}
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-blue-600 text-white text-center px-6">
         <h2 className="text-5xl md:text-7xl font-heavy uppercase mb-8">Ready to Activate?</h2>
         <p className="text-2xl font-medium mb-12 max-w-2xl mx-auto opacity-90">
            Let's review your floor plan and get your space generating revenue in 90 days or less.
         </p>
         <button 
            onClick={onScheduleClick}
            className="inline-block bg-white text-black px-10 py-5 font-heavy uppercase tracking-widest text-xl hover:bg-black hover:text-white transition-all shadow-xl transform hover:-translate-y-1"
         >
            Schedule a Consultation
         </button>
      </section>
    </div>
  );
};

export default LandlordPage;
