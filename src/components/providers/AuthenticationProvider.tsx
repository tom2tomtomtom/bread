import React, { useEffect, useState, ReactNode } from 'react';
import { AuthModal } from '../auth';
import { useAuthStore } from '../../stores/authStore';

interface AuthenticationProviderProps {
  children: ReactNode;
}

/**
 * AuthenticationProvider - Handles all authentication-related logic and UI
 * Responsibilities:
 * - Authentication state management
 * - Auth modal display and control
 * - User session validation
 * - Authentication event handlers
 */
export const AuthenticationProvider: React.FC<AuthenticationProviderProps> = ({ children }) => {
  // Authentication state
  const { isAuthenticated, user, getCurrentUser } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Check authentication on app load
  useEffect(() => {
    if (isAuthenticated && user) {
      getCurrentUser().catch(() => {
        // If getCurrentUser fails, user will be logged out automatically
      });
    }
  }, [isAuthenticated, user, getCurrentUser]);

  // Authentication handlers
  const handleShowLogin = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const handleShowRegister = () => {
    setAuthModalMode('register');
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  // Create authentication context value
  const authContextValue = {
    isAuthenticated,
    user,
    showAuthModal,
    authModalMode,
    handleShowLogin,
    handleShowRegister,
    handleCloseAuthModal,
  };

  return (
    <>
      {/* Pass authentication handlers to children via React.cloneElement */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...authContextValue,
          } as any);
        }
        return child;
      })}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        initialMode={authModalMode}
      />
    </>
  );
};

// Hook for accessing authentication context in child components
export const useAuthentication = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  return {
    isAuthenticated,
    user,
    requireAuth: (callback: () => void, onUnauthenticated?: () => void) => {
      if (isAuthenticated) {
        callback();
      } else if (onUnauthenticated) {
        onUnauthenticated();
      }
    },
  };
};

export default AuthenticationProvider;
