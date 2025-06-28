import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import {
  initializeSecurity,
  CSRFProtection,
  ClientRateLimit,
  validateBrief,
  validateFileUpload,
  secureApiRequest,
  logSecurityEvent,
} from '../../utils/security';
import {
  initializeAccessibility,
  auditAccessibility,
  accessibilityHelpers,
  KeyboardNavigation,
} from '../../utils/accessibility';

/**
 * Security & Accessibility Context
 */
interface SecurityContextType {
  // CSRF Protection
  getCSRFToken: () => string | null;
  validateCSRFToken: (token: string) => boolean;

  // Input Validation
  validateBrief: (brief: string) => { valid: boolean; errors: string[] };
  validateFileUpload: (file: File) => { valid: boolean; errors: string[] };

  // Rate Limiting
  checkRateLimit: () => { allowed: boolean; remaining: number; resetTime: number };

  // Secure API Requests
  secureRequest: (url: string, options?: RequestInit) => Promise<Response>;

  // Security Logging
  logSecurityEvent: (
    event: string,
    details?: any,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ) => void;

  // Accessibility Features
  auditAccessibility: (container?: Element) => any[];
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  generateAccessibilityReport: (container?: Element) => any;

  // Status
  isSecurityInitialized: boolean;
  isAccessibilityInitialized: boolean;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

/**
 * Security Provider Component
 *
 * Provides comprehensive client-side security features:
 * - CSRF protection
 * - Input validation and sanitization
 * - Rate limiting
 * - Secure API request handling
 * - Security event logging
 *
 * This complements the server-side security implemented in Netlify Functions.
 */
interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isSecurityInitialized, setIsSecurityInitialized] = React.useState(false);
  const [isAccessibilityInitialized, setIsAccessibilityInitialized] = React.useState(false);

  useEffect(() => {
    // Initialize security features
    try {
      initializeSecurity();
      setIsSecurityInitialized(true);

      logSecurityEvent(
        'security_provider_initialized',
        {
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        },
        'low'
      );
    } catch (error) {
      console.error('Failed to initialize security:', error);
      logSecurityEvent(
        'security_initialization_failed',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'critical'
      );
    }

    // Initialize accessibility features
    try {
      initializeAccessibility();
      setIsAccessibilityInitialized(true);

      logSecurityEvent(
        'accessibility_initialized',
        {
          timestamp: Date.now(),
        },
        'low'
      );
    } catch (error) {
      console.error('Failed to initialize accessibility:', error);
      logSecurityEvent(
        'accessibility_initialization_failed',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'critical'
      );
    }

    // Cleanup on unmount
    return () => {
      CSRFProtection.clearToken();
      ClientRateLimit.reset();
    };
  }, []);

  // Security & Accessibility context value
  const securityContextValue: SecurityContextType = {
    // CSRF Protection
    getCSRFToken: () => CSRFProtection.getToken(),
    validateCSRFToken: (token: string) => CSRFProtection.validateToken(token),

    // Input Validation
    validateBrief,
    validateFileUpload,

    // Rate Limiting
    checkRateLimit: () => ClientRateLimit.checkLimit(),

    // Secure API Requests
    secureRequest: secureApiRequest,

    // Security Logging
    logSecurityEvent,

    // Accessibility Features
    auditAccessibility,
    announceToScreenReader: KeyboardNavigation.announceToScreenReader,
    generateAccessibilityReport: accessibilityHelpers.generateReport,

    // Status
    isSecurityInitialized,
    isAccessibilityInitialized,
  };

  return (
    <SecurityContext.Provider value={securityContextValue}>{children}</SecurityContext.Provider>
  );
};

/**
 * Hook to use security context
 */
export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

/**
 * Higher-order component for secure API requests
 */
export const withSecureAPI = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    const security = useSecurity();

    // Add security methods to props
    const secureProps = {
      ...props,
      secureRequest: security.secureRequest,
      validateInput: security.validateBrief,
      logSecurityEvent: security.logSecurityEvent,
    } as P;

    return <Component {...secureProps} />;
  };
};

/**
 * Security Guard Component
 * Prevents rendering children until security is initialized
 */
interface SecurityGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SecurityGuard: React.FC<SecurityGuardProps> = ({
  children,
  fallback = <div>Initializing security...</div>,
}) => {
  const { isSecurityInitialized } = useSecurity();

  if (!isSecurityInitialized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Secure Input Component
 * Automatically validates and sanitizes input
 */
interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValidatedChange?: (value: string, isValid: boolean, errors: string[]) => void;
  validationType?: 'brief' | 'general';
}

export const SecureInput: React.FC<SecureInputProps> = ({
  onValidatedChange,
  validationType = 'general',
  onChange,
  ...props
}) => {
  const { validateBrief, logSecurityEvent } = useSecurity();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Validate based on type
    let validation = { valid: true, errors: [] as string[] };

    if (validationType === 'brief') {
      validation = validateBrief(value);
    }

    // Log security events for invalid input
    if (!validation.valid) {
      logSecurityEvent(
        'invalid_input_detected',
        {
          type: validationType,
          errors: validation.errors,
          inputLength: value.length,
        },
        'medium'
      );
    }

    // Call validation callback
    onValidatedChange?.(value, validation.valid, validation.errors);

    // Call original onChange
    onChange?.(event);
  };

  return <input {...props} onChange={handleChange} />;
};

/**
 * Secure File Upload Component
 */
interface SecureFileUploadProps {
  onFileValidated?: (file: File, isValid: boolean, errors: string[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onFileValidated,
  accept,
  multiple = false,
  className,
}) => {
  const { validateFileUpload, logSecurityEvent } = useSecurity();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const validation = validateFileUpload(file);

      // Log security events for invalid files
      if (!validation.valid) {
        logSecurityEvent(
          'invalid_file_upload_attempt',
          {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            errors: validation.errors,
          },
          'high'
        );
      }

      onFileValidated?.(file, validation.valid, validation.errors);
    });
  };

  return (
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      className={className}
      onChange={handleFileChange}
    />
  );
};

export default SecurityProvider;
