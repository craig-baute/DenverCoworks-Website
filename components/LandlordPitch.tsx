
import React from 'react';
import { CheckCircle2, XCircle, BarChart3, ArrowRight } from 'lucide-react';

interface LandlordPitchProps {
  onViewFullPage?: () => void;
}

const LandlordPitch: React.FC<LandlordPitchProps> = ({ onViewFullPage }) => {
  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('expert-tool');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="landlords" className="py-24 bg-white text-black pb-0">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center max-w-4xl mx-auto mb-20 animate-fade-in-up">
          <h2 className="text-5xl md:text-7xl font-heavy uppercase mb-6">
            No More <span className="line-through decoration-4 decoration-red-500 text-neutral-400">Empty Space</span>
          </h2>
          <p className="text-2xl font-medium">
            Building Owners: Turn vacancy into vibrancy. Start generating revenue in as little as 3 months.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 lg:order-1 space-y-8">
            <div className="space-y-6">
              <p className="text-lg text-neutral-700 leading-relaxed">
                The coworking model is the most efficient way to monetize underutilized assets.
                Whether you have a second-generation office, a retail storefront, or an industrial warehouse,
                there is a demand for flexible workspace in your neighborhood.
              </p>

              <div className="space-y-4 pt-4">
                <h4 className="text-xl font-heavy uppercase border-b border-black pb-2 inline-block">We Work With</h4>
                <ul className="space-y-4">
                  <li className="flex items-center group">
                    <div className="bg-black text-white p-1 mr-4 rounded-full group-hover:bg-blue-600 group-hover:scale-110 transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg uppercase tracking-tight">Second-generation Office</span>
                  </li>
                  <li className="flex items-center group">
                    <div className="bg-black text-white p-1 mr-4 rounded-full group-hover:bg-green-600 group-hover:scale-110 transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg uppercase tracking-tight">Retail Storefronts</span>
                  </li>
                  <li className="flex items-center group">
                    <div className="bg-black text-white p-1 mr-4 rounded-full group-hover:bg-yellow-500 group-hover:scale-110 transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg uppercase tracking-tight">Warehouses & Industrial</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <a
                href="#expert-tool"
                onClick={scrollToTool}
                className="text-xl font-heavy underline decoration-4 decoration-blue-600 underline-offset-4 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Identify your opportunity below ↓
              </a>
              {onViewFullPage && (
                <button
                  onClick={onViewFullPage}
                  className="bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-neutral-800 transition-all flex items-center gap-2"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
              alt="Modern office space"
              className="w-full h-80 object-cover hover:scale-[1.02] transition-all duration-500 shadow-lg rounded-sm"
            />
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
              alt="Collaborative meeting area"
              className="w-full h-80 object-cover hover:scale-[1.02] transition-all duration-500 mt-12 shadow-lg rounded-sm"
            />
          </div>
        </div>

        {/* DenSwap Market Analysis - Duplicated from Landlord Page */}
        <div className="mt-24 bg-neutral-100 -mx-6 px-6 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
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
        </div>
      </div>
    </section>
  );
};

export default LandlordPitch;
