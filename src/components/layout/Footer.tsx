export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-arcane-border py-8 text-center bg-arcane-void">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-arcane-amber to-transparent"></div>
          <span className="mx-4 text-arcane-amber text-xl">✧</span>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-arcane-amber to-transparent"></div>
        </div>

        <p className="text-sm text-arcane-muted">
          &copy; {currentYear} Brenden's Archive. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
