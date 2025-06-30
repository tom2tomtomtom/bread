import React, { useState } from 'react';
import { useTemplateWorkflowStore } from '../../stores/templateWorkflowStore';
import { ShoppingMoments } from '../ShoppingMoments';

interface BriefInputStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export const BriefInputStep: React.FC<BriefInputStepProps> = ({ onContinue, onBack }) => {
  const { setParsedBrief, parsedBrief, briefText: storedBriefText } = useTemplateWorkflowStore();
  const [briefText, setBriefText] = useState(storedBriefText || '');
  const [parsedFields, setParsedFields] = useState(
    parsedBrief || {
      goal: '',
      targetAudience: '',
      keyBenefits: [],
      brandPersonality: '',
      productDetails: '',
      campaignRequirements: '',
      toneMood: '',
      callToAction: '',
      competitiveContext: '',
      constraints: '',
    }
  );

  const handleContinue = () => {
    setParsedBrief(briefText, parsedFields);
    onContinue();
  };

  const handleMomentSelect = (moment: { name: string; date: string; brief: string }) => {
    setBriefText(moment.brief);
    // Auto-parse some basic fields from the brief
    setParsedFields({
      ...parsedFields,
      goal: `${moment.name} campaign`,
      productDetails: `Products and services for ${moment.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-4">
            Input Campaign Brief
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Provide details about your campaign goals, target audience, and requirements.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-6">
          {/* Brief Text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Brief (Raw Text)
            </label>
            <textarea
              value={briefText}
              onChange={e => setBriefText(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all resize-none"
              rows={6}
              placeholder="Paste or type your campaign brief here..."
            />
          </div>

          {/* Parsed Fields Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Campaign Goal *
              </label>
              <input
                type="text"
                value={parsedFields.goal}
                onChange={e => setParsedFields({ ...parsedFields, goal: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                placeholder="e.g., Increase brand awareness, Drive sales..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Audience *
              </label>
              <input
                type="text"
                value={parsedFields.targetAudience}
                onChange={e => setParsedFields({ ...parsedFields, targetAudience: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                placeholder="e.g., Young professionals aged 25-35..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product/Service Details
              </label>
              <input
                type="text"
                value={parsedFields.productDetails}
                onChange={e => setParsedFields({ ...parsedFields, productDetails: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                placeholder="What are you advertising?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brand Personality
              </label>
              <input
                type="text"
                value={parsedFields.brandPersonality}
                onChange={e =>
                  setParsedFields({ ...parsedFields, brandPersonality: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                placeholder="e.g., Modern, trustworthy, innovative..."
              />
            </div>
          </div>

          {/* Shopping Moments Quick Start */}
          <div className="mt-8">
            <ShoppingMoments onMomentSelect={handleMomentSelect} />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!briefText || !parsedFields.goal || !parsedFields.targetAudience}
              className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-semibold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Territories →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
