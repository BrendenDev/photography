import React from 'react';

interface SigilIconProps {
  name: 'nature' | 'urban' | 'light' | 'mist' | 'night' | 'search' | 'filter' | 'collection' | 'photo' | 'star';
  size?: number;
  className?: string;
}

const SigilIcon: React.FC<SigilIconProps> = ({ name, size = 20, className = '' }) => {
  const renderPath = () => {
    switch (name) {
      case 'nature':
        return <path d="M12 2L4 20h16L12 2zm0 6l4 10H8l4-10z" fill="currentColor" />;
      case 'urban':
        return <path d="M4 22V8h6V2h10v20H4zm2-2h4v-6H6v6zm6 0h6V4h-6v16z" fill="currentColor" />;
      case 'light':
        return <path d="M12 2v4m0 12v4M4 12H0m24 12h-4m-3.5-9.5l2.8 2.8M6.7 6.7L9.5 9.5m10 5l2.8-2.8M6.7 17.3l2.8-2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />;
      case 'mist':
        return <path d="M4 8h16M2 12h20M6 16h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2" />;
      case 'night':
        return <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />;
      case 'search':
        return (
          <>
            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="16.65" y1="16.65" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'filter':
        return <path d="M3 4l8 10v6l2 2v-8l8-10H3z" fill="currentColor" />;
      case 'collection':
        return <path d="M4 6h16v12H4zm2-4h12v2H6z" fill="none" stroke="currentColor" strokeWidth="2" />;
      case 'photo':
        return (
          <>
            <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </>
        );
      case 'star':
        return <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" fill="currentColor" />;
      default:
        return <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />;
    }
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      {renderPath()}
    </svg>
  );
};

export default SigilIcon;
