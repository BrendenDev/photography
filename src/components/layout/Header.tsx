import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-heading text-sm tracking-[0.2em] uppercase transition-all duration-300 py-2 px-1 border-b-2 ${
    isActive 
      ? 'text-arcane-cyan border-arcane-cyan drop-shadow-[0_0_8px_rgba(77,208,225,0.6)]' 
      : 'text-arcane-parchment-dim border-transparent hover:text-arcane-parchment hover:border-arcane-amber/50'
  }`;

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-arcane-border/50 bg-arcane-void/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/" className="flex items-center gap-3 group">
            {/* Small sigil icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" className="text-arcane-amber opacity-80 group-hover:opacity-100 transition-opacity">
              <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
              <circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="3" fill="currentColor" opacity="0.8" />
              <line x1="14" y1="2" x2="14" y2="6" stroke="currentColor" strokeWidth="1" />
              <line x1="14" y1="22" x2="14" y2="26" stroke="currentColor" strokeWidth="1" />
              <line x1="2" y1="14" x2="6" y2="14" stroke="currentColor" strokeWidth="1" />
              <line x1="22" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="1" />
            </svg>
            <span className="font-heading text-lg text-arcane-parchment tracking-[0.15em] group-hover:text-arcane-amber-glow transition-colors duration-300">
              Archive
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/library" className={navLinkClass}>Library</NavLink>
            <NavLink to="/cast" className={navLinkClass}>Cast</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
          </nav>

          {/* Mobile hamburger */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-arcane-parchment-dim hover:text-arcane-parchment p-2"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-arcane-deep/95 backdrop-blur-md border-t border-arcane-border/50">
          <div className="px-6 py-4 flex flex-col gap-1">
            <NavLink to="/" end onClick={() => setIsOpen(false)} className={({isActive}) => `block px-3 py-3 font-heading text-sm tracking-[0.15em] uppercase rounded ${isActive ? 'text-arcane-cyan bg-arcane-surface' : 'text-arcane-parchment-dim'}`}>Home</NavLink>
            <NavLink to="/library" onClick={() => setIsOpen(false)} className={({isActive}) => `block px-3 py-3 font-heading text-sm tracking-[0.15em] uppercase rounded ${isActive ? 'text-arcane-cyan bg-arcane-surface' : 'text-arcane-parchment-dim'}`}>Library</NavLink>
            <NavLink to="/cast" onClick={() => setIsOpen(false)} className={({isActive}) => `block px-3 py-3 font-heading text-sm tracking-[0.15em] uppercase rounded ${isActive ? 'text-arcane-cyan bg-arcane-surface' : 'text-arcane-parchment-dim'}`}>Cast</NavLink>
            <NavLink to="/about" onClick={() => setIsOpen(false)} className={({isActive}) => `block px-3 py-3 font-heading text-sm tracking-[0.15em] uppercase rounded ${isActive ? 'text-arcane-cyan bg-arcane-surface' : 'text-arcane-parchment-dim'}`}>About</NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
