import React from 'react';
import { EnhancedFeaturesDemo } from './components/demo/EnhancedFeaturesDemo';

// Simple test component to verify enhanced features work
export const TestEnhancedFeatures: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <EnhancedFeaturesDemo />
    </div>
  );
};

export default TestEnhancedFeatures;
