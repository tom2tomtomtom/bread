import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { TerritoryOutput } from '../components/territory/TerritoryOutput';
import { TextToImageGenerator } from '../components/multimedia/TextToImageGenerator';
import { ImageToVideoGenerator } from '../components/multimedia/ImageToVideoGenerator';
import {
  useConfigStore,
  useUIStore,
  useGenerationStore,
  useStarredStore,
  useTerritoryStore,
} from '../stores';

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showAdmin, setShowAdmin } = useUIStore();
  const { generateImages } = useConfigStore();
  const { generatedOutput, showOutput } = useGenerationStore();
  const { starredItems } = useStarredStore();
  const territoryStore = useTerritoryStore();

  const [activeTab, setActiveTab] = useState<'territories' | 'images' | 'videos'>('territories');
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);

  const handleAdminToggle = () => setShowAdmin(!showAdmin);

  const handleBackToGenerate = () => {
    navigate('/generate');
  };

  const handleNewProject = () => {
    navigate('/brief');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // If there's no generated output, redirect to generate page
  React.useEffect(() => {
    if (!showOutput || !generatedOutput) {
      navigate('/generate');
    }
  }, [showOutput, generatedOutput, navigate]);

  // Stub handlers for territory actions
  const handleNewBrief = () => navigate('/brief');
  const handleRegenerateUnstarred = () => {
    // TODO: Implement regenerate functionality
  };
  const handleToggleTerritoryStarred = (territoryId: string) => {
    // TODO: Implement star toggle
  };
  const handleToggleHeadlineStarred = (territoryId: string, headlineIndex: number) => {
    // TODO: Implement headline star toggle
  };

  if (!generatedOutput) {
    return null; // Will redirect via useEffect
  }

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
            <h1 className="text-4xl font-bold text-white mb-2">Campaign Results</h1>
            <p className="text-gray-400">
              Your generated creative territories and multimedia content
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBackToGenerate}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300"
            >
              ← Edit Generation
            </button>
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-xl transition-all duration-300"
            >
              Dashboard
            </button>
          </div>
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
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                ✓
              </div>
              <span className="ml-2 text-green-400 font-medium">Generate</span>
            </div>
            <div className="w-16 h-1 bg-orange-500 rounded"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                3
              </div>
              <span className="ml-2 text-orange-400 font-medium">Results</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-2 mb-8">
          <button
            onClick={() => setActiveTab('territories')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'territories'
                ? 'bg-orange-500 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎯 Territories ({generatedOutput.territories?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'images' ? 'bg-orange-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            🎨 Images
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'videos' ? 'bg-orange-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            🎬 Videos
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'territories' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <TerritoryOutput
                generatedOutput={generatedOutput}
                onNewBrief={handleNewBrief}
                onRegenerateUnstarred={handleRegenerateUnstarred}
                onToggleTerritoryStarred={handleToggleTerritoryStarred}
                onToggleHeadlineStarred={handleToggleHeadlineStarred}
                starredItems={starredItems}
                // Enhanced features (stubs for now)
                onSelectTerritoryForEvolution={id => setSelectedTerritory(id)}
                onGenerateEvolutionSuggestions={() => {}}
                onPredictTerritoryPerformance={() => {}}
                territoryEvolutions={{}}
                performancePredictions={{}}
              />
            </div>
          )}

          {activeTab === 'images' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Generate Images</h2>
                <p className="text-gray-400">Create stunning visuals from your territories</p>
              </div>

              {generatedOutput.territories && generatedOutput.territories.length > 0 ? (
                <TextToImageGenerator />
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎨</div>
                  <p className="text-gray-400">Generate territories first to create images</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Generate Videos</h2>
                <p className="text-gray-400">Bring your images to life with video content</p>
              </div>

              <ImageToVideoGenerator />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleNewProject}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            Start New Project
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => {
                /* TODO: Implement export */
              }}
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 px-6 py-3 rounded-xl transition-all duration-300"
            >
              📤 Export All
            </button>
            <button
              onClick={() => {
                /* TODO: Implement save */
              }}
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 px-6 py-3 rounded-xl transition-all duration-300"
            >
              💾 Save Project
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
