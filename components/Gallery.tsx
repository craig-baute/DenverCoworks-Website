
import React, { useState, useMemo } from 'react';
import { MapPin, Sparkles, Filter, Check, X, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from './DataContext';
import { SpaceCardSkeleton } from './Skeleton';
import { OptimizedImage } from './OptimizedImage';

const Gallery: React.FC = () => {
  const { spaces, isLoading } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const neighborhoods = useMemo(() => {
    const list = ['All', ...new Set(spaces.map(s => s.neighborhood))];
    return list.sort();
  }, [spaces]);

  const allAmenities = useMemo(() => {
    const list = new Set<string>();
    spaces.forEach(s => {
      s.amenities?.forEach(a => list.add(a));
    });
    return Array.from(list).sort();
  }, [spaces]);

  const filteredSpaces = useMemo(() => {
    return spaces.filter(s => {
      const matchNeighborhood = selectedNeighborhood === 'All' || s.neighborhood === selectedNeighborhood;
      const matchAmenities = selectedAmenities.length === 0 ||
        selectedAmenities.every(a => s.amenities?.includes(a));
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

      return matchNeighborhood && matchAmenities && matchSearch;
    });
  }, [spaces, selectedNeighborhood, selectedAmenities, searchQuery]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSelectedNeighborhood('All');
    setSelectedAmenities([]);
    setSearchQuery('');
  };

  const isSpacesPage = location.pathname === '/spaces';

  return (
    <section id="gallery" className="py-24 bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 animate-fade-in-up">
          <div>
            <h2 className="text-4xl md:text-6xl font-heavy uppercase mb-8">
              Alliance<br />Spaces
            </h2>

            {isSpacesPage && (
              <div className="space-y-8 animate-fade-in max-w-2xl">
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    placeholder="Search spaces by name or description..."
                    className="w-full bg-neutral-900 border border-white/10 p-4 pl-12 text-sm font-bold uppercase tracking-wider outline-none focus:border-white transition-all text-white placeholder:text-neutral-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Neighborhoods */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">
                    <MapPin className="w-3 h-3" /> Neighborhoods
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {neighborhoods.map(nb => (
                      <button
                        key={nb}
                        onClick={() => setSelectedNeighborhood(nb)}
                        className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${selectedNeighborhood === nb
                          ? 'bg-white border-white text-black'
                          : 'border-white/10 text-neutral-400 hover:border-white/40 hover:text-white'
                          }`}
                      >
                        {nb}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                {allAmenities.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">
                      <Sparkles className="w-3 h-3" /> Amenities
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allAmenities.map(amenity => (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${selectedAmenities.includes(amenity)
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-white/10 text-neutral-400 hover:border-white/40 hover:text-white'
                            }`}
                        >
                          {selectedAmenities.includes(amenity) && <Check className="w-3 h-3" />}
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedNeighborhood !== 'All' || selectedAmenities.length > 0 || searchQuery !== '') && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase text-red-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear All Filters & Search
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-12 md:mt-0 text-right">
            <p className="text-neutral-400 max-w-md ml-auto leading-relaxed">
              Explore the network. From clean corporate suites to gritty industrial hubs,
              our alliance covers the entire spectrum of workspace in Denver.
            </p>
            <div className="mt-4 flex flex-col items-end">
              <span className="text-3xl font-heavy leading-none">{filteredSpaces.length}</span>
              <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-1">
                Matching Member Locations
              </span>
            </div>
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
