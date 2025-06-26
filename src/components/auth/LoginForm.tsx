import React, { useState } from 'react';
import { useAuthStore, LoginCredentials } from '../../stores/authStore';
import { ErrorDisplay } from '../common/ErrorDisplay';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { login, isLoading, error, enhancedError, clearError } = useAuthStore();

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!credentials.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!credentials.password) {
      errors.push('Password is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login(credentials);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
    if (error) {
      clearError();
    }
  };

  return (
    <div className="backdrop-blur-xl bg-yellow-400/10 border border-yellow-400/20 rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-subheading text-yellow-400 drop-shadow-lg mb-2">
          Welcome Back
        </h2>
        <p className="text-white/70">Sign in to your BREAD account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={credentials.email}
            onChange={e => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={credentials.password}
            onChange={e => handleInputChange('password', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <ul className="text-red-200 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Enhanced Error Display */}
        {enhancedError && (
          <ErrorDisplay
            error={enhancedError}
            onRetry={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            onDismiss={clearError}
            className="mb-4"
          />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold py-3 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Switch to Register */}
        <div className="text-center">
          <p className="text-white/70 text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
              disabled={isLoading}
            >
              Sign up here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
