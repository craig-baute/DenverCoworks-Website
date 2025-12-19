
import React from 'react';
import { useData } from './DataContext';
import Gallery from './Gallery';

const SpacesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black pt-20">
            {/* Simple Hero */}
            <div className="max-w-7xl mx-auto px-6 py-20 border-b border-white/10">
                <h1 className="text-6xl md:text-9xl font-heavy uppercase text-white mb-6">The<br />Alliance</h1>
                <p className="text-xl text-neutral-400 max-w-2xl">
                    Discover the premier coworking locations across Denver. From industrial lofts in RiNo to luxury suites in Cherry Creek.
                </p>
            </div>

            <Gallery />

            {/* CTA for Landlords */}
            <div className="bg-blue-600 py-20 text-center px-6">
                <h2 className="text-4xl font-heavy uppercase text-white mb-8">Have space to list?</h2>
                <a href="/landlord" className="inline-block bg-white text-black px-8 py-4 font-bold uppercase hover:bg-black hover:text-white transition-all">
                    Learn about alliance membership
                </a>
            </div>
        </div>
    );
};

export default SpacesPage;
