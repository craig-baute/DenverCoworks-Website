import React from 'react';
import { useData } from './DataContext';
import { OptimizedImage } from './OptimizedImage';

const SuccessStories: React.FC = () => {
  const { successStories } = useData();

  return (
    <section id="success-stories" className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/20 pb-8 animate-fade-in-up">
          <div>
            <h2 className="text-4xl md:text-6xl font-heavy uppercase leading-none">
              Real<br />Results
            </h2>
          </div>
          <div className="mt-6 md:mt-0 max-w-md text-right">
            <p className="text-xl text-neutral-300">
              We don't just talk about coworking; we build profitable businesses. See how we help building owners win.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {successStories.map((story) => (
            <div key={story.id} className="group bg-neutral-900 border border-neutral-800 hover:border-white transition-colors duration-300 hover:-translate-y-2">
              <div className="h-48 overflow-hidden relative">
                <OptimizedImage
                  src={story.image}
                  alt={story.title}
                  width={600}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-xs font-bold uppercase shadow-md">
                  {story.type}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold uppercase mb-4 group-hover:text-blue-400 transition-colors">{story.title}</h3>
                <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-6">
                  <div>
                    <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Result</p>
                    <p className="text-xl font-heavy text-green-400">{story.stat}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Timeframe</p>
                    <p className="text-xl font-heavy text-white">{story.time}</p>
                  </div>
                </div>
                <p className="text-neutral-400 leading-relaxed text-sm">
                  {story.desc}
                </p>
              </div>
            </div>
          ))}

          {successStories.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-500 border border-neutral-800">
              No success stories added yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
