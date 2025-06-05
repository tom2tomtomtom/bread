import React from 'react';
import { ApiKeys } from '../App';
import { ShoppingMoments } from './ShoppingMoments';

interface BriefInputProps {
  brief: string;
  setBrief: (brief: string) => void;
  selectedAI: 'openai' | 'claude';
  setSelectedAI: (ai: 'openai' | 'claude') => void;
  apiKeys: ApiKeys;
  error: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onMomentSelect: (moment: { name: string; date: string }) => void;
}

export const BriefInput: React.FC<BriefInputProps> = ({
  brief,
  setBrief,
  selectedAI,
  setSelectedAI,
  apiKeys,
  error,
  isGenerating,
  onGenerate,
  onMomentSelect
}) => {
  return (
    <div className="backdrop-blur-xl bg-yellow-400/10 border border-yellow-400/20 rounded-3xl p-8 shadow-2xl mb-8">
      <h2 className="text-3xl font-black mb-6 text-yellow-400 drop-shadow-lg">
        CLIENT BRIEF
      </h2>
      
      {/* AI Selection */}
      <div className="mb-6">
        <label className="block text-lg font-bold mb-4 text-gray-200">SELECT AI ENGINE</label>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedAI('openai')}
            disabled={!apiKeys.openai}
            className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 relative ${
              selectedAI === 'openai' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-2 border-blue-400' 
                : apiKeys.openai
                  ? 'bg-white/5 text-gray-300 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                  : 'bg-gray-800/50 text-gray-500 border-2 border-gray-700 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>OPENAI</span>
              <div className={`w-2 h-2 rounded-full ${apiKeys.openai ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
            {!apiKeys.openai && (
              <div className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                No API Key
              </div>
            )}
          </button>
          <button
            onClick={() => setSelectedAI('claude')}
            disabled={!apiKeys.claude}
            className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 relative ${
              selectedAI === 'claude' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-2 border-blue-400' 
                : apiKeys.claude
                  ? 'bg-white/5 text-gray-300 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                  : 'bg-gray-800/50 text-gray-500 border-2 border-gray-700 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>CLAUDE</span>
              <div className={`w-2 h-2 rounded-full ${apiKeys.claude ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
            {!apiKeys.claude && (
              <div className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                No API Key
              </div>
            )}
          </button>
        </div>
        <div className="text-sm text-gray-400 mt-2">
          💡 Configure API keys in Admin panel to enable AI engines
        </div>
      </div>

      {/* Brief Input */}
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 text-black p-8 rounded-2xl mb-8 shadow-2xl shadow-yellow-400/20">
        <div className="flex justify-between items-start mb-4">
          <label className="text-sm font-bold text-gray-800">CAMPAIGN BRIEF</label>
          <div className="text-xs text-gray-600 bg-white/20 px-2 py-1 rounded">
            {brief.length}/2000 characters
          </div>
        </div>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe your campaign objective, target audience, key messaging, and competitive context..."
          className="w-full h-40 bg-transparent text-black placeholder-gray-700 font-normal text-lg resize-none outline-none"
          maxLength={2000}
        />
        {brief && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setBrief('')}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setBrief('Black Friday is approaching. Generate creative territories for Everyday Rewards to position everyday value against limited-time sales events. Focus on consistent benefits vs one-off deals.')}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
            >
              Sample Brief
            </button>
          </div>
        )}
      </div>

      {/* Shopping Moments Calendar */}
      <ShoppingMoments onMomentSelect={onMomentSelect} />

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
          {error}
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={!brief || isGenerating}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-400/30 hover:scale-105 disabled:hover:scale-100 w-full"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>GENERATING TERRITORIES...</span>
            <div className="ml-4 bg-white/20 rounded-full px-3 py-1 text-sm">
              {selectedAI.toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>🚀 GENERATE TERRITORIES</span>
            <div className="ml-2 bg-white/20 rounded-full px-2 py-1 text-xs">
              Ctrl+Enter
            </div>
          </div>
        )}
      </button>

      {/* Keyboard Shortcut Listener */}
      <div 
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && brief && !isGenerating) {
            onGenerate();
          }
        }}
        tabIndex={-1}
        className="outline-none"
      />
    </div>
  );
};