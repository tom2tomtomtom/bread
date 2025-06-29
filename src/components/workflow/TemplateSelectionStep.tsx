import React from 'react';
import { TemplateSelector } from '../templates/TemplateSelector';

interface TemplateSelectionStepProps {
  onContinue: () => void;
}

export const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-4">
            Select Template
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Choose the perfect template for your campaign from our collection of proven formats.
          </p>
        </div>

        <TemplateSelector onTemplateSelected={onContinue} />
      </div>
    </div>
  );
};
