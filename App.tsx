
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
import SpacesPage from './components/SpacesPage';
import SpaceDetailPage from './components/SpaceDetailPage';
import BlogPostPage from './components/BlogPostPage';
import { DataProvider } from './components/DataContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import SEOHead from './components/SEOHead';
import SiteLogo from './components/SiteLogo';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

import SpaceUserLogin from './components/SpaceUserLogin';
import SpaceUserDashboard from './components/SpaceUserDashboard';

type ViewState = 'landing' | 'admin' | 'events-page' | 'blog-page' | 'why-join-page' | 'landlord-page' | 'landlord-schedule' | 'apply-page' | 'partner-portal';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  // Reset scroll when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Measure footer height and determine if reveal effect should be active
  useEffect(() => {
    if (location.pathname === '/admin') {
      setIsRevealActive(false);
      return;
    }

    const updateDimensions = () => {
      if (footerRef.current) {
        const height = footerRef.current.offsetHeight;
        setFooterHeight(height);
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
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (target: string) => {
    if (target.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.querySelector(target);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(target);
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Spaces', target: '/spaces' },
    { name: 'Why Join?', target: '/why-join' },
    { name: 'Events', target: '/events' },
    { name: 'For Landlords', target: '/landlord' },
    { name: 'Insights', target: '/insights' },
  ];

  const isLanding = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/partner');

  // Helper for SEO Mapping
  const getPageId = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/events') return 'events-page';
    if (path === '/insights') return 'blog-page';
    if (path.startsWith('/insights/')) return 'blog-post';
    if (path === '/why-join') return 'why-join-page';
    if (path === '/landlord') return 'landlord-page';
    if (path === '/landlord/schedule') return 'landlord-schedule';
    if (path === '/join') return 'apply-page';
    if (path === '/spaces') return 'spaces-page';
    if (path.startsWith('/spaces/')) return 'space-detail';
    return 'home';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Handle Admin Auth specifically if needed, but Routes will handle components

  return (
    <DataProvider>
      <SEOHead pageId={getPageId()} />
      <div className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white">
        {/* Navigation */}
        {!isDashboard && (
          <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled || !isLanding
              ? 'bg-white border-black/10 py-4 text-black shadow-sm'
              : 'bg-transparent border-transparent py-6 text-white'
              }`}
          >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
              <button onClick={() => navigate('/')} className="z-50 relative hover:opacity-80 focus:outline-none text-left">
                <SiteLogo scrolled={scrolled} isLanding={isLanding} />
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
                  onClick={() => navigate('/join')}
                  className={`px-6 py-2 font-bold uppercase text-sm transition-colors border-2 ${scrolled || !isLanding
                    ? 'bg-black text-white border-black hover:bg-neutral-800'
                    : 'bg-white text-black border-white hover:bg-neutral-200'
                    }`}
                >
                  Join Us
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden z-50" onClick={toggleMenu}>
                {isMenuOpen ? <X size={32} className="text-black" /> : <Menu size={32} className={scrolled || !isLanding ? "text-black" : "text-white"} />}
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
                    navigate('/join');
                    setIsMenuOpen(false);
                  }}
                  className="text-4xl font-heavy uppercase text-blue-600"
                >
                  Apply Now
                </button>
              </div>
            )}
          </nav>
        )}

        {/* Routes Area */}
        <Routes>
          {/* Admin Route */}
          <Route path="/admin" element={
            (!user && !import.meta.env.DEV) ? <Login onLoginSuccess={() => { }} /> : <Admin onLogout={() => navigate('/')} />
          } />

          {/* Partner Portal */}
          <Route path="/partner" element={
            !user ? <SpaceUserLogin onLoginSuccess={() => { }} /> : <SpaceUserDashboard onLogout={() => navigate('/')} />
          } />

          {/* Public Website Layout Wrapping Main Area */}
          <Route path="*" element={
            <>
              <main
                className={`relative z-10 bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-300`}
                style={{ marginBottom: isRevealActive ? `${footerHeight}px` : '0px' }}
              >
                <Routes>
                  <Route path="/" element={
                    <>
                      <Hero
                        onScheduleClick={() => navigate('/landlord/schedule')}
                        onJoinClick={() => navigate('/join')}
                      />
                      <AllianceInfo onJoinClick={() => navigate('/join')} />
                      <Events onViewCalendar={() => navigate('/events')} />
                      <Testimonials />
                      <LandlordPitch onViewFullPage={() => navigate('/landlord')} />
                      <FindExpertTool />
                      <SuccessStories />
                      <Gallery />
                    </>
                  } />

                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/insights" element={<BlogPage />} />
                  <Route path="/insights/:id" element={<BlogPostPage />} />
                  <Route path="/why-join" element={<WhyJoinPage />} />
                  <Route path="/landlord" element={<LandlordPage onScheduleClick={() => navigate('/landlord/schedule')} />} />
                  <Route path="/landlord/schedule" element={<LandlordSchedulePage />} />
                  <Route path="/join" element={<ApplyPage />} />
                  <Route path="/spaces" element={<SpacesPage />} />
                  <Route path="/spaces/:id" element={<SpaceDetailPage />} />

                  {/* Catch-all to redirect to home if route not found */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                <div id="contact" className="h-px w-full opacity-0"></div>
              </main>

              {/* Shared Footer/Contact */}
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
                        <button onClick={() => navigate('/admin')} className="flex items-center hover:text-neutral-400 transition-colors mt-2 uppercase text-xs font-bold">
                          <Lock className="w-3 h-3 mr-1" /> Admin Login
                        </button>
                        <button onClick={() => navigate('/partner')} className="flex items-center hover:text-neutral-400 transition-colors mt-1 uppercase text-xs font-bold">
                          Partner Portal
                        </button>
                      </div>
                    </div>
                  </div>
                </footer>
              </div>
            </>
          } />
        </Routes>
      </div>
    </DataProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
