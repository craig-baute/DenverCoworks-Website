
import React, { useState, useMemo } from 'react';
import { MapPin, Sparkles, Filter } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from './DataContext';
import { SpaceCardSkeleton } from './Skeleton';
import { OptimizedImage } from './OptimizedImage';

const Gallery: React.FC = () => {
  const { spaces, isLoading } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');

  const neighborhoods = useMemo(() => {
    const list = ['All', ...new Set(spaces.map(s => s.neighborhood))];
    return list.sort();
  }, [spaces]);

  const filteredSpaces = useMemo(() => {
    if (selectedNeighborhood === 'All') return spaces;
    return spaces.filter(s => s.neighborhood === selectedNeighborhood);
  }, [spaces, selectedNeighborhood]);

  const isSpacesPage = location.pathname === '/spaces';

  return (
    <section id="gallery" className="py-24 bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 animate-fade-in-up">
          <div>
            <h2 className="text-4xl md:text-6xl font-heavy uppercase">
              Alliance<br />Spaces
            </h2>

            {/* Neighborhood Filter Bar */}
            {isSpacesPage && neighborhoods.length > 2 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {neighborhoods.map(nb => (
                  <button
                    key={nb}
                    onClick={() => setSelectedNeighborhood(nb)}
                    className={`px-4 py-1 text-xs font-bold uppercase tracking-wider border transition-all ${selectedNeighborhood === nb
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-white/20 text-neutral-400 hover:border-white hover:text-white'
                      }`}
                  >
                    {nb}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 md:mt-0 text-right">
            <p className="text-neutral-400 max-w-md ml-auto">
              Explore the network. From clean corporate suites to gritty industrial hubs,
              our alliance covers the entire spectrum of workspace in Denver.
            </p>
            <p className="text-xs text-neutral-600 mt-2 font-mono">
              Displaying {filteredSpaces.length} {selectedNeighborhood !== 'All' ? `${selectedNeighborhood} ` : ''}Member Locations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[300px]">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <SpaceCardSkeleton key={i} />)
          ) : filteredSpaces.map((space, index) => (
            <div
              key={space.id}
              onClick={() => navigate(`/spaces/${space.id}`)}
              className={`relative overflow-hidden group cursor-pointer ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} border border-neutral-800 hover:border-neutral-600 transition-colors animate-fade-in-up`}
            >
              {/* Background Image */}
              <OptimizedImage
                src={space.imageUrl || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80'}
                alt={space.name}
                width={index === 0 ? 1200 : 600}
                className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-110 group-hover:brightness-110"
              />

              {/* Overlay Gradient - Always visible at bottom, grows on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-heavy uppercase mb-2 leading-none tracking-tight text-white drop-shadow-md">
                  {space.name}
                </h3>

                <div className="space-y-1">
                  <div className="flex items-center text-neutral-300 text-sm font-bold uppercase tracking-wide">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    {space.neighborhood}
                  </div>
                  <div className="flex items-center text-neutral-400 text-xs uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 mr-3 ml-0.5 text-yellow-500" />
                    {space.vibe}
                  </div>
                </div>
              </div>

              {/* Hover 'View' Button - appears on hover */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-white text-black text-xs font-bold uppercase px-3 py-1">
                  View Space
                </span>
              </div>
            </div>
          ))}

          {spaces.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-neutral-800">
              <p className="text-neutral-500 uppercase font-bold">No spaces found in the database.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
