import React, { useState } from 'react';
import { AuthModal } from '../components/auth/AuthModal';
import { WorkflowOrchestrator } from '../components/workflow/WorkflowOrchestrator';
import { useAuthStore } from '../stores/authStore';

// Authenticated workflow interface component
const AuthenticatedWorkflow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with user info and logout */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              AIDEAS
            </h1>
            <span className="ml-4 text-sm text-gray-400">AI-Powered Ad Creation Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              Welcome, {user?.name || user?.email || 'User'}
            </span>
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Integrated Workflow */}
      <WorkflowOrchestrator onComplete={onComplete} />
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuthStore();

  const handleShowLogin = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const handleShowRegister = () => {
    setAuthModalMode('register');
    setShowAuthModal(true);
  };

  const handleWorkflowComplete = () => {
    // Handle workflow completion - could show success message or reset
    // Workflow completed successfully
  };

  // If user is authenticated, show the integrated workflow
  if (isAuthenticated) {
    return <AuthenticatedWorkflow onComplete={handleWorkflowComplete} />;
  }

  // Show landing/marketing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-6">
            AIDEAS
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-8 font-light">
            Complete AI-Powered Ad Creation Workflow
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            From template selection to final export - create professional advertisements using
            psychology-driven copy, compelling visuals, and proven templates. All powered by
            advanced AI technology.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleShowRegister}
              className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={handleShowLogin}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Preview - Show workflow steps */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Complete 9-Step Ad Creation Process
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
            {[
              { icon: '🎯', label: 'Select Template', desc: 'Choose perfect format' },
              { icon: '📝', label: 'Input Brief', desc: 'Define your campaign' },
              { icon: '🗺️', label: 'Generate Territories', desc: 'Strategic positioning' },
              { icon: '🧠', label: 'Generate Motivations', desc: 'AI psychology insights' },
              { icon: '✍️', label: 'Create Copy', desc: 'AI-powered headlines' },
              { icon: '🎬', label: 'Video Template', desc: '3-frame video ads' },
              { icon: '🖼️', label: 'Select Assets', desc: 'Choose visuals' },
              { icon: '🎨', label: 'Populate Template', desc: 'Combine everything' },
              { icon: '📤', label: 'Export & Download', desc: 'Get final ads' },
            ].map((step, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"
              >
                <div className="text-3xl mb-2">{step.icon}</div>
                <h3 className="text-sm font-semibold text-orange-400 mb-1">{step.label}</h3>
                <p className="text-xs text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Strategic Territories</h3>
            <p className="text-gray-400">
              Generate compelling creative territories from your brand briefs with AI-powered
              insights.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-2">Visual Creation</h3>
            <p className="text-gray-400">
              Transform concepts into stunning images and engaging video content automatically.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400">
              Complete creative workflows in minutes, not hours. From brief to final assets.
            </p>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};
