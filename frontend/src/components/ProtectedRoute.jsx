import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, role }) => {
  const { isAuth, user, loading } = useAuth();

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Loading...</div>;
  if (!isAuth) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  
  return children;
};
