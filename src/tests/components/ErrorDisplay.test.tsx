import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorDisplay, ErrorToast } from '../../components/common/ErrorDisplay';
import { ErrorCategory, ErrorSeverity, handleError } from '../../utils/errorHandler';

describe('ErrorDisplay', () => {
  const mockOnRetry = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockError = (overrides = {}) => ({
    id: 'err_123',
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    message: 'Network error',
    userMessage: 'Unable to connect to our servers. Please check your internet connection and try again.',
    timestamp: '2024-01-01T00:00:00Z',
    retryable: true,
    ...overrides,
  });

  describe('Basic Rendering', () => {
    it('should render error message', () => {
      const error = createMockError();
      render(<ErrorDisplay error={error} />);

      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText(error.userMessage)).toBeInTheDocument();
    });

    it('should not render when error is null', () => {
      const { container } = render(<ErrorDisplay error={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render correct error category titles', () => {
      const categories = [
        { category: ErrorCategory.AUTHENTICATION, title: 'Authentication Error' },
        { category: ErrorCategory.AUTHORIZATION, title: 'Permission Error' },
        { category: ErrorCategory.VALIDATION, title: 'Validation Error' },
        { category: ErrorCategory.NETWORK, title: 'Connection Error' },
        { category: ErrorCategory.SERVER, title: 'Server Error' },
        { category: ErrorCategory.RATE_LIMIT, title: 'Rate Limit Error' },
        { category: ErrorCategory.UNKNOWN, title: 'Unexpected Error' },
      ];

      categories.forEach(({ category, title }) => {
        const error = createMockError({ category });
        const { rerender } = render(<ErrorDisplay error={error} />);
        expect(screen.getByText(title)).toBeInTheDocument();
        rerender(<ErrorDisplay error={null} />);
      });
    });
  });

  describe('Error Severity Styling', () => {
    it('should apply correct styling for critical errors', () => {
      const error = createMockError({ severity: ErrorSeverity.CRITICAL });
      render(<ErrorDisplay error={error} />);

      const container = screen.getByText('Connection Error').closest('div');
      expect(container).toHaveClass('border-red-500', 'bg-red-50', 'text-red-800');
    });

    it('should apply correct styling for high severity errors', () => {
      const error = createMockError({ severity: ErrorSeverity.HIGH });
      render(<ErrorDisplay error={error} />);

      const container = screen.getByText('Connection Error').closest('div');
      expect(container).toHaveClass('border-red-400', 'bg-red-50', 'text-red-700');
    });

    it('should apply correct styling for medium severity errors', () => {
      const error = createMockError({ severity: ErrorSeverity.MEDIUM });
      render(<ErrorDisplay error={error} />);

      const container = screen.getByText('Connection Error').closest('div');
      expect(container).toHaveClass('border-yellow-400', 'bg-yellow-50', 'text-yellow-800');
    });

    it('should apply correct styling for low severity errors', () => {
      const error = createMockError({ severity: ErrorSeverity.LOW });
      render(<ErrorDisplay error={error} />);

      const container = screen.getByText('Connection Error').closest('div');
      expect(container).toHaveClass('border-blue-400', 'bg-blue-50', 'text-blue-700');
    });
  });

  describe('Retry Functionality', () => {
    it('should show retry button for retryable errors', () => {
      const error = createMockError({ retryable: true });
      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should not show retry button for non-retryable errors', () => {
      const error = createMockError({ retryable: false });
      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const error = createMockError({ retryable: true });
      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      fireEvent.click(screen.getByText('Try Again'));
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should show loading state during retry', async () => {
      const error = createMockError({ retryable: true });
      mockOnRetry.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      fireEvent.click(screen.getByText('Try Again'));
      
      await waitFor(() => {
        expect(screen.getByText('Retrying...')).toBeInTheDocument();
      });
    });

    it('should show attempt count after retries', async () => {
      const error = createMockError({ retryable: true });
      mockOnRetry.mockRejectedValue(new Error('Still failing'));
      
      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      // First retry
      fireEvent.click(screen.getByText('Try Again'));
      await waitFor(() => {
        expect(screen.getByText('Attempt 2')).toBeInTheDocument();
      });
    });
  });

  describe('Auto-retry Functionality', () => {
    it('should show auto-retry countdown for network errors', async () => {
      const error = createMockError({ 
        category: ErrorCategory.NETWORK,
        retryable: true 
      });
      
      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      await waitFor(() => {
        expect(screen.getByText(/Auto-retrying in \d+s.../)).toBeInTheDocument();
      });
    });

    it('should allow canceling auto-retry', async () => {
      const error = createMockError({ 
        category: ErrorCategory.NETWORK,
        retryable: true 
      });
      
      render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.queryByText(/Auto-retrying/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Dismiss Functionality', () => {
    it('should show dismiss button when onDismiss is provided', () => {
      const error = createMockError();
      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      expect(screen.getByLabelText('Dismiss error')).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      const error = createMockError();
      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      fireEvent.click(screen.getByLabelText('Dismiss error'));
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Technical Details', () => {
    it('should show technical details toggle in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = createMockError({
        technicalDetails: 'Error stack trace here',
      });
      
      render(<ErrorDisplay error={error} />);

      expect(screen.getByText('Show Technical Details')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should toggle technical details visibility', () => {
      const error = createMockError({
        technicalDetails: 'Error stack trace here',
      });
      
      render(<ErrorDisplay error={error} showTechnicalDetails={true} />);

      fireEvent.click(screen.getByText('Show Technical Details'));
      expect(screen.getByText('Error stack trace here')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Hide Technical Details'));
      expect(screen.queryByText('Error stack trace here')).not.toBeInTheDocument();
    });
  });

  describe('Rate Limit Information', () => {
    it('should show rate limit reset time', () => {
      const error = createMockError({
        category: ErrorCategory.RATE_LIMIT,
        retryAfter: 300, // 5 minutes
      });
      
      render(<ErrorDisplay error={error} />);

      expect(screen.getByText('Rate limit will reset in 5 minutes')).toBeInTheDocument();
    });
  });
});

describe('ErrorToast', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render error toast', () => {
    const error = handleError('Test error');
    render(<ErrorToast error={error} onDismiss={mockOnDismiss} />);

    expect(screen.getByText(error.userMessage)).toBeInTheDocument();
  });

  it('should auto-dismiss after duration', () => {
    const error = handleError('Test error');
    render(<ErrorToast error={error} onDismiss={mockOnDismiss} duration={1000} />);

    vi.advanceTimersByTime(1000);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should not auto-dismiss when duration is 0', () => {
    const error = handleError('Test error');
    render(<ErrorToast error={error} onDismiss={mockOnDismiss} duration={0} />);

    vi.advanceTimersByTime(5000);
    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('should dismiss when close button is clicked', () => {
    const error = handleError('Test error');
    render(<ErrorToast error={error} onDismiss={mockOnDismiss} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });
});
