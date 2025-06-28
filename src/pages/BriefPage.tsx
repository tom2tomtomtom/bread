import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { BriefInput } from '../components/BriefInput';
import { BriefBuilder } from '../components/BriefBuilder';
import { ShoppingMoments } from '../components/ShoppingMoments';
import { useConfigStore, useUIStore, useGenerationStore } from '../stores';

export const BriefPage: React.FC = () => {
  const navigate = useNavigate();
  const { showAdmin, setShowAdmin } = useUIStore();
  const { generateImages, apiKeys } = useConfigStore();
  const { brief, setBrief, error } = useGenerationStore();

  const handleAdminToggle = () => setShowAdmin(!showAdmin);
  
  const handleMomentSelect = (moment: { name: string; date: string; brief: string }) => {
    // Replace the entire brief with the shopping moment brief
    setBrief(moment.brief);
  };

  const handleProceedToGenerate = () => {
    if (!brief.trim()) {
      return; // Brief is required
    }
    navigate('/generate');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Create Your Brief</h1>
            <p className="text-gray-400">Define your campaign strategy and objectives</p>
          </div>
          <button
            onClick={handleBackToDashboard}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">1</div>
              <span className="ml-2 text-orange-400 font-medium">Brief</span>
            </div>
            <div className="w-16 h-1 bg-gray-600 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 font-semibold">2</div>
              <span className="ml-2 text-gray-400">Generate</span>
            </div>
            <div className="w-16 h-1 bg-gray-600 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 font-semibold">3</div>
              <span className="ml-2 text-gray-400">Results</span>
            </div>
          </div>
        </div>

        {/* Brief Creation Tools */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Brief Input */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">✍️ Write Your Brief</h2>
            <BriefInput
              brief={brief}
              setBrief={setBrief}
              apiKeys={apiKeys}
              error={error}
              isGenerating={false}
              onGenerate={handleProceedToGenerate}
              onMomentSelect={handleMomentSelect}
              hideGenerateButton={true}
            />
          </div>

          {/* Brief Builder */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">🏗️ Brief Builder</h2>
            <BriefBuilder onBriefChange={setBrief} initialBrief={brief} />
          </div>
        </div>

        {/* Shopping Moments */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">📅 Key Moments</h2>
          <p className="text-gray-400 mb-4">Select relevant shopping moments for your campaign</p>
          <ShoppingMoments onMomentSelect={handleMomentSelect} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            {brief.trim() ? `${brief.length} characters` : 'Start writing your brief above'}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-xl transition-all duration-300"
            >
              Save Draft
            </button>
            <button
              onClick={handleProceedToGenerate}
              disabled={!brief.trim()}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                brief.trim()
                  ? 'bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue to Generate →
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};