import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Follows Single Responsibility Principle - only handles React rendering errors
 * Open/Closed Principle - extensible via props for custom fallback UI
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI to render when an error occurs */
  fallback?: ReactNode;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details (useful for development) */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRefresh = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const showDetails = this.props.showDetails ?? import.meta.env.DEV;

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card variant="bordered" className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-error/10">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Something went wrong
            </h2>
            <p className="text-text-secondary mb-6">
              An unexpected error occurred while rendering this component.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={this.handleRefresh}
              >
                Refresh Page
              </Button>
            </div>

            {/* Error Details (Development) */}
            {showDetails && error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-text-muted cursor-pointer hover:text-text-secondary">
                  Error Details
                </summary>
                <div className="mt-2 space-y-2">
                  <div className="p-3 bg-surface-200 rounded-lg">
                    <div className="text-xs text-text-muted mb-1">
                      Error Message:
                    </div>
                    <code className="text-sm text-error break-all">
                      {error.message}
                    </code>
                  </div>
                  {error.stack && (
                    <pre className="p-3 bg-surface-200 rounded-lg text-xs text-text-muted overflow-auto max-h-48">
                      {error.stack}
                    </pre>
                  )}
                  {errorInfo?.componentStack && (
                    <div className="p-3 bg-surface-200 rounded-lg">
                      <div className="text-xs text-text-muted mb-1">
                        Component Stack:
                      </div>
                      <pre className="text-xs text-text-muted overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
