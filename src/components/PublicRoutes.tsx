import React from 'react';
import { LandingPage } from '../pages';

// This component is now simplified - LandingPage handles auth state internally
export const PublicRoutes: React.FC = () => {
  return <LandingPage />;
};
