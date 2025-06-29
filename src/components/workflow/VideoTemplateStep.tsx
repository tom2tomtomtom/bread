import React, { useState } from 'react';
import { VideoTemplate, VideoContent } from '../../types/videoTemplates';
import { VideoTemplateSelector } from '../video/VideoTemplateSelector';
import { VideoFrameEditor } from '../video/VideoFrameEditor';
import { useTemplateWorkflowStore } from '../../stores/templateWorkflowStore';
import { useGenerationStore } from '../../stores';

interface VideoTemplateStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export const VideoTemplateStep: React.FC<VideoTemplateStepProps> = ({ onContinue, onBack }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [videoContent, setVideoContent] = useState<VideoContent | null>(null);
  const [currentStep, setCurrentStep] = useState<'select' | 'edit'>('select');

  const { markStepCompleted } = useTemplateWorkflowStore();
  const { generatedOutput } = useGenerationStore();

  const handleTemplateSelected = (template: VideoTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('edit');
  };

  const handleContentUpdate = (content: VideoContent) => {
    setVideoContent(content);
  };

  const handleContinue = () => {
    if (selectedTemplate && videoContent) {
      // Save video template and content to store
      markStepCompleted('video-template');
      onContinue();
    }
  };

  const handleBackToTemplates = () => {
    setCurrentStep('select');
    setSelectedTemplate(null);
    setVideoContent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {currentStep === 'select' ? (
          <>
            <VideoTemplateSelector onTemplateSelected={handleTemplateSelected} className="mb-8" />

            <div className="flex justify-between">
              <button
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                ← Back
              </button>
            </div>
          </>
        ) : (
          <>
            {selectedTemplate && (
              <VideoFrameEditor
                template={selectedTemplate}
                generatedContent={generatedOutput}
                onContentUpdate={handleContentUpdate}
                className="mb-8"
              />
            )}

            <div className="flex justify-between">
              <button
                onClick={handleBackToTemplates}
                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                ← Back to Templates
              </button>

              <div className="flex gap-4">
                <button
                  onClick={onBack}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300"
                >
                  ← Previous Step
                </button>

                <button
                  onClick={handleContinue}
                  disabled={!selectedTemplate || !videoContent}
                  className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-semibold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Template Population →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
