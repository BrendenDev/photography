import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { path: '/', label: 'Library', icon: 'M3 6h18M3 12h18M3 18h18' },
  { path: '/about', label: 'Notes', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
];

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="fixed top-5 right-5 z-40">
      {/* Toggle button — arcane sigil */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 flex items-center justify-center rounded-full bg-arcane-void/80 backdrop-blur-md border border-arcane-border/40 hover:border-arcane-cyan/40 transition-colors shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Navigation menu"
      >
        {/* Sigil SVG */}
        <svg width="18" height="18" viewBox="0 0 18 18" className="text-arcane-cyan/70">
          <motion.circle
            cx="9" cy="9" r="7"
            fill="none" stroke="currentColor" strokeWidth="0.8"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.g animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
            <line x1="9" y1="4" x2="9" y2="14" stroke="currentColor" strokeWidth="0.8" />
            <line x1="4" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth="0.8" />
          </motion.g>
          <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.5" />
        </svg>
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-0 w-44 bg-arcane-void/90 backdrop-blur-md border border-arcane-border/40 rounded-lg shadow-2xl overflow-hidden"
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-arcane-cyan/10 text-arcane-cyan'
                      : 'text-arcane-parchment-dim hover:bg-white/5 hover:text-arcane-parchment'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  <span className="font-heading text-[11px] tracking-[0.2em] uppercase">{item.label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
