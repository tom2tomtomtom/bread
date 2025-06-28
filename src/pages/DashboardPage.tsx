import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { MainLayout } from '../components/layout/MainLayout';
import { useConfigStore, useUIStore } from '../stores';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { showAdmin, setShowAdmin } = useUIStore();
  const { generateImages } = useConfigStore();

  const handleAdminToggle = () => setShowAdmin(!showAdmin);
  const handleNewProject = () => navigate('/brief');
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <MainLayout
      showAdmin={showAdmin}
      onAdminToggle={handleAdminToggle}
      generateImages={generateImages}
      apiStatus={{
        openaiReady: true,
        imagesEnabled: generateImages,
      }}
    >
      <div className="max-w-6xl mx-auto p-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back, {user?.name || 'Creator'}! 👋
          </h1>
          <p className="text-gray-400 text-lg">Ready to create your next breakthrough campaign?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <button
            onClick={handleNewProject}
            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-bold p-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-left"
          >
            <div className="text-2xl mb-2">✨</div>
            <h3 className="text-lg font-semibold mb-1">New Project</h3>
            <p className="text-sm opacity-80">Start a fresh creative brief</p>
          </button>

          <button
            onClick={() => navigate('/generate')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-semibold p-6 rounded-xl transition-all duration-300 text-left"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-lg font-semibold mb-1">Generate</h3>
            <p className="text-sm text-gray-400">Create territories & content</p>
          </button>

          <button
            onClick={() => navigate('/results')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-semibold p-6 rounded-xl transition-all duration-300 text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-lg font-semibold mb-1">Results</h3>
            <p className="text-sm text-gray-400">View your creations</p>
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-xl border border-red-500/30 text-red-400 font-semibold p-6 rounded-xl transition-all duration-300 text-left"
          >
            <div className="text-2xl mb-2">🚪</div>
            <h3 className="text-lg font-semibold mb-1">Logout</h3>
            <p className="text-sm opacity-80">End your session</p>
          </button>
        </div>

        {/* Recent Projects */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Projects</h2>
            <button
              onClick={handleNewProject}
              className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-lg transition-all duration-300"
            >
              + New Project
            </button>
          </div>

          {/* Project List Placeholder */}
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">
              Start your first creative project and bring your ideas to life!
            </p>
            <button
              onClick={handleNewProject}
              className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300"
            >
              Create Your First Project
            </button>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">0</div>
            <p className="text-gray-400">Projects Created</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
            <p className="text-gray-400">Images Generated</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">0</div>
            <p className="text-gray-400">Videos Created</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
