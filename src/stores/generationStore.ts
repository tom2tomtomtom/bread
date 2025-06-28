import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  EnhancedGeneratedOutput,
  BriefAnalysis,
  EnhancedBriefAnalysis,
  RealTimeAnalysis,
} from '../types';
import { APP_CONFIG } from '../config/app';

/**
 * GenerationStore - Focused store for brief generation and output management
 * 
 * Responsibilities:
 * - Brief content management
 * - Generation state tracking
 * - Output management
 * - Brief analysis (basic and enhanced)
 * - Real-time analysis
 * 
 * Benefits:
 * - Single responsibility principle
 * - Easier testing and debugging
 * - Better performance (smaller state updates)
 * - Clear separation of concerns
 */

interface GenerationState {
  // Brief and generation state
  brief: string;
  isGenerating: boolean;
  showOutput: boolean;
  generatedOutput: EnhancedGeneratedOutput | null;
  error: string;
  
  // Basic brief analysis
  showBriefAnalysis: boolean;
  briefAnalysis: BriefAnalysis | null;

  // Enhanced Brief Intelligence state
  enhancedBriefAnalysis: EnhancedBriefAnalysis | null;
  isAnalyzingBrief: boolean;
  realTimeAnalysis: RealTimeAnalysis | null;
  showEnhancedAnalysis: boolean;

  // Actions
  setBrief: (brief: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setShowOutput: (show: boolean) => void;
  setGeneratedOutput: (output: EnhancedGeneratedOutput | null) => void;
  setError: (error: string) => void;
  
  // Core generation function
  generate: () => Promise<void>;
  
  // Basic brief analysis actions
  setShowBriefAnalysis: (show: boolean) => void;
  setBriefAnalysis: (analysis: BriefAnalysis | null) => void;

  // Enhanced Brief Intelligence actions
  setEnhancedBriefAnalysis: (analysis: EnhancedBriefAnalysis | null) => void;
  setIsAnalyzingBrief: (analyzing: boolean) => void;
  setRealTimeAnalysis: (analysis: RealTimeAnalysis | null) => void;
  setShowEnhancedAnalysis: (show: boolean) => void;
  analyzeEnhancedBrief: () => Promise<void>;
  updateRealTimeAnalysis: (brief: string) => void;

  // Reset functions
  resetGeneration: () => void;
  resetAll: () => void;
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      // Initial state
      brief: '',
      isGenerating: false,
      showOutput: false,
      generatedOutput: null,
      error: '',
      showBriefAnalysis: false,
      briefAnalysis: null,

      // Enhanced Brief Intelligence initial state
      enhancedBriefAnalysis: null,
      isAnalyzingBrief: false,
      realTimeAnalysis: null,
      showEnhancedAnalysis: false,

      // Basic actions
      setBrief: (brief: string) => set({ brief }),
      setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
      setShowOutput: (showOutput: boolean) => set({ showOutput }),
      setGeneratedOutput: (generatedOutput: EnhancedGeneratedOutput | null) => 
        set({ generatedOutput }),
      setError: (error: string) => set({ error }),

      // Core generation function
      generate: async () => {
        const { brief } = get();
        if (!brief.trim()) {
          set({ error: 'Please enter a brief before generating' });
          return;
        }

        set({ isGenerating: true, error: '', showOutput: false });

        try {
          // Import the API service
          const { generateWithOpenAI } = await import('../services/secureApiService');
          
          // Generate territories using the secure API
          const result = await generateWithOpenAI(brief);
          
          // Convert GeneratedOutput to EnhancedGeneratedOutput
          const enhancedResult: EnhancedGeneratedOutput = {
            ...result,
            overallConfidence: 85, // Default confidence score
            territories: result.territories.map(territory => ({
              ...territory,
              confidence: {
                marketFit: 80,
                complianceConfidence: 85,
                audienceResonance: 82,
                riskLevel: 'LOW' as const,
              },
            })),
            metadata: {
              generatedAt: new Date(),
              model: 'OpenAI GPT-4',
              processingTime: 0,
            },
          };
          
          set({ 
            generatedOutput: enhancedResult,
            showOutput: true,
            isGenerating: false 
          });
          
        } catch (error) {
          console.error('Generation failed:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Generation failed. Please try again.',
            isGenerating: false 
          });
        }
      },

