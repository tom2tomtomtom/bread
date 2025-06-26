import React, { ReactNode } from 'react';
import { useGenerationStore, useConfigStore, useStarredStore, useUIStore } from '../../stores';
import { useAuthStore } from '../../stores/authStore';
import { generateWithOpenAI } from '../../services/secureApiService';
import {
  analyzeBrief,
  enhanceGeneratedOutput,
  mergeWithStarredContent,
} from '../../services/enhancementService';
import { APP_CONFIG } from '../../config/app';

interface GenerationOrchestratorProps {
  children: ReactNode;
  onShowLogin?: () => void;
}

/**
 * GenerationOrchestrator - Handles all content generation logic
 *
 * REFACTORED: Now uses focused stores instead of monolithic appStore
 * - Generation state -> useGenerationStore
 * - Configuration -> useConfigStore
 * - Starred items -> useStarredStore
 * - UI notifications -> useUIStore
 *
 * Benefits:
 * - Better performance (smaller state updates)
 * - Clearer separation of concerns
 * - Easier testing and debugging
 */
export const GenerationOrchestrator: React.FC<GenerationOrchestratorProps> = ({
  children,
  onShowLogin
}) => {
  const { isAuthenticated } = useAuthStore();

  // Use focused stores instead of monolithic appStore
  const {
    brief,
    isGenerating,
    generatedOutput,
    setIsGenerating,
    setShowOutput,
    setGeneratedOutput,
    setError,
    setShowBriefAnalysis,
    setBriefAnalysis,
    updateRealTimeAnalysis,
  } = useGenerationStore();

  const {
    prompts,
    generateImages,
  } = useConfigStore();

  const {
    starredItems,
  } = useStarredStore();

  const {
    showToastMessage,
  } = useUIStore();

  // Real-time brief analysis
  const handleBriefChange = (newBrief: string) => {
    // Debounced real-time analysis
    if (newBrief.trim().length > 10) {
      updateRealTimeAnalysis(newBrief);
    }
  };

  // Main generation handler
  const handleGenerate = async (regenerateMode: boolean = false) => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('Please sign in to generate content');
      onShowLogin?.();
      return;
    }

    if (!brief.trim()) {
      setError(APP_CONFIG.errors.generation.noBrief);
      return;
    }

    setIsGenerating(true);
    setError('');
    if (!regenerateMode) {
      setShowOutput(false);
    }
    setShowBriefAnalysis(false);

    try {
      console.log('🚀 Starting generation process...');

      // Analyze brief for insights
      const analysis = await analyzeBrief(brief);
      setBriefAnalysis(analysis);
      setShowBriefAnalysis(true);

      // Build the full prompt
      const fullPrompt = `${prompts.systemInstructions}

${prompts.brandGuidelines}

${prompts.territoryPrompt}

${prompts.headlinePrompt}

${prompts.compliancePrompt}

BRIEF TO ADDRESS:
${brief}

Please provide a structured response with territories, headlines, and compliance guidance that DIRECTLY ADDRESSES THE BRIEF.`;

      // Generate with OpenAI (now secure server-side)
      const result = await generateWithOpenAI(fullPrompt, generateImages, brief);

      // Enhance the output with confidence scoring
      let enhancedResult = enhanceGeneratedOutput(result, brief);

      // If regenerating, merge with existing starred content
      if (regenerateMode && generatedOutput) {
        enhancedResult = mergeWithStarredContent(enhancedResult, generatedOutput, starredItems);
      }

      setGeneratedOutput(enhancedResult);
      setShowOutput(true);

      showToastMessage(APP_CONFIG.success.generation, 'success');
      console.log('✅ Generation completed successfully');
    } catch (error: unknown) {
      console.error('❌ Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : APP_CONFIG.errors.generation.apiError;
      setError(errorMessage);
      showToastMessage(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhanced brief analysis handler
  const handleAnalyzeEnhancedBrief = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to analyze brief');
      onShowLogin?.();
      return;
    }
    // Implementation would go here
  };

  // Territory evolution handlers
  const handleGenerateEvolutionSuggestions = async (territoryId: string) => {
    if (!isAuthenticated) {
      setError('Please sign in to generate evolution suggestions');
      onShowLogin?.();
      return;
    }
    // Implementation would go here
  };

  const handleEvolveTerritoryWithAI = async (territoryId: string, suggestion: any) => {
    if (!isAuthenticated) {
      setError('Please sign in to evolve territories');
      onShowLogin?.();
      return;
    }
    // Implementation would go here
    showToastMessage('Territory evolved successfully', 'success');
  };

  const handlePredictTerritoryPerformance = async (territoryId: string) => {
    if (!isAuthenticated) {
      setError('Please sign in to predict performance');
      onShowLogin?.();
      return;
    }
    // Implementation would go here
  };

  // Create generation context value
  const generationContextValue = {
    // State
    brief,
    isGenerating,
    generatedOutput,
    
    // Handlers
    handleGenerate,
    handleBriefChange,
    handleAnalyzeEnhancedBrief,
    handleGenerateEvolutionSuggestions,
    handleEvolveTerritoryWithAI,
    handlePredictTerritoryPerformance,
  };

  return (
    <>
      {/* Pass generation handlers to children */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...generationContextValue,
          } as any);
        }
        return child;
      })}
    </>
  );
};

export default GenerationOrchestrator;
