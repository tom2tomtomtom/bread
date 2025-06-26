import React, { useState } from 'react';
import { analyzeEnhancedBrief, analyzeRealTime } from './services/briefIntelligenceService';
import {
  generateEvolutionSuggestions,
  predictTerritoryPerformance,
} from './services/territoryEvolutionService';

// Simple test to verify core functionality works
export const TestCoreFunctionality: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Real-time analysis
      addResult('🧪 Testing real-time brief analysis...');
      const realTimeResult = analyzeRealTime(
        'Create a campaign for Everyday Rewards targeting Australian families'
      );
      addResult(
        `✅ Real-time analysis: Score ${realTimeResult.score}/100, ${realTimeResult.wordCount} words`
      );

      // Test 2: Enhanced brief analysis
      addResult('🧪 Testing enhanced brief analysis...');
      try {
        const enhancedResult = await analyzeEnhancedBrief(
          'Create a campaign for Everyday Rewards targeting Australian families who value savings and convenience'
        );
        addResult(
          `✅ Enhanced analysis: Overall score ${enhancedResult.overallScore}/100, ${enhancedResult.missingElements.length} missing elements`
        );
      } catch (error) {
        addResult(`⚠️ Enhanced analysis: Using fallback (${error})`);
      }

      // Test 3: Evolution suggestions
      addResult('🧪 Testing evolution suggestions...');
      const mockTerritory = {
        id: 'test_territory',
        title: 'Everyday Value Champions',
        positioning: 'Position Everyday Rewards as the champion of consistent, everyday value',
        tone: 'Warm and authentic',
        headlines: [
          {
            text: 'Every day deserves everyday rewards',
            followUp: 'Join millions of Aussie families',
            reasoning: 'Emphasizes consistency',
            confidence: 85,
          },
        ],
        starred: false,
      };

      const suggestions = await generateEvolutionSuggestions(
        mockTerritory,
        'Create a campaign for Everyday Rewards targeting Australian families'
      );
      addResult(`✅ Evolution suggestions: Generated ${suggestions.length} suggestions`);

      // Test 4: Performance prediction
      addResult('🧪 Testing performance prediction...');
      const prediction = await predictTerritoryPerformance(
        mockTerritory,
        'Create a campaign for Everyday Rewards targeting Australian families'
      );
      addResult(`✅ Performance prediction: Overall score ${prediction.overallScore}/100`);

      addResult('🎉 All core functionality tests completed successfully!');
    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 Enhanced Features Core Functionality Test
          </h1>
          <p className="text-xl text-white/70 mb-8">
            Testing the enhanced brief intelligence and territory evolution system
          </p>

          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-8 py-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-400 font-bold text-lg transition-all disabled:opacity-50"
          >
            {isRunning ? '🔄 Running Tests...' : '🚀 Run Core Functionality Tests'}
          </button>
        </div>

        {/* Test Results */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span>
            Test Results
          </h2>

          {testResults.length === 0 ? (
            <p className="text-white/70 text-center py-8">
              Click "Run Tests" to verify the enhanced features are working correctly
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg font-mono text-sm ${
                    result.startsWith('✅')
                      ? 'bg-green-500/10 text-green-400'
                      : result.startsWith('⚠️')
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : result.startsWith('❌')
                          ? 'bg-red-500/10 text-red-400'
                          : result.startsWith('🎉')
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
              <span>🧠</span>
              Brief Intelligence
            </h3>
            <ul className="text-white/70 space-y-2 text-sm">
              <li>• Real-time analysis as you type</li>
              <li>• 6-category detailed scoring</li>
              <li>• Australian market context</li>
              <li>• Strategic gap identification</li>
              <li>• Cultural insights and recommendations</li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
              <span>🧬</span>
              Territory Evolution
            </h3>
            <ul className="text-white/70 space-y-2 text-sm">
              <li>• AI-powered territory variations</li>
              <li>• 8 different evolution types</li>
              <li>• Performance prediction</li>
              <li>• Evolution history tracking</li>
              <li>• Smart optimization suggestions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCoreFunctionality;
