import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CampaignTemplate,
  CampaignTemplateType,
  TemplateRecommendation,
  TemplateSelectionState,
  TemplateCustomization,
  TemplatePerformanceData,
  TemplateUsageRecord,
  ValidationResult,
  PreviewAsset,
  ChannelFormat,
  RequiredInput,
  OptionalInput,
} from '../types';

interface TemplateState {
  // Template selection and management
  availableTemplates: CampaignTemplate[];
  templateRecommendations: TemplateRecommendation[];
  templateSelection: TemplateSelectionState;
  isLoadingTemplates: boolean;
  isGeneratingRecommendations: boolean;
  showTemplateSelector: boolean;

  // Template usage tracking
  templateUsageHistory: {
    [templateId: string]: TemplateUsageRecord[];
  };

  // Template performance
  templatePerformance: {
    [templateId: string]: TemplatePerformanceData;
  };

  // Actions
  loadAvailableTemplates: () => Promise<void>;
  generateTemplateRecommendations: (brief?: string) => Promise<void>;
  selectTemplate: (templateId: string) => void;
  updateTemplateCustomization: (field: string, value: any) => void;
  validateTemplateCustomizations: () => ValidationResult[];
  generateTemplatePreview: (channels: ChannelFormat[]) => Promise<void>;
  setShowTemplateSelector: (show: boolean) => void;
  clearTemplateSelection: () => void;
  saveTemplateConfiguration: () => Promise<void>;
  getTemplatePerformanceInsights: (templateId: string) => any;
  optimizeTemplate: (templateId: string, performanceData: any, feedback: string[]) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      // Initial state
      availableTemplates: [],
      templateRecommendations: [],
      templateSelection: {
        selectedTemplate: null,
        customizations: [],
        validationResults: [],
        previewAssets: [],
        customizationProgress: 0,
        isCustomizing: false,
        lastModified: new Date().toISOString(),
      },
      isLoadingTemplates: false,
      isGeneratingRecommendations: false,
      showTemplateSelector: false,
      templateUsageHistory: {},
      templatePerformance: {},

      // Actions
      loadAvailableTemplates: async () => {
        set({ isLoadingTemplates: true });
        try {
          // Mock template loading - will be replaced with actual API call
          set({ availableTemplates: [], isLoadingTemplates: false });
        } catch (error) {
          console.error('Failed to load templates:', error);
          set({ isLoadingTemplates: false });
        }
      },

      generateTemplateRecommendations: async (brief?: string) => {
        set({ isGeneratingRecommendations: true });
        try {
          // Mock recommendation generation - will be replaced with actual API call
          set({ templateRecommendations: [], isGeneratingRecommendations: false });
        } catch (error) {
          console.error('Failed to generate recommendations:', error);
          set({ isGeneratingRecommendations: false });
        }
      },

      selectTemplate: (templateId: string) => {
        const { availableTemplates } = get();
        const template = availableTemplates.find(t => t.id === templateId);

        if (template) {
          set(state => ({
            templateSelection: {
              ...state.templateSelection,
              selectedTemplate: template,
              customizations: [],
              validationResults: [],
              previewAssets: [],
              customizationProgress: 0,
              isCustomizing: true,
              lastModified: new Date().toISOString(),
            },
          }));
        }
      },

      updateTemplateCustomization: (field: string, value: any) => {
        set(state => {
          const existingCustomization = state.templateSelection.customizations.find(
            c => c.field === field
          );

          let updatedCustomizations: TemplateCustomization[];

          if (existingCustomization) {
            updatedCustomizations = state.templateSelection.customizations.map(c =>
              c.field === field ? { ...c, value, isValid: true } : c
            );
          } else {
            updatedCustomizations = [
              ...state.templateSelection.customizations,
              { field, value, isValid: true, brandAlignment: 85 },
            ];
          }

          return {
            templateSelection: {
              ...state.templateSelection,
              customizations: updatedCustomizations,
              customizationProgress: Math.min(
                (updatedCustomizations.length /
                  (state.templateSelection.selectedTemplate?.templateConfiguration.requiredInputs
                    .length || 1)) *
                  100,
                100
              ),
              lastModified: new Date().toISOString(),
            },
          };
        });
      },

      validateTemplateCustomizations: () => {
        const { templateSelection } = get();
        if (!templateSelection.selectedTemplate) return [];

        // Simplified validation - will be enhanced with actual templateService
        const validationResults: ValidationResult[] = [];

        templateSelection.selectedTemplate.templateConfiguration.requiredInputs.forEach(input => {
          const customization = templateSelection.customizations.find(c => c.field === input.field);
          if (!customization || !customization.value) {
            validationResults.push({
              field: input.field,
              isValid: false,
              message: `${input.field} is required`,
              severity: 'error',
            });
          }
        });

        set(state => ({
          templateSelection: {
            ...state.templateSelection,
            validationResults,
          },
        }));

        return validationResults;
      },

      generateTemplatePreview: async (channels: ChannelFormat[]) => {
        const { templateSelection } = get();
        if (!templateSelection.selectedTemplate) return;

        try {
          // Mock preview generation - will be replaced with actual service call
          const previewAssets: PreviewAsset[] = [];

          set(state => ({
            templateSelection: {
              ...state.templateSelection,
              previewAssets,
            },
          }));
        } catch (error) {
          console.error('Failed to generate preview:', error);
        }
      },

      setShowTemplateSelector: (show: boolean) => {
        set({ showTemplateSelector: show });
      },

      clearTemplateSelection: () => {
        set(state => ({
          templateSelection: {
            selectedTemplate: null,
            customizations: [],
            validationResults: [],
            previewAssets: [],
            customizationProgress: 0,
            isCustomizing: false,
            lastModified: new Date().toISOString(),
          },
        }));
      },

      saveTemplateConfiguration: async () => {
        const { templateSelection } = get();
        if (!templateSelection.selectedTemplate) return;

        try {
          // Mock save - will be replaced with actual backend call
          console.log('Saving template configuration:', templateSelection);

          // Update usage history - simplified for now
          console.log('Template configuration saved successfully');
        } catch (error) {
          console.error('Failed to save template configuration:', error);
        }
      },

      getTemplatePerformanceInsights: (templateId: string) => {
        const { templatePerformance } = get();
        return templatePerformance[templateId] || null;
      },

      optimizeTemplate: async (templateId: string, performanceData: any, feedback: string[]) => {
        try {
          // Mock optimization - will be replaced with AI service call
          console.log('Optimizing template:', templateId, performanceData, feedback);

          set(state => ({
            templatePerformance: {
              ...state.templatePerformance,
              [templateId]: {
                ...state.templatePerformance[templateId],
                lastOptimization: new Date().toISOString(),
                optimizationSuggestions: feedback,
              },
            },
          }));
        } catch (error) {
          console.error('Failed to optimize template:', error);
        }
      },
    }),
    {
      name: 'template-store',
      partialize: state => ({
        templateUsageHistory: state.templateUsageHistory,
        templatePerformance: state.templatePerformance,
        templateSelection: state.templateSelection,
      }),
    }
  )
);
