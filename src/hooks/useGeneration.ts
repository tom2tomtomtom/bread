import { useState, useCallback } from 'react';
import { generateWithOpenAI } from '../services/secureApiService';
import { analyzeBrief, enhanceGeneratedOutput, mergeWithStarredContent } from '../services/enhancementService';
import { StarredItems, Prompts } from '../types';

interface UseGenerationProps {
  prompts: Prompts;
  generateImages: boolean;
  starredItems: StarredItems;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const useGeneration = ({ 
  prompts, 
  generateImages, 
  starredItems, 
  onShowToast 
}: UseGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [generatedOutput, setGeneratedOutput] = useState<any | null>(null);
  const [error, setError] = useState<string>('');
  const [showBriefAnalysis, setShowBriefAnalysis] = useState<boolean>(false);
  const [briefAnalysis, setBriefAnalysis] = useState<any | null>(null);

  const handleGenerate = useCallback(async (brief: string, regenerateMode: boolean = false) => {
    if (!brief.trim()) {
      setError('Please enter a brief before generating.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setShowOutput(false);

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
      
      onShowToast('Creative territories generated successfully! 🎉', 'success');
      console.log('✅ Generation completed successfully');

    } catch (error: any) {
      console.error('❌ Generation failed:', error);
      setError(`Generation failed: ${error.message}`);
      onShowToast(`Generation failed: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [prompts, generateImages, starredItems, generatedOutput, onShowToast]);

  const handleNewBrief = useCallback(() => {
    setShowOutput(false);
    setGeneratedOutput(null);
    setShowBriefAnalysis(false);
    setBriefAnalysis(null);
    setError('');
  }, []);

  const handleRegenerateUnstarred = useCallback((brief: string) => {
    handleGenerate(brief, true);
  }, [handleGenerate]);

  return {
    // State
    isGenerating,
    showOutput,
    generatedOutput,
    error,
    showBriefAnalysis,
    briefAnalysis,
    
    // Actions
    handleGenerate,
    handleNewBrief,
    handleRegenerateUnstarred,
    
    // Setters for external control
    setShowBriefAnalysis
  };
};
