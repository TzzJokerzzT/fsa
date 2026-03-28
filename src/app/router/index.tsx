import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '@/pages/layouts/AuthLayout';
import { MainLayout } from '@/pages/layouts/MainLayout';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute';

// Lazy load pages for better bundle splitting (bundle-dynamic-imports)
const HomePage = lazy(() => import('@/pages/Home'));
const BuilderPage = lazy(() => import('@/pages/Builder'));
const ComparePage = lazy(() => import('@/pages/Compare'));
const LearnPage = lazy(() => import('@/pages/Learn'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const LoginPage = lazy(() =>
  import('@/pages/Login').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/pages/Register').then((m) => ({ default: m.RegisterPage })),
);
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
  );
}

// Wrap lazy components with Suspense
function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// Wrap content with ProtectedRoute
function withProtection(element: React.ReactNode) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

// Wrap content with GuestRoute (for login/register)
function withGuestOnly(element: React.ReactNode) {
  return <GuestRoute>{element}</GuestRoute>;
}

export const router = createBrowserRouter([
  // Auth routes (guest only)
  {
    path: '/',
    element: withGuestOnly(<AuthLayout />),
    children: [
      {
        path: 'login',
        element: withSuspense(LoginPage),
      },
      {
        path: 'register',
        element: withSuspense(RegisterPage),
      },
    ],
  },
  // Protected app routes
  {
    path: '/',
    element: withProtection(<MainLayout />),
    // Error boundary for all routes under MainLayout
    errorElement: withSuspense(ErrorPage),
    children: [
      {
        index: true,
        element: withSuspense(HomePage),
      },
      {
        path: 'builder',
        element: withSuspense(BuilderPage),
      },
      {
        path: 'builder/:architectureId',
        element: withSuspense(BuilderPage),
      },
      {
        path: 'compare',
        element: withSuspense(ComparePage),
      },
      {
        path: 'learn',
        element: withSuspense(LearnPage),
      },
      {
        path: 'profile',
        element: withSuspense(ProfilePage),
      },
      // Catch-all route for 404 pages within the app
      {
        path: '*',
        element: withSuspense(NotFoundPage),
      },
    ],
  },
  // Root-level 404 for any unmatched routes
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
]);
