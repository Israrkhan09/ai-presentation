import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace data-id="izg6tfr8e" data-path="src/components/AuthGuard.tsx" />;
  }

  return <>{children}</>;
};

export default AuthGuard;