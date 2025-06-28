import React, { useState } from 'react';
import { ApiKeys } from '../App';
import { ShoppingMoments } from './ShoppingMoments';
import { BriefBuilder } from './BriefBuilder';

interface BriefInputProps {
  brief: string;
  setBrief: (brief: string) => void;
  apiKeys: ApiKeys;
  error: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onMomentSelect: (moment: { name: string; date: string; brief: string }) => void;
  hideGenerateButton?: boolean;
}

export const BriefInput: React.FC<BriefInputProps> = ({
  brief,
  setBrief,
  apiKeys,
  error,
  isGenerating,
  onGenerate,
  onMomentSelect,
  hideGenerateButton = false,
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'builder'>('text');
  return (
    <div className="backdrop-blur-xl bg-yellow-400/10 border border-yellow-400/20 rounded-3xl p-8 shadow-2xl mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-subheading text-yellow-400 drop-shadow-lg">CLIENT BRIEF</h2>

        {/* Input Mode Toggle */}
        <div className="flex bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-lg text-sm font-subheading transition-all duration-300 ${
              inputMode === 'text' ? 'bg-yellow-400 text-black' : 'text-gray-300 hover:text-white'
            }`}
          >
            📝 Text Input
          </button>
          <button
            onClick={() => setInputMode('builder')}
            className={`px-4 py-2 rounded-lg text-sm font-subheading transition-all duration-300 ${
              inputMode === 'builder'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            🏗️ Brief Builder
          </button>
        </div>
      </div>

      {/* OpenAI Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <label className="block text-lg font-subheading text-gray-200">AI ENGINE</label>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${apiKeys.openai ? 'bg-green-400' : 'bg-red-400'}`}
            ></div>
            <span className="text-sm font-body normal-case text-gray-300">
              OpenAI {apiKeys.openai ? 'Ready' : 'Not Configured'}
            </span>
          </div>
        </div>
        {!apiKeys.openai && (
          <div className="mt-2 text-sm text-yellow-400 font-body normal-case">
            💡 Configure your OpenAI API key in the Admin panel to start generating
          </div>
        )}
      </div>

      {/* Brief Input - Conditional Rendering */}
      {inputMode === 'text' ? (
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 text-black p-8 rounded-2xl mb-8 shadow-2xl shadow-yellow-400/20">
          <div className="flex justify-between items-start mb-4">
            <label className="text-sm font-subheading text-gray-800">CAMPAIGN BRIEF</label>
            <div className="text-xs text-gray-600 bg-white/20 px-2 py-1 rounded font-body normal-case">
              {brief.length}/2000 characters
            </div>
          </div>
          <textarea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            placeholder="Describe your campaign objective, target audience, key messaging, and competitive context..."
            className="w-full h-40 bg-transparent text-black placeholder-gray-700 font-body font-normal text-lg resize-none outline-none normal-case"
            maxLength={2000}
          />
          {brief && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setBrief('')}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors font-body normal-case"
              >
                Clear
              </button>
              <button
                onClick={() =>
                  setBrief(
                    'Black Friday is approaching. Generate creative territories for Everyday Rewards to position everyday value against limited-time sales events. Focus on consistent benefits vs one-off deals.'
                  )
                }
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors font-body normal-case"
              >
                Sample Brief
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8">
          <BriefBuilder onBriefChange={setBrief} initialBrief={brief} />
        </div>
      )}

      {/* Shopping Moments Calendar */}
      <ShoppingMoments onMomentSelect={onMomentSelect} />

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 font-body normal-case">
          {error}
        </div>
      )}

      {!hideGenerateButton && (
        <button
          onClick={onGenerate}
          disabled={!brief || isGenerating}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-10 py-5 rounded-2xl font-subheading text-lg transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-400/30 hover:scale-105 disabled:hover:scale-100 w-full"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>GENERATING...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>🚀 GENERATE TERRITORIES</span>
              <div className="ml-2 bg-white/20 rounded-full px-2 py-1 text-xs">Ctrl+Enter</div>
            </div>
          )}
        </button>
      )}

      {/* Keyboard Shortcut Listener */}
      <div
        onKeyDown={e => {
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
