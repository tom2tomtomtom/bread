import React, { useState, ReactNode } from 'react';
import { useAppStore } from '../../stores/appStore';

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

  // Global UI state from store
  const {
    // UI State
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
    
    // UI Actions
    setShowAdmin,
    setShowAssets,
    setShowOutput,
    setShowBriefAnalysis,
    setShowEnhancedAnalysis,
    setShowEvolutionPanel,
    hideToast,
    setError,
    resetGeneration,
    clearStarredItems,
  } = useAppStore();

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
    showOutput,
    showBriefAnalysis,
    showEnhancedAnalysis,
    showEvolutionPanel,
    showToast,
    toastMessage,
    toastType,
    error,
  } = useAppStore();

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
