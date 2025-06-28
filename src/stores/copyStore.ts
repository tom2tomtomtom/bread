import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CopyVariation {
  id: string;
  headline: string;
  bodyText: string;
  callToAction: string;
  subheadline?: string;
  motivationId: string; // Links to the motivation that inspired this copy
  confidenceScore: number;
  reasoning: string;
  tone: 'urgent' | 'friendly' | 'professional' | 'emotional' | 'playful' | 'authoritative';
}

export interface CopyGenerationRequest {
  brief: string;
  selectedMotivations: string[]; // IDs of selected motivations
  templateType: string;
  targetAudience: string;
  additionalRequirements?: string;
}

export interface SelectedCopy {
  headline: string;
  bodyText: string;
  callToAction: string;
  subheadline?: string;
  motivationId: string;
  variationId: string;
}

interface CopyState {
  // Generated copy variations
  generatedCopyVariations: CopyVariation[];
  selectedCopy: SelectedCopy | null;
  
  // Generation state
  isGenerating: boolean;
  error: string | null;
  
  // Request tracking
  lastRequest: CopyGenerationRequest | null;
  
  // Actions
  generateCopy: (request: CopyGenerationRequest) => Promise<void>;
  selectCopy: (variation: CopyVariation) => void;
  clearSelectedCopy: () => void;
  clearGeneratedCopy: () => void;
  clearError: () => void;
  
  // Custom copy editing
  updateSelectedCopy: (updates: Partial<SelectedCopy>) => void;
}

export const useCopyStore = create<CopyState>()(
  persist(
    (set, get) => ({
      // Initial state
      generatedCopyVariations: [],
      selectedCopy: null,
      isGenerating: false,
      error: null,
      lastRequest: null,

      // Generate copy variations from motivations
      generateCopy: async (request: CopyGenerationRequest) => {
        set({ isGenerating: true, error: null, lastRequest: request });

        try {
          // In development, use mock data
          if (process.env.NODE_ENV === 'development') {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            const mockCopyVariations: CopyVariation[] = [
              {
                id: 'copy-1',
                headline: 'Don\'t Miss Out - Limited Time Only!',
                bodyText: 'Join thousands who\'ve already discovered the secret to [benefit]. Available for a limited time only.',
                callToAction: 'Claim Yours Now',
                subheadline: 'Only 48 hours left',
                motivationId: 'mot-1', // FOMO
                confidenceScore: 89,
                reasoning: 'Creates immediate urgency while highlighting social proof and scarcity',
                tone: 'urgent'
              },
              {
                id: 'copy-2',
                headline: 'Join 50,000+ Happy Customers',
                bodyText: 'See why industry leaders and everyday heroes choose [product] to achieve their goals. Trusted by professionals worldwide.',
                callToAction: 'Join the Community',
                subheadline: 'Rated #1 by customers',
                motivationId: 'mot-2', // Social Proof
                confidenceScore: 85,
                reasoning: 'Leverages social validation and peer approval to build trust',
                tone: 'professional'
              },
              {
                id: 'copy-3',
                headline: 'Transform Your [Goal] in 30 Days',
                bodyText: 'Unlock your potential and achieve the results you\'ve always dreamed of. Your future self will thank you.',
                callToAction: 'Start Your Journey',
                subheadline: 'Results guaranteed',
                motivationId: 'mot-3', // Aspirational
                confidenceScore: 82,
                reasoning: 'Appeals to personal growth and future-focused thinking',
                tone: 'emotional'
              },
              {
                id: 'copy-4',
                headline: 'Recommended by Top Experts',
                bodyText: 'Leading professionals trust [product] for their most important projects. Experience the difference expertise makes.',
                callToAction: 'Get Expert Results',
                subheadline: 'Professionally endorsed',
                motivationId: 'mot-4', // Authority
                confidenceScore: 87,
                reasoning: 'Builds credibility through expert endorsement and authority',
                tone: 'authoritative'
              },
              {
                id: 'copy-5',
                headline: 'Exclusive Access for VIP Members',
                bodyText: 'You\'re invited to experience [product] before anyone else. This exclusive offer is reserved for select individuals.',
                callToAction: 'Access VIP Offer',
                subheadline: 'Invitation only',
                motivationId: 'mot-5', // Exclusivity
                confidenceScore: 83,
                reasoning: 'Creates sense of exclusivity and special treatment',
                tone: 'professional'
              },
              {
                id: 'copy-6',
                headline: 'Finally, A Solution That Actually Works',
                bodyText: 'Stop struggling with [problem]. Our proven solution eliminates the frustration and delivers real results.',
                callToAction: 'Solve This Today',
                subheadline: 'End the struggle now',
                motivationId: 'mot-6', // Problem Solution
                confidenceScore: 91,
                reasoning: 'Directly addresses pain points and offers clear resolution',
                tone: 'friendly'
              }
            ];

            // Filter variations based on selected motivations
            const filteredVariations = mockCopyVariations.filter(variation => 
              request.selectedMotivations.includes(variation.motivationId)
            );

            set({ 
              generatedCopyVariations: filteredVariations, 
              isGenerating: false, 
              error: null 
            });
            return;
          }

          // Production API call would go here
          const response = await fetch('/.netlify/functions/generate-copy', {
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
            throw new Error(data.error || 'Failed to generate copy');
          }

          set({ 
            generatedCopyVariations: data.copyVariations, 
            isGenerating: false, 
            error: null 
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({ 
            generatedCopyVariations: [], 
            isGenerating: false, 
            error: errorMessage 
          });
        }
      },

      // Select copy variation
      selectCopy: (variation: CopyVariation) => {
        const selectedCopy: SelectedCopy = {
          headline: variation.headline,
          bodyText: variation.bodyText,
          callToAction: variation.callToAction,
          subheadline: variation.subheadline,
          motivationId: variation.motivationId,
          variationId: variation.id,
        };
        set({ selectedCopy });
      },

      // Update selected copy with custom edits
      updateSelectedCopy: (updates: Partial<SelectedCopy>) => {
        const { selectedCopy } = get();
        if (selectedCopy) {
          set({ selectedCopy: { ...selectedCopy, ...updates } });
        }
      },

      // Clear selected copy
      clearSelectedCopy: () => {
        set({ selectedCopy: null });
      },

      // Clear generated copy
      clearGeneratedCopy: () => {
        set({ generatedCopyVariations: [], selectedCopy: null });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'copy-storage',
      partialize: (state) => ({
        generatedCopyVariations: state.generatedCopyVariations,
        selectedCopy: state.selectedCopy,
        lastRequest: state.lastRequest,
      }),
    }
  )
);