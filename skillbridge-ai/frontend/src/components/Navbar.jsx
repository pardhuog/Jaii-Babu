import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, FileText,
  TrendingUp, MessageSquare, User, Menu, X, Globe
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { clsx } from 'clsx';
import Logo from './Logo';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs',      icon: Briefcase,       label: 'Job Match' },
  { to: '/resume',    icon: FileText,         label: 'Resume' },
  { to: '/skills',    icon: TrendingUp,       label: 'Skill Gap' },
  { to: '/interview', icon: MessageSquare,    label: 'Interview' },
  { to: '/profile',   icon: User,             label: 'Profile' },
];

export default function Navbar() {
  const location = useLocation();
  const { state, dispatch } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Scroll detection for blur effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sliding indicator position
  useEffect(() => {
    const activeRef = itemRefs.current[location.pathname];
    if (activeRef) {
      const { offsetLeft, offsetWidth } = activeRef;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [location.pathname]);

  const toggleLang = () =>
    dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'en' ? 'hi' : 'en' });

  const activeIndex = NAV_ITEMS.findIndex(n => n.to === location.pathname);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-g-border transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(255,255,255,0.85)'
          : 'rgba(255,255,255,0.95)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled
          ? '0 1px 12px rgba(60,64,67,0.12)'
          : '0 1px 3px rgba(60,64,67,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <Logo size="sm" showWordmark={true} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 relative" style={{ position: 'relative' }}>
          {/* Sketch hand-drawn sliding indicator */}
          {activeIndex !== -1 && (
            <motion.div
              style={{
                position: 'absolute',
                bottom: -1,
                height: 3,
                borderRadius: '3px 3px 0 0',
                overflow: 'visible',
              }}
              animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            >
              <svg
                width="100%"
                height="8"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                style={{ overflow: 'visible' }}
              >
                <path
                  d="M0,5 Q25,1 50,5 Q75,9 100,4"
                  stroke="#1A73E8"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          )}

          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                ref={el => (itemRefs.current[to] = el)}
                className={clsx(
                  'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'text-g-blue-500 bg-g-blue-50'
                    : 'text-g-text-2 hover:text-g-text hover:bg-g-bg'
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-g-border text-sm text-g-text-2 hover:border-g-blue-500 hover:text-g-blue-500 hover:bg-g-blue-50 transition-all"
          >
            <Globe size={14} />
            {state.language === 'en' ? 'EN' : 'हि'}
          </button>

          {/* Avatar */}
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-google-blue flex items-center justify-center text-white text-xs font-bold hover:shadow-blue-glow transition-shadow"
          >
            {state.profile?.name?.[0] || 'U'}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-g-text-2 hover:text-g-text rounded-lg hover:bg-g-bg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-g-border bg-g-surface px-4 py-2 flex flex-col gap-1 overflow-hidden"
          >
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  location.pathname === to
                    ? 'bg-g-blue-50 text-g-blue-500'
                    : 'text-g-text-2 hover:text-g-text hover:bg-g-bg'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
