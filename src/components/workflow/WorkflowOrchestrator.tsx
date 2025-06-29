import React from 'react';
import { useTemplateWorkflowStore, WorkflowStep } from '../../stores/templateWorkflowStore';
import { TemplateSelector } from '../templates/TemplateSelector';
import { TemplateCustomizer } from '../templates/TemplateCustomizer';
import { MotivationGenerator } from '../motivation/MotivationGenerator';
import { CopyGenerator } from '../copy/CopyGenerator';
import { AssetLibrary } from '../assets/AssetLibrary';
import { ExportManager } from '../territory/ExportManager';
import { TerritoryGenerationStep } from './TerritoryGenerationStep';
import { TemplateSelectionStep } from './TemplateSelectionStep';
import { BriefInputStep } from './BriefInputStep';
import { AssetSelectionStep } from './AssetSelectionStep';
import { TemplatePopulationStep } from './TemplatePopulationStep';
import { ExportStep } from './ExportStep';
import { VideoTemplateStep } from './VideoTemplateStep';
import { useCopyStore } from '../../stores/copyStore';
import { useAssetStore } from '../../stores/assetStore';

interface WorkflowOrchestratorProps {
  onComplete?: () => void;
}

const STEP_LABELS: Record<WorkflowStep, string> = {
  'template-selection': 'Select Template',
  'brief-input': 'Input Brief',
  'territory-generation': 'Generate Territories',
  'motivation-generation': 'Generate Motivations',
  'copy-generation': 'Generate Copy',
  'video-template': 'Video Template',
  'asset-selection': 'Select Assets',
  'template-population': 'Populate Template',
  export: 'Export & Download',
};

const STEP_ICONS: Record<WorkflowStep, string> = {
  'template-selection': '🎯',
  'brief-input': '📝',
  'territory-generation': '🗺️',
  'motivation-generation': '🧠',
  'copy-generation': '✍️',
  'video-template': '🎬',
  'asset-selection': '🖼️',
  'template-population': '🎨',
  export: '📤',
};

export const WorkflowOrchestrator: React.FC<WorkflowOrchestratorProps> = ({ onComplete }) => {
  const { currentStep, completedSteps, nextStep, previousStep, goToStep, canProceedToStep } =
    useTemplateWorkflowStore();

  const handleStepClick = (step: WorkflowStep) => {
    if (canProceedToStep(step)) {
      goToStep(step);
    }
  };

  const handleContinue = () => {
    nextStep();
  };

  const handleBack = () => {
    previousStep();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'template-selection':
        return <TemplateSelectionStep onContinue={handleContinue} />;
      case 'brief-input':
        return <BriefInputStep onContinue={handleContinue} onBack={handleBack} />;
      case 'territory-generation':
        return <TerritoryGenerationStep onContinue={handleContinue} onBack={handleBack} />;
      case 'motivation-generation':
        return <MotivationGenerator onContinue={handleContinue} />;
      case 'copy-generation':
        return <CopyGenerator onContinue={handleContinue} />;
      case 'video-template':
        return <VideoTemplateStep onContinue={handleContinue} onBack={handleBack} />;
      case 'asset-selection':
        return <AssetSelectionStep onContinue={handleContinue} onBack={handleBack} />;
      case 'template-population':
        return <TemplatePopulationStep onContinue={handleContinue} onBack={handleBack} />;
      case 'export':
        return <ExportStep onComplete={onComplete} onBack={handleBack} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Progress Bar */}
      <WorkflowProgressBar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        canProceedToStep={canProceedToStep}
      />

      {/* Step Content */}
      <div className="container mx-auto">{renderCurrentStep()}</div>
    </div>
  );
};

interface WorkflowProgressBarProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  onStepClick: (step: WorkflowStep) => void;
  canProceedToStep: (step: WorkflowStep) => boolean;
}

const WorkflowProgressBar: React.FC<WorkflowProgressBarProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  canProceedToStep,
}) => {
  const workflowSteps: WorkflowStep[] = [
    'template-selection',
    'brief-input',
    'territory-generation',
    'motivation-generation',
    'copy-generation',
    'video-template',
    'asset-selection',
    'template-population',
    'export',
  ];

  return (
    <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Campaign Workflow
          </h1>
          <div className="text-sm text-gray-400">
            Step {workflowSteps.indexOf(currentStep) + 1} of {workflowSteps.length}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {workflowSteps.map((step, index) => {
            const isActive = step === currentStep;
            const isCompleted = completedSteps.includes(step);
            const canProceed = canProceedToStep(step);
            const isAccessible = canProceed || isCompleted || isActive;

            return (
              <div key={step} className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => isAccessible && onStepClick(step)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-black'
                      : isCompleted
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : isAccessible
                          ? 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                          : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50'
                  }`}
                >
                  <span className="text-lg">{STEP_ICONS[step]}</span>
                  <span className="hidden sm:inline whitespace-nowrap">{STEP_LABELS[step]}</span>
                </button>

                {index < workflowSteps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 transition-colors duration-300 ${
                      completedSteps.includes(step) ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
