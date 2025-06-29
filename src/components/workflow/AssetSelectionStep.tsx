import React from 'react';
import { AssetLibrary } from '../assets/AssetLibrary';

interface AssetSelectionStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export const AssetSelectionStep: React.FC<AssetSelectionStepProps> = ({ onContinue, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-4">
            Select Assets
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Choose images, videos, and other assets for your campaign from our library or upload
            your own.
          </p>
        </div>

        <AssetLibrary
          onAssetSelect={asset => console.log('Asset selected:', asset)}
          selectionMode={true}
        />

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onContinue}
            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-semibold px-6 py-3 rounded-lg transition-all"
          >
            Continue to Video Template →
          </button>
        </div>
      </div>
    </div>
  );
};
