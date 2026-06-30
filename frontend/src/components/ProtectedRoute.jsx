import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-text-secondary font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
