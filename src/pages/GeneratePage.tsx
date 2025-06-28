import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ConnectedGenerationController } from '../components/generation/ConnectedGenerationController';
import { useConfigStore, useUIStore, useGenerationStore } from '../stores';

export const GeneratePage: React.FC = () => {
  const navigate = useNavigate();
  const { showAdmin, setShowAdmin } = useUIStore();
  const { generateImages } = useConfigStore();
  const { brief, showOutput, generatedOutput } = useGenerationStore();

  const handleAdminToggle = () => setShowAdmin(!showAdmin);

  const handleBackToBrief = () => {
    navigate('/brief');
  };

  const handleViewResults = () => {
    navigate('/results');
  };

  // If there's no brief, redirect to brief page
  React.useEffect(() => {
    if (!brief.trim()) {
      navigate('/brief');
    }
  }, [brief, navigate]);

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Generate Territories</h1>
            <p className="text-gray-400">Transform your brief into creative territories</p>
          </div>
          <button
            onClick={handleBackToBrief}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300"
          >
            ← Edit Brief
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                ✓
              </div>
              <span className="ml-2 text-green-400 font-medium">Brief</span>
            </div>
            <div className="w-16 h-1 bg-green-500 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                2
              </div>
              <span className="ml-2 text-orange-400 font-medium">Generate</span>
            </div>
            <div className="w-16 h-1 bg-gray-600 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 font-semibold">
                3
              </div>
              <span className="ml-2 text-gray-400">Results</span>
            </div>
          </div>
        </div>

        {/* Brief Summary */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">📝 Your Brief</h2>
          <div className="bg-white/5 rounded-lg p-4 max-h-32 overflow-y-auto">
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{brief}</p>
          </div>
        </div>

        {/* Generation Interface */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <ConnectedGenerationController />
        </div>

        {/* Action Buttons */}
        {showOutput && generatedOutput && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleViewResults}
              className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-semibold px-8 py-3 rounded-xl transition-all duration-300"
            >
              Continue to Results →
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
