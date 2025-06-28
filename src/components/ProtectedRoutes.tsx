import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './auth';
import { DashboardPage, BriefPage, GeneratePage, ResultsPage } from '../pages';
import { LandingPage } from '../pages/LandingPage';

export const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Legacy routes - keep for backward compatibility */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brief"
        element={
          <ProtectedRoute>
            <BriefPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/generate"
        element={
          <ProtectedRoute>
            <GeneratePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        }
      />

      {/* All other routes redirect to main integrated experience */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};
