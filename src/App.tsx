import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { PageShell } from './components/layout/PageShell';
import PageTransition from './components/ui/PageTransition';
import SpellCircle from './components/arcane/SpellCircle';

// Eager-load the home page (critical path)
import HomePage from './pages/HomePage';

// Lazy-load secondary pages (code-split)
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

/** Themed loading fallback */
function LoadingFallback() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
      <SpellCircle size={50} glowColor="cyan" animate={true} />
      <p className="mt-4 font-heading text-xs text-arcane-muted animate-pulse tracking-[0.2em]">
        Loading...
      </p>
    </div>
  );
}

/** Inner component that uses useLocation (must be inside Router) */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingFallback />} key={location.pathname}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PageTransition><HomePage /></PageTransition>
          } />
          <Route path="/library" element={
            <PageTransition><LibraryPage /></PageTransition>
          } />
          <Route path="/collection/:slug" element={
            <PageTransition><CollectionPage /></PageTransition>
          } />
          <Route path="/about" element={
            <PageTransition><AboutPage /></PageTransition>
          } />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  // Admin route bypasses PageShell
  if (location.pathname.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#1e1e1e] text-white">Loading Admin...</div>}>
        <Routes>
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </Suspense>
    );
  }
  return (
    <PageShell>
      <AnimatedRoutes />
    </PageShell>
  );
}

function App() {
  return (
    <Router basename="/photography">
      <AppContent />
    </Router>
  );
}

export default App;
