import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkflowStep =
  | 'brief-input'
  | 'territory-generation'
  | 'motivation-generation'
  | 'copy-generation'
  | 'asset-selection'
  | 'video-template'
  | 'template-population'
  | 'export';

export interface WorkflowProgress {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  canProceed: boolean;
}

export interface SelectedTemplate {
  id: string;
  name: string;
  type: string;
  format: string;
  requirements: {
    headlineMaxLength?: number;
    bodyTextMaxLength?: number;
    requiredAssets: string[];
    optionalAssets: string[];
  };
}

export interface ParsedBrief {
  goal: string;
  targetAudience: string;
  keyBenefits: string[];
  brandPersonality: string;
  productDetails: string;
  campaignRequirements: string;
  toneMood: string;
  callToAction: string;
  competitiveContext: string;
  constraints: string;
}

interface TemplateWorkflowState {
  // Workflow progress
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];

  // Template selection
  selectedTemplate: SelectedTemplate | null;

  // Brief data (comprehensive parsed fields)
  briefText: string; // Raw brief text
  parsedBrief: ParsedBrief | null; // AI-parsed structured brief

  // Legacy fields for backward compatibility
  brief: string;
  targetAudience: string;
  campaignGoal: string;

  // Workflow validation
  errors: { [key in WorkflowStep]?: string };

  // Actions
  setCurrentStep: (step: WorkflowStep) => void;
  markStepCompleted: (step: WorkflowStep) => void;
  selectTemplate: (template: SelectedTemplate) => void;
  setBrief: (brief: string, targetAudience: string, campaignGoal: string) => void;
  setParsedBrief: (briefText: string, parsedBrief: ParsedBrief) => void;
  validateStep: (step: WorkflowStep) => boolean;
  canProceedToStep: (step: WorkflowStep) => boolean;
  resetWorkflow: () => void;
  setError: (step: WorkflowStep, error: string) => void;
  clearError: (step: WorkflowStep) => void;

  // Navigation helpers
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: WorkflowStep) => void;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  'brief-input',
  'territory-generation',
  'motivation-generation',
  'copy-generation',
  'asset-selection',
  'video-template',
  'template-population',
  'export',
];

export const useTemplateWorkflowStore = create<TemplateWorkflowState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 'brief-input',
      completedSteps: [],
      selectedTemplate: null,
      briefText: '',
      parsedBrief: null,
      brief: '',
      targetAudience: '',
      campaignGoal: '',
      errors: {},

      // Set current step
      setCurrentStep: (step: WorkflowStep) => {
        set({ currentStep: step });
      },

      // Mark step as completed
      markStepCompleted: (step: WorkflowStep) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step] });
        }
      },

      // Select template (legacy - no longer used in workflow)
      selectTemplate: (template: SelectedTemplate) => {
        set({ selectedTemplate: template });
        // Note: template-selection step no longer exists in workflow
      },

      // Set brief data (legacy method)
      setBrief: (brief: string, targetAudience: string, campaignGoal: string) => {
        set({ brief, targetAudience, campaignGoal });
        get().markStepCompleted('brief-input');
      },

      // Set parsed brief data (new comprehensive method)
      setParsedBrief: (briefText: string, parsedBrief: ParsedBrief) => {
        set({
          briefText,
          parsedBrief,
          // Update legacy fields for backward compatibility
          brief: briefText,
          targetAudience: parsedBrief.targetAudience,
          campaignGoal: parsedBrief.goal,
        });
        get().markStepCompleted('brief-input');
      },

      // Validate step completion
      validateStep: (step: WorkflowStep) => {
        const state = get();

        switch (step) {
          case 'brief-input':
            // Check if we have parsed brief or legacy fields
            if (state.parsedBrief) {
              return !!(
                state.briefText &&
                state.parsedBrief.goal &&
                state.parsedBrief.targetAudience
              );
            }
            return !!(state.brief && state.targetAudience && state.campaignGoal);
          case 'territory-generation':
            // Check if territories are generated (would integrate with generationStore)
            return true; // Placeholder - will be replaced with actual territory validation
          case 'motivation-generation':
            // Check if motivations are generated and selected (would integrate with motivationStore)
            return true; // Placeholder
          case 'copy-generation':
            // Check if copy is generated and selected (would integrate with copyStore)
            return true; // Placeholder
          case 'video-template':
            // Check if video template is selected and configured
            return true; // Placeholder - will be replaced with actual video template validation
          case 'asset-selection':
            // Check if required assets are selected
            return true; // Placeholder
          case 'template-population':
            // Check if template is populated with copy and assets
            return true; // Placeholder
          case 'export':
            return true; // Always allow export as final step
          default:
            return false;
        }
      },

      // Check if can proceed to specific step
      canProceedToStep: (targetStep: WorkflowStep) => {
        const state = get();
        const targetIndex = WORKFLOW_STEPS.indexOf(targetStep);

        // Can't proceed to invalid step
        if (targetIndex === -1) return false;

        // Always allow going to first step
        if (targetIndex === 0) return true;

        // Check if all previous steps are completed
        for (let i = 0; i < targetIndex; i++) {
          const previousStep = WORKFLOW_STEPS[i];
          if (!state.completedSteps.includes(previousStep) && !state.validateStep(previousStep)) {
            return false;
          }
        }

        return true;
      },

      // Reset workflow
      resetWorkflow: () => {
        set({
          currentStep: 'brief-input',
          completedSteps: [],
          selectedTemplate: null,
          briefText: '',
          parsedBrief: null,
          brief: '',
          targetAudience: '',
          campaignGoal: '',
          errors: {},
        });
      },

      // Set error for step
      setError: (step: WorkflowStep, error: string) => {
        const { errors } = get();
        set({ errors: { ...errors, [step]: error } });
      },

      // Clear error for step
      clearError: (step: WorkflowStep) => {
        const { errors } = get();
        const newErrors = { ...errors };
        delete newErrors[step];
        set({ errors: newErrors });
      },

      // Navigation helpers
      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);

        if (currentIndex < WORKFLOW_STEPS.length - 1) {
          const nextStep = WORKFLOW_STEPS[currentIndex + 1];
          if (get().canProceedToStep(nextStep)) {
            set({ currentStep: nextStep });
          }
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);

        if (currentIndex > 0) {
          const previousStep = WORKFLOW_STEPS[currentIndex - 1];
          set({ currentStep: previousStep });
        }
      },

      goToStep: (step: WorkflowStep) => {
        if (get().canProceedToStep(step)) {
          set({ currentStep: step });
        }
      },
    }),
    {
      name: 'template-workflow-storage',
      partialize: state => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        selectedTemplate: state.selectedTemplate,
        briefText: state.briefText,
        parsedBrief: state.parsedBrief,
        brief: state.brief,
        targetAudience: state.targetAudience,
        campaignGoal: state.campaignGoal,
      }),
    }
  )
);
