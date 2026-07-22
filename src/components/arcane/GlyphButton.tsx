import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface GlyphButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  className?: string;
  href?: string;
}

const GlyphButton: React.FC<GlyphButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  className = '',
  href,
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center px-6 py-2.5 font-heading text-sm tracking-widest transition-all duration-300';
  
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-gradient-to-r from-arcane-brass to-arcane-amber text-arcane-ink font-semibold rounded shadow-[0_0_15px_rgba(232,181,77,0.3)] hover:shadow-[0_0_25px_rgba(232,181,77,0.5)]';
      break;
    case 'secondary':
      variantClasses = 'border border-arcane-cyan text-arcane-cyan bg-transparent hover:bg-arcane-glow-blue rounded hover:shadow-[0_0_15px_rgba(77,208,225,0.3)]';
      break;
    case 'ghost':
      variantClasses = 'text-arcane-parchment-dim hover:text-arcane-cyan hover:bg-arcane-glow-blue/50 rounded-sm';
      break;
  }

  const inner = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return <Link to={href} className="inline-block outline-none">{inner}</Link>;
  }

  return <button className="inline-block outline-none" onClick={onClick}>{inner}</button>;
};

export default GlyphButton;
