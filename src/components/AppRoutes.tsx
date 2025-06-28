import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';

export const AppRoutes: React.FC = () => (
  <Routes>
    {/* Main route - integrated workflow experience */}
    <Route path="/" element={<LandingPage />} />
    {/* All other routes redirect to main */}
    <Route path="/*" element={<LandingPage />} />
  </Routes>
);