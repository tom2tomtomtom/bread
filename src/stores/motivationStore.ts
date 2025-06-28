import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Motivation {
  id: string;
  title: string;
  description: string;
  psychologyType:
    | 'fear'
    | 'desire'
    | 'social_proof'
    | 'urgency'
    | 'authority'
    | 'reciprocity'
    | 'scarcity'
    | 'curiosity';
  targetEmotion: string;
  reasoning: string;
  confidenceScore: number;
}

export interface MotivationGenerationRequest {
  brief: string;
  targetAudience: string;
  campaignGoal: string;
  templateType?: string;
}

interface MotivationState {
  // Generated motivations
  generatedMotivations: Motivation[];
  selectedMotivations: string[]; // Array of motivation IDs

  // Generation state
  isGenerating: boolean;
  error: string | null;

  // Request tracking
  lastRequest: MotivationGenerationRequest | null;

  // Actions
  generateMotivations: (request: MotivationGenerationRequest) => Promise<void>;
  selectMotivation: (motivationId: string) => void;
  deselectMotivation: (motivationId: string) => void;
  clearSelectedMotivations: () => void;
  clearGeneratedMotivations: () => void;
  clearError: () => void;
}

export const useMotivationStore = create<MotivationState>()(
  persist(
    (set, get) => ({
      // Initial state
      generatedMotivations: [],
      selectedMotivations: [],
      isGenerating: false,
      error: null,
      lastRequest: null,

      // Generate motivations from brief
      generateMotivations: async (request: MotivationGenerationRequest) => {
        set({ isGenerating: true, error: null, lastRequest: request });

        try {
          // In development, use mock data
          if (process.env.NODE_ENV === 'development') {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockMotivations: Motivation[] = [
              {
                id: 'mot-1',
                title: 'Fear of Missing Out',
                description:
                  'Create urgency by highlighting limited availability or time-sensitive opportunities',
                psychologyType: 'fear',
                targetEmotion: 'Anxiety about missing opportunities',
                reasoning:
                  'FOMO drives immediate action and reduces hesitation in purchase decisions',
                confidenceScore: 87,
              },
              {
                id: 'mot-2',
                title: 'Social Validation',
                description: 'Leverage peer approval and social proof to build trust and desire',
                psychologyType: 'social_proof',
                targetEmotion: 'Desire for acceptance and status',
                reasoning:
                  "People follow others' actions, especially those they admire or relate to",
                confidenceScore: 82,
              },
              {
                id: 'mot-3',
                title: 'Aspirational Achievement',
                description: 'Connect the product to personal goals and future self-image',
                psychologyType: 'desire',
                targetEmotion: 'Ambition and self-improvement',
                reasoning: 'Appeals to intrinsic motivation for growth and success',
                confidenceScore: 79,
              },
              {
                id: 'mot-4',
                title: 'Expert Endorsement',
                description: 'Use authority figures and expert opinions to build credibility',
                psychologyType: 'authority',
                targetEmotion: 'Trust and confidence',
                reasoning: 'People defer to expertise and established authority in decision-making',
                confidenceScore: 85,
              },
              {
                id: 'mot-5',
                title: 'Exclusive Access',
                description: 'Make audience feel special with insider or VIP treatment',
                psychologyType: 'scarcity',
                targetEmotion: 'Pride and exclusivity',
                reasoning: 'Scarcity increases perceived value and creates urgency',
                confidenceScore: 81,
              },
              {
                id: 'mot-6',
                title: 'Problem Solution',
                description: 'Address specific pain points and offer clear resolution',
                psychologyType: 'desire',
                targetEmotion: 'Relief and hope',
                reasoning: 'People are motivated to solve problems and reduce friction',
                confidenceScore: 88,
              },
            ];

            set({
              generatedMotivations: mockMotivations,
              isGenerating: false,
              error: null,
            });
            return;
          }

          // Production API call would go here
          const response = await fetch('/.netlify/functions/generate-motivations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Failed to generate motivations');
          }

          set({
            generatedMotivations: data.motivations,
            isGenerating: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred';
          set({
            generatedMotivations: [],
            isGenerating: false,
            error: errorMessage,
          });
        }
      },

      // Select a motivation
      selectMotivation: (motivationId: string) => {
        const { selectedMotivations } = get();
        if (!selectedMotivations.includes(motivationId)) {
          set({ selectedMotivations: [...selectedMotivations, motivationId] });
        }
      },

      // Deselect a motivation
      deselectMotivation: (motivationId: string) => {
        const { selectedMotivations } = get();
        set({
          selectedMotivations: selectedMotivations.filter(id => id !== motivationId),
        });
      },

      // Clear all selected motivations
      clearSelectedMotivations: () => {
        set({ selectedMotivations: [] });
      },

      // Clear generated motivations
      clearGeneratedMotivations: () => {
        set({ generatedMotivations: [], selectedMotivations: [] });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'motivation-storage',
      partialize: state => ({
        generatedMotivations: state.generatedMotivations,
        selectedMotivations: state.selectedMotivations,
        lastRequest: state.lastRequest,
      }),
    }
  )
);
