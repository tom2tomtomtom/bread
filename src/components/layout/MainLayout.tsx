import React from 'react';
import { UserProfile } from '../auth';
import { useAuthStore } from '../../stores/authStore';

interface MainLayoutProps {
  children: React.ReactNode;
  showAdmin: boolean;
  onAdminToggle: () => void;
  generateImages: boolean;
  apiStatus: {
    openaiReady: boolean;
    imagesEnabled: boolean;
  };
  onShowLogin?: () => void;
  onShowRegister?: () => void;
  onShowAssets?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showAdmin,
  onAdminToggle,
  generateImages,
  // _apiStatus,
  onShowLogin,
  onShowRegister,
  onShowAssets,
}) => {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 p-8">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                AIDEAS
              </h1>
              <p className="text-gray-400 font-medium">Creative Territory Generator</p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-4">
            {/* Authentication Section */}
            {isAuthenticated ? (
              <UserProfile />
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onShowLogin}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-xl text-white transition-all duration-300"
                >
                  Sign In
                </button>
                <button
                  onClick={onShowRegister}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-semibold px-4 py-2 rounded-xl transition-all duration-300"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center gap-4">
              {/* Assets Button */}
              <button
                onClick={onShowAssets}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                📁 ASSETS
              </button>

              {/* Admin Controls */}
              <div className="text-right">
                <button
                  onClick={onAdminToggle}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  ⚙️ ADMIN
                </button>
                <div className="text-sm text-gray-400">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    OpenAI (Server-side Secure)
                  </div>
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <div
                      className={`w-2 h-2 rounded-full ${generateImages ? 'bg-purple-400' : 'bg-gray-400'}`}
                    ></div>
                    Images {generateImages ? 'Enabled' : 'Disabled'}
                  </div>
                  <div className="text-xs text-gray-500">🔒 Secure & Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`relative z-10 transition-all duration-500 ${showAdmin ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
      >
        {children}
      </main>
    </div>
  );
};
