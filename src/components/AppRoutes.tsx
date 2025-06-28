import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicRoutes } from './PublicRoutes';
import { ProtectedRoutes } from './ProtectedRoutes';
import { WorkflowPage } from '../pages/WorkflowPage';

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<PublicRoutes />} />
    {/* Public workflow route for testing */}
    <Route path="/workflow" element={<WorkflowPage />} />
    <Route path="/*" element={<ProtectedRoutes />} />
  </Routes>
);