import React from 'react';
import { ExportManager } from '../territory/ExportManager';

interface ExportStepProps {
  onComplete?: () => void;
  onBack: () => void;
}

export const ExportStep: React.FC<ExportStepProps> = ({ onComplete, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-4">
            Export & Download
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Download your completed campaign assets in various formats ready for deployment.
          </p>
        </div>

        <ExportManager
          generatedOutput={{
            territories: [
              {
                id: 'workflow-territory',
                title: 'Generated Territory',
                positioning: 'From workflow integration',
                tone: 'Professional',
                headlines: [
                  { text: 'Generated content', followUp: '', reasoning: '', confidence: 90 },
                ],
                confidence: {
                  marketFit: 90,
                  complianceConfidence: 90,
                  audienceResonance: 90,
                  riskLevel: 'LOW' as const,
                },
              },
            ],
            overallConfidence: 90,
            compliance: {
              powerBy: ['workflow-integration'],
              output: 'Campaign generation completed successfully',
              notes: ['Generated through integrated workflow'],
            },
            metadata: {
              generatedAt: new Date(),
              model: 'workflow',
              processingTime: 1000,
            },
          }}
        />

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Complete Workflow ✓
          </button>
        </div>
      </div>
    </div>
  );
};
