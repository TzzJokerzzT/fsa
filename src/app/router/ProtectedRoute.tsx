/**
 * ProtectedRoute - Wrapper component for authenticated routes
 * Redirects to login if user is not authenticated
 * Waits for auth hydration before redirecting
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useIsAuthHydrated } from '@/app/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsAuthHydrated();
  const location = useLocation();

  // Wait for auth state to be hydrated from localStorage
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * GuestRoute - Wrapper for routes only accessible when NOT authenticated
 * Redirects to home/builder if already logged in
 */
interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsAuthHydrated();
  const location = useLocation();

  // Wait for auth state to be hydrated from localStorage
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-100">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to intended destination or builder if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/builder';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
