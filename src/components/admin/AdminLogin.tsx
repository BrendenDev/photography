import { useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function AdminLogin() {
  const [pat, setPat] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pat.trim()) return;
    
    setLoading(true);
    setError('');
    
    const success = await login(pat);
    if (!success) {
      setError('Invalid PAT or network error.');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="admin-panel p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center" style={{color: 'var(--admin-text-accent)'}}>Admin Login</h1>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 text-sm" style={{color: 'var(--admin-text-secondary)'}}>
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              className="admin-input w-full"
              placeholder="ghp_..."
            />
          </div>
          
          {error && <div className="admin-text-danger text-sm">{error}</div>}
          
          <button
            type="submit"
            disabled={loading || !pat.trim()}
            className="admin-btn admin-btn-primary w-full disabled:opacity-50 mt-4"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </form>
        
        <p className="mt-6 text-xs text-center" style={{color: 'var(--admin-text-secondary)'}}>
          Tokens are stored in memory only and will be lost on page reload.
          Make sure your PAT has repo scope access.
        </p>
      </div>
    </div>
  );
}
