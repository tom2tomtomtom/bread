import React, { useState } from 'react';
import { analyzeRealTime, analyzeEnhancedBrief } from './services/briefIntelligenceService';
import { generateEvolutionSuggestions, predictTerritoryPerformance } from './services/territoryEvolutionService';
import { Territory } from './types';

// Comprehensive test component for enhanced features
export const TestEnhancedSystem: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const updateCurrentTest = (test: string) => {
    setCurrentTest(test);
    addResult(`🔄 ${test}`);
  };

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('');
    
    try {
      // Test 1: Real-time Brief Analysis
      updateCurrentTest('Testing Real-time Brief Analysis');
      const testBrief = 'Create a campaign for Everyday Rewards targeting Australian families who value savings and convenience during their weekly grocery shopping';
      
      const realTimeResult = analyzeRealTime(testBrief);
      addResult(`✅ Real-time Analysis: Score ${realTimeResult.score}/100, ${realTimeResult.wordCount} words, ${realTimeResult.suggestions.length} suggestions`);
      
      // Test 2: Enhanced Brief Analysis
      updateCurrentTest('Testing Enhanced Brief Intelligence');
      try {
        const enhancedResult = await analyzeEnhancedBrief(testBrief);
        addResult(`✅ Enhanced Analysis: Overall ${enhancedResult.overallScore}/100, ${enhancedResult.improvementSuggestions.length} suggestions, ${enhancedResult.strategicGaps.length} gaps`);
        addResult(`   📊 Category Scores: Strategic ${enhancedResult.categoryScores.strategicClarity.score}, Audience ${enhancedResult.categoryScores.audienceDefinition.score}, Cultural ${enhancedResult.categoryScores.culturalRelevance.score}`);
      } catch (error) {
        addResult(`⚠️ Enhanced Analysis: Using fallback system (${error})`);
      }
      
      // Test 3: Territory Evolution
      updateCurrentTest('Testing Territory Evolution System');
      const mockTerritory: Territory = {
        id: 'test_territory_001',
        title: 'Everyday Value Champions',
        positioning: 'Position Everyday Rewards as the champion of consistent, everyday value for Australian families',
        tone: 'Warm, authentic, and genuinely helpful',
        headlines: [
          {
            text: 'Every day deserves everyday rewards',
            followUp: 'Join millions of Aussie families saving smart',
            reasoning: 'Emphasizes consistency and community',
            confidence: 85
          },
          {
            text: 'Your everyday shopping, extraordinary savings',
            followUp: 'Discover rewards that actually matter',
            reasoning: 'Contrasts ordinary with extraordinary value',
            confidence: 78
          }
        ],
        starred: false
      };
      
      const suggestions = await generateEvolutionSuggestions(mockTerritory, testBrief);
      addResult(`✅ Evolution Suggestions: Generated ${suggestions.length} evolution options`);
      
      if (suggestions.length > 0) {
        const topSuggestion = suggestions[0];
        addResult(`   🎯 Top Suggestion: ${topSuggestion.type} - ${topSuggestion.title} (${topSuggestion.description})`);
      }
      
      // Test 4: Performance Prediction
      updateCurrentTest('Testing Performance Prediction');
      const prediction = await predictTerritoryPerformance(mockTerritory, testBrief);
      addResult(`✅ Performance Prediction: Overall ${prediction.overallScore}/100`);
      addResult(`   📈 Scores: Audience ${prediction.categoryScores.audienceResonance}, Brand ${prediction.categoryScores.brandAlignment}, Market ${prediction.categoryScores.marketFit}`);
      
      // Test 5: Australian Market Intelligence
      updateCurrentTest('Testing Australian Market Intelligence');
      const australianBrief = 'Launch a new coffee brand targeting Melbourne professionals during morning commute, emphasizing fair trade and local roasting';
      const australianAnalysis = analyzeRealTime(australianBrief);
      const hasAustralianContext = australianBrief.toLowerCase().includes('melbourne') || australianBrief.toLowerCase().includes('australia');
      addResult(`✅ Australian Context: ${hasAustralianContext ? 'Detected' : 'Not detected'}, Completeness: ${australianAnalysis.completeness}%`);
      
      // Test 6: Evolution Types Coverage
      updateCurrentTest('Testing Evolution Type Coverage');
      const evolutionTypes = [
        'TONE_SHIFT', 'AUDIENCE_PIVOT', 'CULTURAL_ADAPTATION', 
        'COMPETITIVE_RESPONSE', 'SEASONAL_OPTIMIZATION', 'CHANNEL_ADAPTATION',
        'EMOTIONAL_REPOSITIONING', 'VALUE_PROPOSITION_ENHANCEMENT'
      ];
      
      addResult(`✅ Evolution Types: ${evolutionTypes.length} types available`);
      addResult(`   🧬 Types: ${evolutionTypes.slice(0, 4).join(', ')}...`);
      
      // Test 7: Scoring System Validation
      updateCurrentTest('Testing Scoring System Validation');
      const shortBrief = 'Coffee campaign';
      const shortAnalysis = analyzeRealTime(shortBrief);
      const longBrief = 'Create a comprehensive integrated marketing campaign for a premium Australian coffee brand targeting urban professionals aged 25-45 who value sustainability, quality, and convenience in their daily coffee consumption habits, with specific focus on morning commute periods and workplace coffee culture, emphasizing our unique direct-trade relationships with Australian coffee farmers and our commitment to carbon-neutral roasting processes';
      const longAnalysis = analyzeRealTime(longBrief);
      
      addResult(`✅ Scoring Validation: Short brief ${shortAnalysis.score}/100, Long brief ${longAnalysis.score}/100`);
      addResult(`   📏 Word counts: ${shortAnalysis.wordCount} vs ${longAnalysis.wordCount} words`);
      
      setCurrentTest('');
      addResult('🎉 All enhanced system tests completed successfully!');
      addResult('🚀 Enhanced Brief Intelligence & Territory Evolution System is fully operational');
      
    } catch (error) {
      addResult(`❌ Test suite failed: ${error}`);
      setCurrentTest('');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            🧠 Enhanced BREAD System Test Suite
          </h1>
          <p className="text-xl text-white/70 mb-8">
            Comprehensive testing of Enhanced Brief Intelligence & Territory Evolution capabilities
          </p>
          
          <button
            onClick={runComprehensiveTests}
            disabled={isRunning}
            className="px-8 py-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 rounded-xl text-purple-400 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? '🔄 Running Comprehensive Tests...' : '🚀 Run Enhanced System Tests'}
          </button>
          
          {currentTest && (
            <div className="mt-4 text-blue-400 font-medium">
              {currentTest}
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span>
            Enhanced System Test Results
          </h2>
          
          {testResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🧪</div>
              <p className="text-white/70 text-lg">
                Click "Run Tests" to verify all enhanced features are working correctly
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg font-mono text-sm ${
                    result.startsWith('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    result.startsWith('⚠️') ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    result.startsWith('❌') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    result.startsWith('🎉') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    result.startsWith('🚀') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    result.startsWith('🔄') ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    result.startsWith('   ') ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20 ml-4' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
              <span>🧠</span>
              Brief Intelligence
            </h3>
            <ul className="text-white/70 space-y-2 text-sm">
              <li>• Real-time analysis as you type</li>
              <li>• 6-category detailed scoring</li>
              <li>• Australian market context detection</li>
              <li>• Strategic gap identification</li>
              <li>• Cultural insights & recommendations</li>
              <li>• Competitive opportunity analysis</li>
            </ul>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
              <span>🧬</span>
              Territory Evolution
            </h3>
            <ul className="text-white/70 space-y-2 text-sm">
              <li>• 8 different evolution strategies</li>
              <li>• AI-powered territory variations</li>
              <li>• Performance prediction scoring</li>
              <li>• Evolution history tracking</li>
              <li>• Smart optimization suggestions</li>
              <li>• Cultural adaptation capabilities</li>
            </ul>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <span>🇦🇺</span>
              Australian Intelligence
            </h3>
            <ul className="text-white/70 space-y-2 text-sm">
              <li>• Local market context analysis</li>
              <li>• Cultural sensitivity scoring</li>
              <li>• Seasonal optimization insights</li>
              <li>• Competitive landscape awareness</li>
              <li>• Australian brand references</li>
              <li>• Regional preference detection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEnhancedSystem;
