
import React from 'react';

interface HeroProps {
  onScheduleClick?: () => void;
  onJoinClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onScheduleClick, onJoinClick }) => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden pt-20 bg-black">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover animate-slow-zoom opacity-80"
          poster="https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1920&q=80"
        >
          {/* Updated video: Creative, industrial loft style (fits Denver vibe better) */}
          <source src="https://videos.pexels.com/video-files/7578544/7578544-uhd_3840_2160_25fps.mp4" type="video/mp4" />
          {/* Fallback image: Industrial workspace with brick */}
          <img
            src="https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1920&q=80"
            alt="Denver Coworking Space"
            className="w-full h-full object-cover"
          />
        </video>
        {/* Dark overlay to make white text pop, but transparent enough to see the video */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className="animate-fade-in-up">
          <p className="text-sm md:text-base font-heavy uppercase tracking-[0.3em] mb-4 text-blue-400 drop-shadow-lg">
            Denver Coworks
          </p>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-heavy uppercase leading-[0.9] mb-8 tracking-tight text-white drop-shadow-2xl">
            Work <br /> Together
          </h1>
          <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto mb-10 text-neutral-200 delay-100 animate-fade-in-up drop-shadow-md">
            The premier alliance of coworking operators, community managers, and industry experts in Greater Denver.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center delay-200 animate-fade-in-up">
            <button
              onClick={onJoinClick}
              className="bg-white text-black px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-neutral-200 transition-all hover:scale-105 border-2 border-white shadow-lg animate-glow-pulse"
            >
              Join the Alliance
            </button>
            <button
              onClick={onScheduleClick}
              className="bg-black/30 backdrop-blur-md text-white px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-black hover:text-white transition-all border-2 border-white/30 hover:border-black"
            >
              Do you have Empty Space?
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce z-20 text-white">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
