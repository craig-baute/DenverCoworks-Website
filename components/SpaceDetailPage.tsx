
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, Space } from './DataContext';
import { MapPin, Sparkles, Globe, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

const SpaceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { spaces } = useData();
    const navigate = useNavigate();
    const [activeImage, setActiveImage] = useState(0);

    const space = spaces.find(s => String(s.id) === id);

    if (!space) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-black">
                <div className="text-center">
                    <h2 className="text-4xl font-heavy uppercase mb-4">Space Not Found</h2>
                    <button onClick={() => navigate('/spaces')} className="underline font-bold uppercase">Back to Spaces</button>
                </div>
            </div>
        );
    }

    const allImages = [space.imageUrl, ...(space.images || [])].filter(Boolean);

    return (
        <div className="min-h-screen bg-white text-black pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Navigation Back */}
                <button
                    onClick={() => navigate('/spaces')}
                    className="flex items-center gap-2 font-bold uppercase text-sm mb-12 hover:text-blue-600 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Alliance Spaces
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left Side: Images */}
                    <div className="space-y-6">
                        <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative group">
                            <OptimizedImage
                                src={allImages[activeImage]}
                                alt={space.name}
                                width={1200}
                                className="w-full h-full object-cover animate-fade-in"
                            />

                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImage(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 shadow-lg hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setActiveImage(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 shadow-lg hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="grid grid-cols-5 gap-4">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`aspect-square border-2 transition-all ${activeImage === i ? 'border-blue-600' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <OptimizedImage src={img} width={200} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Info */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-black text-white px-3 py-1 text-[10px] font-heavy uppercase tracking-widest">{space.neighborhood}</span>
                                <span className="flex items-center text-xs font-bold uppercase text-neutral-400">
                                    <Sparkles className="w-3 h-3 mr-1 text-yellow-500" /> {space.vibe}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-heavy uppercase leading-[0.9] mb-6">
                                {space.name}
                            </h1>
                            <div className="flex items-center text-neutral-600 font-medium text-lg">
                                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                {space.address}
                            </div>
                        </div>

                        <div className="prose prose-lg text-neutral-600 mb-10 max-w-none">
                            {space.description || "The Denver Coworks Alliance brings you the best coworking experience. This space offers a unique blend of community, productivity, and local Denver vibes."}
                        </div>

                        {/* Amenities */}
                        {space.amenities && space.amenities.length > 0 && (
                            <div className="mb-10">
                                <h3 className="text-xl font-heavy uppercase mb-6 border-b border-black pb-2 inline-block">Key Amenities</h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                    {space.amenities.map(amenity => (
                                        <div key={amenity} className="flex items-center font-bold uppercase text-sm tracking-tight">
                                            <CheckCircle2 className="w-4 h-4 mr-3 text-green-500" />
                                            {amenity}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-10 border-t border-neutral-100">
                            {space.website && (
                                <a
                                    href={space.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-black text-white px-10 py-5 font-heavy uppercase tracking-widest text-lg hover:bg-blue-600 transition-all shadow-xl inline-flex items-center gap-3"
                                >
                                    Visit Website <Globe className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpaceDetailPage;
