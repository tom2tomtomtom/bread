import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './auth';
import { useAuthStore } from '../stores/authStore';
import { DashboardPage, BriefPage, GeneratePage, ResultsPage } from '../pages';
import { WorkflowPage } from '../pages/WorkflowPage';

export const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* New workflow route - primary path for ad creation */}
      <Route
        path="/workflow"
        element={
          <ProtectedRoute>
            <WorkflowPage />
          </ProtectedRoute>
        }
      />

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

      {/* Default redirect to new workflow */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/workflow' : '/'} replace />}
      />
    </Routes>
  );
};