      // Basic brief analysis actions
      setShowBriefAnalysis: (showBriefAnalysis: boolean) => set({ showBriefAnalysis }),
      setBriefAnalysis: (briefAnalysis: BriefAnalysis | null) => set({ briefAnalysis }),

      // Enhanced Brief Intelligence actions
      setEnhancedBriefAnalysis: (enhancedBriefAnalysis: EnhancedBriefAnalysis | null) => 
        set({ enhancedBriefAnalysis }),
      setIsAnalyzingBrief: (isAnalyzingBrief: boolean) => set({ isAnalyzingBrief }),
      setRealTimeAnalysis: (realTimeAnalysis: RealTimeAnalysis | null) => 
        set({ realTimeAnalysis }),
      setShowEnhancedAnalysis: (showEnhancedAnalysis: boolean) => 
        set({ showEnhancedAnalysis }),

      analyzeEnhancedBrief: async () => {
        const { brief } = get();
        if (!brief.trim()) return;

        set({ isAnalyzingBrief: true, error: '' });

        try {
          // TODO: Implement enhanced brief analysis API call
          // This would call the enhanced brief intelligence service
          console.log('Enhanced brief analysis not yet implemented');
          
          // Mock implementation for now
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({
            enhancedBriefAnalysis: {
              overallScore: 80,
              categoryScores: {
                strategicClarity: { score: 80, reasoning: 'Good strategic focus', improvements: [] },
                audienceDefinition: { score: 75, reasoning: 'Clear audience targeting', improvements: [] },
                competitiveContext: { score: 70, reasoning: 'Some competitive context', improvements: [] },
                culturalRelevance: { score: 85, reasoning: 'Culturally appropriate', improvements: [] },
                executionClarity: { score: 80, reasoning: 'Clear execution path', improvements: [] },
                practicalConstraints: { score: 75, reasoning: 'Realistic constraints', improvements: [] },
              },
              missingElements: [],
              improvementSuggestions: [],
              strategicGaps: [],
              culturalInsights: [],
              competitiveOpportunities: [],
              analysisTimestamp: new Date(),
              confidence: 80,
            },
            isAnalyzingBrief: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Analysis failed',
            isAnalyzingBrief: false,
          });
        }
      },

      updateRealTimeAnalysis: (brief: string) => {
        // Debounced real-time analysis
        // TODO: Implement real-time analysis logic
        console.log('Real-time analysis update for:', brief.substring(0, 50));
      },

      // Reset functions
      resetGeneration: () =>
        set({
          brief: '',
          isGenerating: false,
          showOutput: false,
          generatedOutput: null,
          error: '',
          showBriefAnalysis: false,
          briefAnalysis: null,
        }),

      resetAll: () =>
        set({
          brief: '',
          isGenerating: false,
          showOutput: false,
          generatedOutput: null,
          error: '',
          showBriefAnalysis: false,
          briefAnalysis: null,
          enhancedBriefAnalysis: null,
          isAnalyzingBrief: false,
          realTimeAnalysis: null,
          showEnhancedAnalysis: false,
        }),
    }),
    {
      name: `${APP_CONFIG.storage.keys.appState}-generation`,
      partialize: (state) => ({
        // Persist only essential data
        brief: state.brief,
        generatedOutput: state.generatedOutput,
        briefAnalysis: state.briefAnalysis,
        enhancedBriefAnalysis: state.enhancedBriefAnalysis,
      }),
    }
  )
);
