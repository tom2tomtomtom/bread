import React, { useState, useEffect } from 'react';
import { EnhancedError, ErrorCategory, ErrorSeverity, getErrorMessage, shouldRetry, getRetryDelay } from '../../utils/errorHandler';

interface ErrorDisplayProps {
  error: EnhancedError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showTechnicalDetails?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showTechnicalDetails = false,
  className = '',
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [autoRetryCountdown, setAutoRetryCountdown] = useState<number | null>(null);

  // Auto-retry logic for retryable errors
  useEffect(() => {
    if (!error || !onRetry || !shouldRetry(error, retryCount)) {
      return undefined;
    }

    // Only auto-retry network errors
    if (error.category === ErrorCategory.NETWORK && retryCount < 2) {
      const delay = getRetryDelay(retryCount);
      const countdownInterval = setInterval(() => {
        setAutoRetryCountdown(prev => {
          if (prev === null) return Math.ceil(delay / 1000);
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleRetry(true);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
    return undefined;
  }, [error, retryCount, onRetry]);

  const handleRetry = async (isAutoRetry = false) => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    setAutoRetryCountdown(null);
    
    try {
      await onRetry();
      setRetryCount(0); // Reset on successful retry
    } catch (retryError) {
      if (!isAutoRetry) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDismiss = () => {
    setRetryCount(0);
    setAutoRetryCountdown(null);
    onDismiss?.();
  };

  if (!error) return null;

  const getErrorIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return '🚨';
      case ErrorSeverity.HIGH:
        return '❌';
      case ErrorSeverity.MEDIUM:
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getErrorColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'border-red-500 bg-red-50 text-red-800';
      case ErrorSeverity.HIGH:
        return 'border-red-400 bg-red-50 text-red-700';
      case ErrorSeverity.MEDIUM:
        return 'border-yellow-400 bg-yellow-50 text-yellow-800';
      default:
        return 'border-blue-400 bg-blue-50 text-blue-700';
    }
  };

  const canRetry = error.retryable && onRetry && shouldRetry(error, retryCount);
  const showAutoRetry = autoRetryCountdown !== null;

  return (
    <div className={`rounded-lg border-2 p-4 ${getErrorColor()} ${className}`}>
      <div className="flex items-start space-x-3">
        <span className="text-2xl flex-shrink-0">{getErrorIcon()}</span>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">
              {error.category === ErrorCategory.AUTHENTICATION && 'Authentication Error'}
              {error.category === ErrorCategory.AUTHORIZATION && 'Permission Error'}
              {error.category === ErrorCategory.VALIDATION && 'Validation Error'}
              {error.category === ErrorCategory.NETWORK && 'Connection Error'}
              {error.category === ErrorCategory.SERVER && 'Server Error'}
              {error.category === ErrorCategory.RATE_LIMIT && 'Rate Limit Error'}
              {error.category === ErrorCategory.UNKNOWN && 'Unexpected Error'}
            </h3>
            
            {onDismiss && (
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <p className="text-sm mb-3">{getErrorMessage(error)}</p>
          
          {/* Retry Section */}
          {(canRetry || showAutoRetry) && (
            <div className="flex items-center space-x-3 mb-3">
              {showAutoRetry ? (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  <span>Auto-retrying in {autoRetryCountdown}s...</span>
                  <button
                    onClick={() => setAutoRetryCountdown(null)}
                    className="text-xs underline hover:no-underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : canRetry ? (
                <button
                  onClick={() => handleRetry()}
                  disabled={isRetrying}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-white/50 hover:bg-white/70 border border-current rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRetrying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      <span>Retrying...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Try Again</span>
                    </>
                  )}
                </button>
              ) : null}
              
              {retryCount > 0 && (
                <span className="text-xs opacity-75">
                  Attempt {retryCount + 1}
                </span>
              )}
            </div>
          )}
          
          {/* Technical Details */}
          {(showTechnicalDetails || process.env.NODE_ENV === 'development') && error.technicalDetails && (
            <div className="mt-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs underline hover:no-underline mb-2"
              >
                {showDetails ? 'Hide' : 'Show'} Technical Details
              </button>
              
              {showDetails && (
                <div className="bg-black/10 rounded p-2 text-xs font-mono overflow-auto max-h-32">
                  <div className="mb-1"><strong>Error ID:</strong> {error.id}</div>
                  <div className="mb-1"><strong>Timestamp:</strong> {error.timestamp}</div>
                  {error.requestId && <div className="mb-1"><strong>Request ID:</strong> {error.requestId}</div>}
                  <div className="mb-1"><strong>Category:</strong> {error.category}</div>
                  <div className="mb-1"><strong>Severity:</strong> {error.severity}</div>
                  <div className="mb-1"><strong>Message:</strong> {error.message}</div>
                  {error.technicalDetails && (
                    <div>
                      <strong>Details:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{error.technicalDetails}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Rate Limit Info */}
          {error.retryAfter && (
            <div className="mt-2 text-xs opacity-75">
              Rate limit will reset in {Math.ceil(error.retryAfter / 60)} minutes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simplified error toast for quick notifications
export const ErrorToast: React.FC<{
  error: EnhancedError;
  onDismiss: () => void;
  duration?: number;
}> = ({ error, onDismiss, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, onDismiss]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`rounded-lg border-2 p-3 shadow-lg ${
        error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL
          ? 'border-red-400 bg-red-50 text-red-800'
          : 'border-yellow-400 bg-yellow-50 text-yellow-800'
      }`}>
        <div className="flex items-start space-x-2">
          <span className="text-lg flex-shrink-0">
            {error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL ? '❌' : '⚠️'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{getErrorMessage(error)}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
