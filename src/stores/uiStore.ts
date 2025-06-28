import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToastType } from '../types';
import { APP_CONFIG } from '../config/app';

/**
 * UIStore - Focused store for UI state management
 *
 * Responsibilities:
 * - Modal and panel visibility
 * - Toast notifications
 * - Loading states
 * - UI preferences
 *
 * Benefits:
 * - Centralized UI state management
 * - Easy to test UI interactions
 * - Better performance (UI updates don't affect business logic)
 * - Clear separation between UI and business logic
 */

interface UIState {
  // Panel visibility
  showAdmin: boolean;
  showAssets: boolean;
  showEvolutionPanel: boolean;
  showTemplateSelector: boolean;

  // Toast notifications
  showToast: boolean;
  toastMessage: string;
  toastType: ToastType;

  // Loading states (UI-specific)
  isLoadingTemplates: boolean;
  isGeneratingRecommendations: boolean;

  // UI preferences
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  compactMode: boolean;

  // Actions
  setShowAdmin: (show: boolean) => void;
  setShowAssets: (show: boolean) => void;
  setShowEvolutionPanel: (show: boolean) => void;
  setShowTemplateSelector: (show: boolean) => void;

  // Toast actions
  showToastMessage: (message: string, type: ToastType) => void;
  hideToast: () => void;

  // Loading state actions
  setIsLoadingTemplates: (loading: boolean) => void;
  setIsGeneratingRecommendations: (generating: boolean) => void;

  // UI preference actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCompactMode: (compact: boolean) => void;

  // Utility actions
  closeAllPanels: () => void;
  resetUI: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      showAdmin: false,
      showAssets: false,
      showEvolutionPanel: false,
      showTemplateSelector: false,

      showToast: false,
      toastMessage: '',
      toastType: 'success',

      isLoadingTemplates: false,
      isGeneratingRecommendations: false,

      theme: 'auto',
      sidebarCollapsed: false,
      compactMode: false,

      // Panel visibility actions
      setShowAdmin: (showAdmin: boolean) => set({ showAdmin }),
      setShowAssets: (showAssets: boolean) => set({ showAssets }),
      setShowEvolutionPanel: (showEvolutionPanel: boolean) => set({ showEvolutionPanel }),
      setShowTemplateSelector: (showTemplateSelector: boolean) => set({ showTemplateSelector }),

      // Toast actions
      showToastMessage: (message: string, type: ToastType) => {
        set({
          showToast: true,
          toastMessage: message,
          toastType: type,
        });

        // Auto-hide toast after configured duration
        setTimeout(() => {
          set({ showToast: false });
        }, APP_CONFIG.ui.toastDuration);
      },

      hideToast: () =>
        set({
          showToast: false,
          toastMessage: '',
          toastType: 'success',
        }),

      // Loading state actions
      setIsLoadingTemplates: (isLoadingTemplates: boolean) => set({ isLoadingTemplates }),
      setIsGeneratingRecommendations: (isGeneratingRecommendations: boolean) =>
        set({ isGeneratingRecommendations }),

      // UI preference actions
      setTheme: (theme: 'light' | 'dark' | 'auto') => set({ theme }),
      setSidebarCollapsed: (sidebarCollapsed: boolean) => set({ sidebarCollapsed }),
      setCompactMode: (compactMode: boolean) => set({ compactMode }),

      // Utility actions
      closeAllPanels: () =>
        set({
          showAdmin: false,
          showAssets: false,
          showEvolutionPanel: false,
          showTemplateSelector: false,
        }),

      resetUI: () =>
        set({
          showAdmin: false,
          showAssets: false,
          showEvolutionPanel: false,
          showTemplateSelector: false,
          showToast: false,
          toastMessage: '',
          toastType: 'success',
          isLoadingTemplates: false,
          isGeneratingRecommendations: false,
          theme: 'auto',
          sidebarCollapsed: false,
          compactMode: false,
        }),
    }),
    {
      name: `${APP_CONFIG.storage.keys.appState}-ui`,
      partialize: state => ({
        // Persist only user preferences
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        compactMode: state.compactMode,
      }),
    }
  )
);
