import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProviders } from './components/providers';
import { StoreHealthCheck } from './components/StoreHealthCheck';
import { migrateFromAppStore, isMigrationComplete } from './stores/migration';
import { AppRoutes } from './components/AppRoutes';

export type {
  Headline,
  Territory,
  ComplianceData,
  GeneratedOutput,
  Prompts,
  ApiKeys,
} from './types';

const BreadApp: React.FC = () => {
  useEffect(() => {
    if (!isMigrationComplete()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Initializing store migration...');
      }
      migrateFromAppStore();
    } else if (process.env.NODE_ENV === 'development') {
      console.log('✅ Store migration already complete');
    }
  }, []);

  return (
    <AppProviders>
      <Router>
        <AppRoutes />
        {process.env.NODE_ENV === 'development' && <StoreHealthCheck />}
      </Router>
    </AppProviders>
  );
};

export default BreadApp;