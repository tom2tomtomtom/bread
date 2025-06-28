import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleError, EnhancedError } from '../../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: EnhancedError, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: EnhancedError | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced Error Boundary with proper error handling and user-friendly fallbacks
 * Prevents app crashes and provides graceful error recovery
 */
export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: handleError(error, { source: 'ErrorBoundary' }),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced error handling
    const enhancedError = handleError(error, {
      source: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    this.setState({
      error: enhancedError,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(enhancedError, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Enhanced Error:', enhancedError);
      console.groupEnd();
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(enhancedError, errorInfo);
    }
  }

  private async logErrorToService(error: EnhancedError, errorInfo: ErrorInfo) {
    try {
      // Send error to monitoring service (e.g., Sentry, LogRocket, etc.)
      await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error,
          errorInfo,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (logError) {
      console.error('Failed to log error to service:', logError);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>

            {/* Error Message */}
            <p className="text-gray-300 mb-6">
              {this.state.error?.userMessage || 'An unexpected error occurred. Please try again.'}
            </p>

            {/* Error ID for support */}
            {this.state.error?.id && (
              <p className="text-xs text-gray-400 mb-6 font-mono">
                Error ID: {this.state.error.id}
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Reload Page
              </button>
            </div>

            {/* Technical Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  Technical Details
                </summary>
                <div className="mt-3 p-3 bg-black/20 rounded-lg text-xs text-gray-300 font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Category:</strong> {this.state.error.category}
                  </div>
                  <div className="mb-2">
                    <strong>Severity:</strong> {this.state.error.severity}
                  </div>
                  {this.state.error.technicalDetails && (
                    <div className="mb-2">
                      <strong>Details:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.error.technicalDetails}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support Contact */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-400">
                If this problem persists, please contact support with the error ID above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: EnhancedError, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <AppErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </AppErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<EnhancedError | null>(null);

  const handleError = React.useCallback((error: Error | string, context?: any) => {
    const enhancedError = handleError(error, context);
    setError(enhancedError);

    // Throw error to be caught by error boundary
    throw enhancedError;
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

export default AppErrorBoundary;
