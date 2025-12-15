
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Lock } from 'lucide-react';
import Hero from './components/Hero';
import AllianceInfo from './components/AllianceInfo';
import Events from './components/Events';
import LandlordPitch from './components/LandlordPitch';
import FindExpertTool from './components/FindExpertTool';
import SuccessStories from './components/SuccessStories';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import Admin from './components/Admin';
import Login from './components/Login';
import EventsPage from './components/EventsPage';
import BlogPage from './components/BlogPage';
import WhyJoinPage from './components/WhyJoinPage';
import LandlordPage from './components/LandlordPage';
import LandlordSchedulePage from './components/LandlordSchedulePage';
import ApplyPage from './components/ApplyPage';
import { DataProvider } from './components/DataContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import SEOHead from './components/SEOHead';
import SiteLogo from './components/SiteLogo';

import SpaceUserLogin from './components/SpaceUserLogin';
import SpaceUserDashboard from './components/SpaceUserDashboard';

type ViewState = 'landing' | 'admin' | 'events-page' | 'blog-page' | 'why-join-page' | 'landlord-page' | 'landlord-schedule' | 'apply-page' | 'partner-portal';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [view, setView] = useState<ViewState>('landing');

  // State for the curtain reveal effect
  const [footerHeight, setFooterHeight] = useState(0);
  const [isRevealActive, setIsRevealActive] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
  }, [view]);

  // Measure footer height and determine if reveal effect should be active
  useEffect(() => {
    if (view === 'admin') {
      setIsRevealActive(false);
      return;
    }

    const updateDimensions = () => {
      if (footerRef.current) {
        const height = footerRef.current.offsetHeight;
        setFooterHeight(height);
        // Only enable the sticky reveal effect on desktop AND if the footer fits in the viewport
        setIsRevealActive(window.innerWidth >= 1024 && height < window.innerHeight);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const timeout = setTimeout(updateDimensions, 100);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timeout);
    };
  }, [view]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Navigation Links logic
  const handleNavClick = (target: string) => {
    // If it's a hashtag on the home page
    if (target.startsWith('#')) {
      if (view !== 'landing') {
        setView('landing');
        // Small timeout to allow render before scroll
        setTimeout(() => {
          const el = document.querySelector(target);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // It's a 'page'
      setView(target as ViewState);
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Why Join?', target: 'why-join-page' },
    { name: 'Events', target: 'events-page' },
    { name: 'For Landlords', target: 'landlord-page' },
    { name: 'Insights', target: 'blog-page' },
    { name: 'Spaces', target: '#gallery' },
  ];

  if (view === 'partner-portal') {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      );
    }

    // We need to differentiate Admin vs Space User.
    // For now, if logged in, we show dashboard. 
    // Ideally we check a role, but let's assume if they are here they are a partner.
    // The Admin check prevents Admins from seeing this if we wanted, but it's fine for now.

    if (!user) {
      return <SpaceUserLogin onLoginSuccess={() => { }} />;
    }

    return (
      <DataProvider>
        <SpaceUserDashboard onLogout={() => setView('landing')} />
      </DataProvider>
    );
  }

  // ADMIN VIEW
  if (view === 'admin') {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Bypass login in development mode for easier access
    if (!user && !import.meta.env.DEV) {
      return <Login onLoginSuccess={() => { }} />;
    }

    return (
      <DataProvider>
        <SEOHead />
        <Admin onLogout={() => setView('landing')} />
      </DataProvider>
    );
  }

  return (
    <DataProvider>
      <SEOHead />
      <div className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white">
        {/* Navigation */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled || view !== 'landing'
            ? 'bg-white border-black/10 py-4 text-black shadow-sm'
            : 'bg-transparent border-transparent py-6 text-white'
            }`}
        >
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <button onClick={() => setView('landing')} className="z-50 relative hover:opacity-80 focus:outline-none">
              <SiteLogo scrolled={scrolled} isLanding={view === 'landing'} />
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.target)}
                  className="text-sm font-bold uppercase tracking-wide hover:underline decoration-2 underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => setView('apply-page')}
                className={`px-6 py-2 font-bold uppercase text-sm transition-colors border-2 ${scrolled || view !== 'landing'
                  ? 'bg-black text-white border-black hover:bg-neutral-800'
                  : 'bg-white text-black border-white hover:bg-neutral-200'
                  }`}
              >
                Join Us
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden z-50" onClick={toggleMenu}>
              {isMenuOpen ? <X size={32} className="text-black" /> : <Menu size={32} className={scrolled || view !== 'landing' ? "text-black" : "text-white"} />}
            </button>
          </div>

          {/* Mobile Nav Overlay */}
          {isMenuOpen && (
            <div className="fixed inset-0 bg-white text-black z-40 flex flex-col items-center justify-center space-y-8 p-8 animate-fade-in-up">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.target)}
                  className="text-4xl font-heavy uppercase hover:text-neutral-600 transition-colors"
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => {
                  setView('apply-page');
                  setIsMenuOpen(false);
                }}
                className="text-4xl font-heavy uppercase text-blue-600"
              >
                Apply Now
              </button>
            </div>
          )}
        </nav>

        {/* Main Content Wrapper */}
        <main
          className={`relative z-10 bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-300`}
          style={{ marginBottom: isRevealActive ? `${footerHeight}px` : '0px' }}
        >
          {view === 'landing' && (
            <>
              <Hero
                onScheduleClick={() => setView('landlord-schedule')}
                onJoinClick={() => setView('apply-page')}
              />
              <AllianceInfo onJoinClick={() => setView('apply-page')} />
              <Events onViewCalendar={() => handleNavClick('events-page')} />
              <Testimonials />
              <LandlordPitch onViewFullPage={() => setView('landlord-page')} />
              <FindExpertTool />
              <SuccessStories />
              <Gallery />
            </>
          )}

          {view === 'events-page' && <EventsPage />}

          {view === 'blog-page' && <BlogPage />}

          {view === 'why-join-page' && <WhyJoinPage />}

          {view === 'landlord-page' && <LandlordPage onScheduleClick={() => setView('landlord-schedule')} />}

          {view === 'landlord-schedule' && <LandlordSchedulePage />}

          {view === 'apply-page' && <ApplyPage />}

          {/* Anchor for contact link to scroll to bottom of main content */}
          <div id="contact" className="h-px w-full opacity-0"></div>
        </main>

        {/* Fixed/Sticky Bottom Section */}
        <div
          ref={footerRef}
          className={isRevealActive ? "fixed bottom-0 left-0 right-0 z-0" : "relative z-0"}
        >
          <ContactForm />

          <footer className="bg-black text-white py-12 px-6 border-t border-white/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <h2 className="text-3xl font-heavy uppercase mb-2">Denver Coworks</h2>
                <p className="text-neutral-400 max-w-xs">
                  Connecting space operators, community managers, and industry experts in the greater Denver area.
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-4">
                <div className="flex gap-6">
                  <a href="#" className="hover:text-neutral-300 font-bold uppercase text-sm">LinkedIn</a>
                  <a href="#" className="hover:text-neutral-300 font-bold uppercase text-sm">Instagram</a>
                  <a href="#" className="hover:text-neutral-300 font-bold uppercase text-sm">Twitter</a>
                </div>
                <div className="flex flex-col md:items-end gap-1 text-sm text-neutral-600">
                  <p>&copy; {new Date().getFullYear()} Denver Coworks Alliance. Est 2012. All rights reserved.</p>
                  <button onClick={() => setView('admin')} className="flex items-center hover:text-neutral-400 transition-colors mt-2">
                    <Lock className="w-3 h-3 mr-1" /> Admin Login
                  </button>
                  <button onClick={() => setView('partner-portal')} className="flex items-center hover:text-neutral-400 transition-colors mt-1">
                    Partner Portal
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </DataProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
