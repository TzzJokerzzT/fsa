import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Button, Card } from '@/shared/ui';

/**
 * ErrorPage Component
 * Handles React Router errors (thrown errors and HTTP error responses)
 * Follows Single Responsibility Principle - only handles route-level errors
 */

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

interface ErrorDetails {
  title: string;
  message: string;
  statusCode?: number;
}

function getErrorDetails(error: unknown): ErrorDetails {
  // Handle React Router error responses (404, 500, etc.)
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        return {
          title: 'Page Not Found',
          message:
            "The page you're looking for doesn't exist or has been moved.",
          statusCode: 404,
        };
      case 401:
        return {
          title: 'Unauthorized',
          message: "You don't have permission to access this page.",
          statusCode: 401,
        };
      case 403:
        return {
          title: 'Forbidden',
          message: 'Access to this resource is forbidden.',
          statusCode: 403,
        };
      case 500:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          statusCode: 500,
        };
      default:
        return {
          title: 'Error',
          message: error.statusText || 'An unexpected error occurred.',
          statusCode: error.status,
        };
    }
  }

  // Handle thrown Error instances
  if (error instanceof Error) {
    return {
      title: 'Something Went Wrong',
      message:
        error.message || 'An unexpected error occurred. Please try again.',
    };
  }

  // Fallback for unknown error types
  return {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
  };
}

export default function ErrorPage() {
  const error = useRouteError();
  const { title, message, statusCode } = getErrorDetails(error);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card variant="bordered" className="text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: 'reverse',
                }}
                className="flex items-center justify-center w-20 h-20 rounded-full bg-error/10"
              >
                <AlertTriangle className="w-10 h-10 text-error" />
              </motion.div>
              {statusCode && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-error text-white text-sm font-bold"
                >
                  {statusCode}
                </motion.div>
              )}
            </div>
          </div>

          {/* Error Content */}
          <h1 className="text-2xl font-bold text-text-primary mb-2">{title}</h1>
          <p className="text-text-secondary mb-8">{message}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRefresh}
            >
              Try Again
            </Button>
            <Link to="/">
              <Button leftIcon={<Home className="w-4 h-4" />}>
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Debug info in development */}
          {/* {import.meta.env.DEV && error instanceof Error && error.stack && ( */}
          {error instanceof Error && error.stack && (
            <details className="mt-8 text-left">
              <summary className="text-sm text-text-muted cursor-pointer hover:text-text-secondary">
                Technical Details
              </summary>
              <pre className="mt-2 p-3 bg-surface-200 rounded-lg text-xs text-text-muted overflow-auto max-h-48">
                {error.stack}
              </pre>
            </details>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
