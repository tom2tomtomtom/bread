import React, { useState } from 'react';
import { useAuthStore, RegisterCredentials } from '../../stores/authStore';
import { ErrorDisplay } from '../common/ErrorDisplay';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: '',
    password: '',
    name: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { register, isLoading, error, enhancedError, clearError } = useAuthStore();

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!credentials.name.trim()) {
      errors.push('Name is required');
    } else if (credentials.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!credentials.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!credentials.password) {
      errors.push('Password is required');
    } else if (credentials.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(credentials.password)) {
      errors.push(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      );
    }

    if (!confirmPassword) {
      errors.push('Please confirm your password');
    } else if (credentials.password !== confirmPassword) {
      errors.push('Passwords do not match');
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
      await register(credentials);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (
    field: keyof RegisterCredentials | 'confirmPassword',
    value: string
  ) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setCredentials(prev => ({ ...prev, [field]: value }));
    }

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
        <h2 className="text-3xl font-subheading text-yellow-400 drop-shadow-lg mb-2">Join BREAD</h2>
        <p className="text-white/70">Create your account to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={credentials.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
            placeholder="Enter your full name"
            disabled={isLoading}
          />
        </div>

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
            placeholder="Create a strong password"
            disabled={isLoading}
          />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => handleInputChange('confirmPassword', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
            placeholder="Confirm your password"
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

        {/* API Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
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
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-white/70 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
              disabled={isLoading}
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
