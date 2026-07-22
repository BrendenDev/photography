import { AdminAuthProvider, useAdminAuth } from '../contexts/AdminAuthContext';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import '../components/admin/admin.css';

function AdminContent() {
  const { isAuthenticated } = useAdminAuth();
  
  return isAuthenticated ? <AdminDashboard /> : <AdminLogin />;
}

export default function AdminPage() {
  return (
    <AdminAuthProvider>
      <div className="admin-root min-h-screen">
        <AdminContent />
      </div>
    </AdminAuthProvider>
  );
}
