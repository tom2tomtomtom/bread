/**
 * 📋 Generation Queue Component
 * 
 * Real-time monitoring and management of multimedia generation requests
 * with progress tracking, retry capabilities, and queue management.
 */

import React, { useState, useEffect } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { GenerationQueue as QueueItem, GenerationStatus } from '../../types';

interface GenerationQueueProps {
  onItemClick?: (item: QueueItem) => void;
  maxItems?: number;
  showCompleted?: boolean;
}

export const GenerationQueue: React.FC<GenerationQueueProps> = ({
  onItemClick,
  maxItems = 10,
  showCompleted = true,
}) => {
  const {
    generationQueue,
    cancelGeneration,
    retryGeneration,
    clearGenerationQueue,
  } = useAssetStore();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

  // Filter queue items based on selected filter
  const filteredQueue = generationQueue
    .filter(item => {
      switch (filter) {
        case 'active':
          return item.status === 'queued' || item.status === 'processing';
        case 'completed':
          return item.status === 'complete';
        case 'failed':
          return item.status === 'error';
        default:
          return showCompleted || item.status !== 'complete';
      }
    })
    .slice(0, maxItems);

  // Get status icon and color
  const getStatusDisplay = (status: GenerationStatus) => {
    switch (status) {
      case 'queued':
        return { icon: '⏳', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'processing':
        return { icon: '⚡', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'complete':
        return { icon: '✅', color: 'text-green-600', bg: 'bg-green-50' };
      case 'error':
        return { icon: '❌', color: 'text-red-600', bg: 'bg-red-50' };
      case 'cancelled':
        return { icon: '🚫', color: 'text-gray-600', bg: 'bg-gray-50' };
      default:
        return { icon: '❓', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  // Format time remaining
  const formatTimeRemaining = (estimatedCompletion: Date) => {
    const now = new Date();
    const remaining = estimatedCompletion.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Completing...';
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Handle retry
  const handleRetry = async (item: QueueItem) => {
    try {
      await retryGeneration(item.id);
    } catch (error) {
      console.error('Failed to retry generation:', error);
    }
  };

  // Handle cancel
  const handleCancel = async (item: QueueItem) => {
    try {
      await cancelGeneration(item.id);
    } catch (error) {
      console.error('Failed to cancel generation:', error);
    }
  };

  // Get queue statistics
  const queueStats = {
    total: generationQueue.length,
    queued: generationQueue.filter(item => item.status === 'queued').length,
    processing: generationQueue.filter(item => item.status === 'processing').length,
    completed: generationQueue.filter(item => item.status === 'complete').length,
    failed: generationQueue.filter(item => item.status === 'error').length,
  };

  if (generationQueue.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Generation Requests</h3>
          <p className="text-gray-600 text-sm">
            Start generating images or videos to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            📋 Generation Queue
          </h3>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            {generationQueue.length > 0 && (
              <button
                onClick={clearGenerationQueue}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Queue Statistics */}
        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
          <span>Total: {queueStats.total}</span>
          {queueStats.queued > 0 && <span className="text-yellow-600">Queued: {queueStats.queued}</span>}
          {queueStats.processing > 0 && <span className="text-blue-600">Processing: {queueStats.processing}</span>}
          {queueStats.completed > 0 && <span className="text-green-600">Completed: {queueStats.completed}</span>}
          {queueStats.failed > 0 && <span className="text-red-600">Failed: {queueStats.failed}</span>}
        </div>
      </div>

      {/* Queue Items */}
      <div className="divide-y divide-gray-200">
        {filteredQueue.map((item) => {
          const statusDisplay = getStatusDisplay(item.status);
          const isActive = item.status === 'queued' || item.status === 'processing';
          const canRetry = item.status === 'error' && item.retryCount < item.maxRetries;
          const canCancel = isActive;

          return (
            <div
              key={item.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                onItemClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onItemClick?.(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Status Icon */}
                  <div className={`w-8 h-8 rounded-full ${statusDisplay.bg} flex items-center justify-center`}>
                    <span className="text-sm">{statusDisplay.icon}</span>
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {item.type === 'image' ? '🎨' : '🎬'} {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Generation
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusDisplay.bg} ${statusDisplay.color}`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Priority: {item.priority}
                      </span>
                    </div>

                    {/* Request Details */}
                    <div className="mt-1 text-xs text-gray-600">
                      {'prompt' in item.request ? (
                        <span>Prompt: {item.request.prompt.substring(0, 60)}...</span>
                      ) : (
                        <span>Animation: {item.request.animationType} • {item.request.duration}s</span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {isActive && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress: {item.progress}%</span>
                          <span>ETA: {formatTimeRemaining(item.estimatedCompletion)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {item.status === 'error' && item.error && (
                      <div className="mt-2 text-xs text-red-600">
                        Error: {item.error}
                      </div>
                    )}

                    {/* Retry Count */}
                    {item.retryCount > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        Retry {item.retryCount}/{item.maxRetries}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {canRetry && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetry(item);
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Retry
                    </button>
                  )}
                  {canCancel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(item);
                      }}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <div className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More */}
      {generationQueue.length > maxItems && (
        <div className="px-6 py-3 border-t border-gray-200 text-center">
          <span className="text-sm text-gray-600">
            Showing {filteredQueue.length} of {generationQueue.length} items
          </span>
        </div>
      )}
    </div>
  );
};
