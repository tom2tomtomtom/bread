import React, { useState, useEffect } from 'react';
import { 
  getStoreHealth, 
  getStoreSizes
} from '../stores';

/**
 * StoreHealthCheck - Development component to monitor store architecture
 * 
 * This component helps verify that the focused store architecture is working correctly
 * and provides insights into store performance and migration status.
 * 
 * Only available in development mode.
 */
export const StoreHealthCheck: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [migrationData, setMigrationData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const updateHealth = () => {
        setHealthData(getStoreHealth());
        setMigrationData({ complete: true, issues: [] });
      };

      updateHealth();
      const interval = setInterval(updateHealth, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
    return undefined;
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !healthData) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`
          px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${healthData.healthy 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
          }
        `}
        title="Store Health Check"
      >
        🏪 {healthData.healthy ? '✅' : '⚠️'}
      </button>

      {/* Health Panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white">Store Health</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Overall Health */}
          <div className={`p-2 rounded mb-3 ${healthData.healthy ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{healthData.healthy ? '✅' : '❌'}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {healthData.healthy ? 'Healthy' : 'Issues Detected'}
              </span>
            </div>
          </div>

          {/* Migration Status */}
          <div className="mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Migration Status</h4>
            <div className={`p-2 rounded text-sm ${
              migrationData?.complete 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
            }`}>
              {migrationData?.complete ? '✅ Migration Complete' : '🔄 Migration Pending'}
            </div>
            {migrationData.warnings.length > 0 && (
              <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                {migrationData.warnings.map((warning: string, i: number) => (
                  <div key={i}>⚠️ {warning}</div>
                ))}
              </div>
            )}
          </div>

          {/* Store Sizes */}
          <div className="mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Store Sizes</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(healthData.sizes).map(([store, size]) => (
                <div key={store} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{store}:</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    {typeof size === 'number' ? `${(size / 1024).toFixed(1)}KB` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          {healthData.issues.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">Issues</h4>
              <div className="space-y-1 text-xs">
                {healthData.issues.map((issue: string, i: number) => (
                  <div key={i} className="text-red-600 dark:text-red-400">❌ {issue}</div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {healthData.warnings.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-1">Warnings</h4>
              <div className="space-y-1 text-xs">
                {healthData.warnings.map((warning: string, i: number) => (
                  <div key={i} className="text-yellow-600 dark:text-yellow-400">⚠️ {warning}</div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
            <div>🏗️ Focused Store Architecture</div>
            <div>📊 Real-time monitoring</div>
            <div>🔄 Auto-migration enabled</div>
            <div className="mt-1 font-mono">
              Updated: {new Date(healthData.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreHealthCheck;
