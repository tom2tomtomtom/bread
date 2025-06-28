import React from 'react';
import { WorkflowOrchestrator } from '../components/workflow/WorkflowOrchestrator';
import { useNavigate } from 'react-router-dom';

export const WorkflowPage: React.FC = () => {
  const navigate = useNavigate();

  const handleWorkflowComplete = () => {
    // Navigate to results or dashboard after completion
    navigate('/results');
  };

  return (
    <WorkflowOrchestrator onComplete={handleWorkflowComplete} />
  );
};