import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 border-green-400/50 text-white';
      case 'error':
        return 'bg-red-500/90 border-red-400/50 text-white';
      case 'info':
        return 'bg-blue-500/90 border-blue-400/50 text-white';
      default:
        return 'bg-green-500/90 border-green-400/50 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  return (
    <div className="fixed top-8 right-8 z-50 animate-in slide-in-from-right duration-300">
      <div
        className={`
        backdrop-blur-xl rounded-2xl border p-6 shadow-2xl
        ${getToastStyles()}
        min-w-[300px] max-w-[500px]
      `}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getIcon()}</span>
          <div className="flex-1">
            <p className="font-subheading text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
