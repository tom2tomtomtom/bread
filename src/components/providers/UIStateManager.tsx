import React, { useState, ReactNode } from 'react';
import { useUIStore, useGenerationStore, useStarredStore } from '../../stores';

interface UIStateManagerProps {
  children: ReactNode;
}

/**
 * UIStateManager - Handles all UI state and interactions
 * Responsibilities:
 * - Modal and panel visibility
 * - Asset selection state
 * - UI interaction handlers
 * - Toast notifications
 * - Admin panel state
 */
export const UIStateManager: React.FC<UIStateManagerProps> = ({ children }) => {
  // Local UI state
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // Use focused stores instead of monolithic appStore
  const {
    // UI State
    showAdmin,
    showAssets,
    showEvolutionPanel,
    showToast,
    toastMessage,
    toastType,

    // UI Actions
    setShowAdmin,
    setShowAssets,
    setShowEvolutionPanel,
    hideToast,
  } = useUIStore();

  const {
    // Generation UI state
    showOutput,
    showBriefAnalysis,
    showEnhancedAnalysis,
    error,

    // Generation UI actions
    setShowOutput,
    setShowBriefAnalysis,
    setShowEnhancedAnalysis,
    setError,
    resetGeneration,
  } = useGenerationStore();

  const {
    // Starred actions
    clearStarredItems,
  } = useStarredStore();

  // UI Event Handlers
  const handleAdminToggle = () => {
    setShowAdmin(!showAdmin);
  };

  const handleShowAssets = () => {
    setShowAssets(true);
  };

  const handleCloseAssets = () => {
    setShowAssets(false);
  };

  const handleNewBrief = () => {
    if (window.confirm('Are you sure you want to start a new brief? This will clear all current results.')) {
      resetGeneration();
      clearStarredItems();
    }
  };

  const handleBriefAnalysisToggle = () => {
    setShowBriefAnalysis(!showBriefAnalysis);
  };

  const handleEnhancedAnalysisToggle = () => {
    setShowEnhancedAnalysis(!showEnhancedAnalysis);
  };

  const handleEvolutionPanelToggle = () => {
    setShowEvolutionPanel(!showEvolutionPanel);
  };

  const handleAssetsChange = (assets: string[]) => {
    setSelectedAssets(assets);
  };

  const handleToastClose = () => {
    hideToast();
  };

  const handleErrorDismiss = () => {
    setError('');
  };

  // Moment selection handler
  const handleMomentSelect = (moment: { name: string; date: string }) => {
    const momentText = `\n\n📅 CAMPAIGN MOMENT: ${moment.name} (${moment.date})`;
    // This would need to be passed up to the brief handler
    return momentText;
  };

  // Create UI context value
  const uiContextValue = {
    // State
    selectedAssets,
    showAdmin,
    showAssets,
    showOutput,
    showBriefAnalysis,
    showEnhancedAnalysis,
    showEvolutionPanel,
    showToast,
    toastMessage,
    toastType,
    error,
    
    // Handlers
    handleAdminToggle,
    handleShowAssets,
    handleCloseAssets,
    handleNewBrief,
    handleBriefAnalysisToggle,
    handleEnhancedAnalysisToggle,
    handleEvolutionPanelToggle,
    handleAssetsChange,
    handleToastClose,
    handleErrorDismiss,
    handleMomentSelect,
  };

  return (
    <>
      {/* Pass UI state and handlers to children */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...uiContextValue,
          } as any);
        }
        return child;
      })}
    </>
  );
};

// Hook for accessing UI state in child components
export const useUIState = () => {
  const {
    showAdmin,
    showAssets,
    showEvolutionPanel,
    showToast,
    toastMessage,
    toastType,
  } = useUIStore();

  const {
    showOutput,
    showBriefAnalysis,
    showEnhancedAnalysis,
    error,
  } = useGenerationStore();

  return {
    showAdmin,
    showAssets,
    showOutput,
    showBriefAnalysis,
    showEnhancedAnalysis,
    showEvolutionPanel,
    showToast,
    toastMessage,
    toastType,
    error,
  };
};

export default UIStateManager;
