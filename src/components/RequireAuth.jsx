import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loading } from './ui.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export default function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
