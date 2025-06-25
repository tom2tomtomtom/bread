import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Error Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                {/* Error Icon */}
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>

                {/* Error Title */}
                <h2 className="text-2xl font-bold text-white mb-2">
                  Oops! Something went wrong
                </h2>

                {/* Error Description */}
                <p className="text-gray-300 mb-6">
                  Don't worry - this happens sometimes during creative generation. 
                  Your work is safe and we can get you back on track.
                </p>

                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-black/20 rounded-lg p-4 mb-6 text-left">
                    <h3 className="text-sm font-bold text-red-300 mb-2">Error Details:</h3>
                    <p className="text-xs text-red-200 font-mono break-all">
                      {this.state.error.message}
                    </p>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer">Stack Trace</summary>
                        <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-400/30 hover:scale-105"
                  >
                    🔄 Try Again
                  </button>
                  <button
                    onClick={this.handleReload}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
                  >
                    🔃 Reload Page
                  </button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-gray-400 mt-4">
                  If this keeps happening, try refreshing the page or check your internet connection.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Functional component wrapper for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Specific error boundary for generation processes
export const GenerationErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleGenerationError = (error: Error, errorInfo: ErrorInfo) => {
    // Log generation-specific errors
    console.error('Generation Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
    
    // Could send to analytics service here
    // AnalyticsService.trackError('generation_error', error.message);
  };

  const fallback = (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 m-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-red-300">Generation Failed</h3>
      </div>
      <p className="text-red-200 mb-4">
        There was an issue generating your creative content. This could be due to API limits, 
        network issues, or temporary service problems.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 px-4 py-2 rounded-lg font-bold transition-all duration-300"
      >
        🔄 Try Again
      </button>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleGenerationError}>
      {children}
    </ErrorBoundary>
  );
};
