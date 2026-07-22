import React from 'react';

interface FocusPanelProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlighted';
  className?: string;
}

const FocusPanel: React.FC<FocusPanelProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseClasses = "rounded-xl p-6 backdrop-blur-md border";
  const defaultClasses = "bg-arcane-surface/70 border-arcane-border shadow-lg";
  const highlightedClasses = "bg-arcane-elevated/80 border-arcane-cyan/30 shadow-[0_0_20px_rgba(77,208,225,0.1)]";

  return (
    <div className={`${baseClasses} ${variant === 'highlighted' ? highlightedClasses : defaultClasses} ${className}`}>
      {children}
    </div>
  );
};

export default FocusPanel;
