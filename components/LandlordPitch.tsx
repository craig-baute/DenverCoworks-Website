
import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

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
      </div>
    </section>
  );
};

export default LandlordPitch;
