
import React from 'react';
import { useData } from './DataContext';

const Testimonials: React.FC = () => {
  const { testimonials } = useData();

  return (
    <section className="py-24 bg-white border-b border-black">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-center text-3xl font-bold uppercase mb-16 tracking-widest">Community Voices</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((t, i) => (
            <div key={t.id} className="flex flex-col justify-between h-full">
              <div className="mb-6">
                <span className="text-6xl font-serif text-neutral-200 leading-none">"</span>
                <p className="text-xl font-medium leading-relaxed -mt-4 text-neutral-800">
                  {t.quote}
                </p>
              </div>
              <div className="border-t border-black pt-4">
                <p className="font-heavy uppercase text-sm">{t.name}</p>
                <p className="text-neutral-500 text-xs uppercase tracking-wider">{t.title}, {t.space}</p>
              </div>
            </div>
          ))}
          
          {testimonials.length === 0 && (
             <div className="col-span-full text-center py-12 text-neutral-400">
                No testimonials added yet.
             </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
    