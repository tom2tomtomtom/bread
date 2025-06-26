import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface UserProfileProps {
  onClose?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, usageStats, logout, getUsageStats } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user && !usageStats) {
      getUsageStats();
    }
  }, [user, usageStats, getUsageStats]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    onClose?.();
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'text-blue-400';
      case 'enterprise':
        return 'text-purple-400';
      default:
        return 'text-green-400';
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'enterprise':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
      default:
        return 'bg-green-500/20 border-green-500/30 text-green-300';
    }
  };

  const getUsagePercentage = () => {
    if (!usageStats) return 0;
    return Math.min((usageStats.monthlyRequests / usageStats.limit) * 100, 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="relative">
      {/* User Avatar/Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2 transition-all"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-semibold text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-left">
          <p className="text-white font-medium text-sm">{user.name}</p>
          <p className={`text-xs capitalize ${getPlanColor(user.plan)}`}>{user.plan} Plan</p>
        </div>
        <svg
          className={`w-4 h-4 text-white/70 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50">
          <div className="p-6">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-white font-semibold">{user.name}</h3>
                <p className="text-white/70 text-sm">{user.email}</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs border ${getPlanBadge(user.plan)} mt-1`}
                >
                  {user.plan.toUpperCase()} PLAN
                </span>
              </div>
            </div>

            {/* Usage Stats */}
            {usageStats && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm">Monthly Usage</span>
                  <span className="text-white text-sm font-medium">
                    {usageStats.monthlyRequests} / {usageStats.limit}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getUsageColor()}`}
                    style={{ width: `${getUsagePercentage()}%` }}
                  />
                </div>
                <p className="text-white/60 text-xs mt-1">
                  Resets on {new Date(usageStats.lastResetDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Account Info */}
            <div className="border-t border-white/10 pt-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Member since:</span>
                  <span className="text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className="flex justify-between">
                    <span className="text-white/70">Last login:</span>
                    <span className="text-white">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => getUsageStats()}
                className="w-full text-left px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm"
              >
                Refresh Usage Stats
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-all text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
};
