import React, { Suspense, lazy } from 'react';

/**
 * Lazy-loaded components for code splitting and performance optimization
 *
 * Benefits:
 * - Reduces initial bundle size
 * - Faster initial page load
 * - Components loaded on-demand
 * - Better user experience with loading states
 */

// Loading component for Suspense fallback
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
      <span className="text-white">{message}</span>
    </div>
  </div>
);

// Lazy-loaded components
export const LazyAssetManager = lazy(() =>
  import('../assets/AssetManager').then(module => ({ default: module.AssetManager }))
);

export const LazyConfigurationManager = lazy(() =>
  import('../configuration/ConfigurationManager').then(module => ({
    default: module.ConfigurationManager,
  }))
);

export const LazyTerritoryOutput = lazy(() =>
  import('../territory/TerritoryOutput').then(module => ({ default: module.TerritoryOutput }))
);

export const LazyConfidenceScoring = lazy(() =>
  import('../ConfidenceScoring').then(module => ({ default: module.ConfidenceScoring }))
);

export const LazyTestEnhancedSystem = lazy(() => import('../../test-enhanced-system'));

// HOC for wrapping components with Suspense
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
  errorBoundary?: boolean
) {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Pre-configured lazy components with loading states
export const AssetManagerWithSuspense = withSuspense(
  LazyAssetManager,
  <LoadingSpinner message="Loading Asset Manager..." />
);

export const ConfigurationManagerWithSuspense = withSuspense(
  LazyConfigurationManager,
  <LoadingSpinner message="Loading Configuration..." />
);

export const TerritoryOutputWithSuspense = withSuspense(
  LazyTerritoryOutput,
  <LoadingSpinner message="Loading Territory Output..." />
);

export const ConfidenceScoringWithSuspense = withSuspense(
  LazyConfidenceScoring,
  <LoadingSpinner message="Loading Confidence Analysis..." />
);

export const TestEnhancedSystemWithSuspense = withSuspense(
  LazyTestEnhancedSystem,
  <LoadingSpinner message="Loading Enhanced System Test..." />
);

// Preload functions for better UX
export const preloadAssetManager = () => {
  const componentImport = import('../assets/AssetManager');
  return componentImport;
};

export const preloadConfigurationManager = () => {
  const componentImport = import('../configuration/ConfigurationManager');
  return componentImport;
};

export const preloadTerritoryOutput = () => {
  const componentImport = import('../territory/TerritoryOutput');
  return componentImport;
};

// Hook for preloading components on user interaction
export function usePreloadComponents() {
  const preloadAll = React.useCallback(() => {
    preloadAssetManager();
    preloadConfigurationManager();
    preloadTerritoryOutput();
  }, []);

  const preloadOnHover = React.useCallback(
    (componentName: string) => {
      switch (componentName) {
        case 'assets':
          preloadAssetManager();
          break;
        case 'configuration':
          preloadConfigurationManager();
          break;
        case 'territory':
          preloadTerritoryOutput();
          break;
        default:
          preloadAll();
      }
    },
    [preloadAll]
  );

  return { preloadAll, preloadOnHover };
}

export default {
  AssetManagerWithSuspense,
  ConfigurationManagerWithSuspense,
  TerritoryOutputWithSuspense,
  ConfidenceScoringWithSuspense,
  TestEnhancedSystemWithSuspense,
  withSuspense,
  usePreloadComponents,
};
