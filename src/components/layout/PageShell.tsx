import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import FloatingNav from './FloatingNav';

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-arcane-void text-arcane-parchment font-body overflow-x-hidden">
      <FloatingNav />
      <main className="flex-grow bg-arcane-void">
        {children}
      </main>
    </div>
  );
}
