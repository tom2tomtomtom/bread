import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-20 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Form Content */}
        {mode === 'login' ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToRegister={handleSwitchMode} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={handleSwitchMode} />
        )}
      </div>
    </div>
  );
};
