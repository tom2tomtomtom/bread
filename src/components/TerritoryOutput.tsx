import React from 'react';
import { EnhancedGeneratedOutput } from '../services/enhancementService';
import { ConfidenceScoring } from './ConfidenceScoring';

interface TerritoryOutputProps {
  generatedOutput: EnhancedGeneratedOutput;
  onNewBrief: () => void;
}

export const TerritoryOutput: React.FC<TerritoryOutputProps> = ({ generatedOutput, onNewBrief }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Overall Confidence Score */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-400/10 to-blue-400/10 border border-purple-400/20 rounded-3xl p-6 shadow-2xl text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-4xl">🧠</div>
          <div>
            <h3 className="text-2xl font-black text-purple-400">OVERALL CONFIDENCE</h3>
            <p className="text-sm text-gray-300">AI-Generated Performance Prediction</p>
          </div>
          <div className={`text-4xl font-black px-6 py-3 rounded-2xl ${
            generatedOutput.overallConfidence >= 80 ? 'text-green-400 bg-green-400/10' :
            generatedOutput.overallConfidence >= 60 ? 'text-yellow-400 bg-yellow-400/10' :
            'text-red-400 bg-red-400/10'
          }`}>
            {generatedOutput.overallConfidence}%
          </div>
        </div>
        <p className="text-sm text-gray-300">
          Based on market fit, compliance confidence, and audience resonance analysis
        </p>
      </div>

      {/* Territories */}
      <div className="backdrop-blur-xl bg-yellow-400/10 border border-yellow-400/20 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-4xl font-black mb-8 text-yellow-400 drop-shadow-lg">
          TERRITORIES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedOutput.territories.map((territory, index) => (
            <div 
              key={territory.id} 
              className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 text-black p-6 rounded-2xl shadow-xl shadow-yellow-400/20 hover:shadow-yellow-400/30 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs font-bold text-red-600 bg-white/20 px-2 py-1 rounded-full">
                  {territory.id}
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                  Math.round((territory.confidence.marketFit + territory.confidence.complianceConfidence + territory.confidence.audienceResonance) / 3) >= 80 ? 'bg-green-400 text-white' :
                  Math.round((territory.confidence.marketFit + territory.confidence.complianceConfidence + territory.confidence.audienceResonance) / 3) >= 60 ? 'bg-yellow-600 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {Math.round((territory.confidence.marketFit + territory.confidence.complianceConfidence + territory.confidence.audienceResonance) / 3)}% CONF
                </div>
              </div>
              <h3 className="text-xl font-black mb-4">
                "{territory.title}"
              </h3>
              <div className="bg-black/10 p-3 rounded-xl mb-3">
                <div className="text-xs font-bold mb-2">POSITIONING</div>
                <p className="font-normal text-sm text-gray-800">{territory.positioning}</p>
              </div>
              
              {/* Risk Level Indicator */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700">RISK LEVEL:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  territory.confidence.riskLevel === 'LOW' ? 'bg-green-500 text-white' :
                  territory.confidence.riskLevel === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {territory.confidence.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Executions with Confidence */}
      <div className="backdrop-blur-xl bg-blue-400/10 border border-blue-400/20 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-4xl font-black mb-8 text-blue-400 drop-shadow-lg">
          EXECUTIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedOutput.territories.map((territory, index) => (
            <div 
              key={territory.id} 
              className="bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6">
                <div className="bg-white/20 p-3 rounded-xl mb-4">
                  <div className="text-xs font-bold mb-2">TONE</div>
                  <p className="font-normal text-sm">{territory.tone}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-xl mb-4">
                  <div className="text-xs font-bold mb-3">HEADLINES</div>
                  <div className="space-y-2">
                    {territory.headlines.map((headline, hIndex) => (
                      <div 
                        key={hIndex} 
                        className="font-normal text-sm bg-white/10 p-2 rounded-lg border-l-4 border-white/40"
                      >
                        "{headline}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Confidence Scoring Panel */}
              <div className="p-6 pt-0">
                <ConfidenceScoring 
                  confidence={territory.confidence}
                  territoryId={territory.id}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Compliance */}
      <div className="backdrop-blur-xl bg-orange-400/10 border border-orange-400/20 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-4xl font-black mb-8 text-orange-400 drop-shadow-lg">
          COMPLIANCE CO-PILOT
        </h2>
        <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 text-white p-8 rounded-2xl shadow-xl shadow-orange-500/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-sm font-bold mb-4 text-orange-100">POWERED BY</div>
              <ul className="font-normal text-sm space-y-2">
                {generatedOutput.compliance.powerBy.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-sm font-bold mb-4 text-orange-100">OUTPUT</div>
              <p className="font-normal text-sm">
                {generatedOutput.compliance.output}
              </p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-sm font-bold mb-4 text-orange-100">COMPLIANCE NOTES</div>
              <ul className="font-normal text-sm space-y-2">
                {generatedOutput.compliance.notes.map((note, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Overall Compliance Score */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between">
              <span className="font-bold">OVERALL COMPLIANCE CONFIDENCE:</span>
              <div className={`px-4 py-2 rounded-full font-bold ${
                Math.round(generatedOutput.territories.reduce((sum, t) => sum + t.confidence.complianceConfidence, 0) / generatedOutput.territories.length) >= 80 ? 'bg-green-400 text-green-900' :
                Math.round(generatedOutput.territories.reduce((sum, t) => sum + t.confidence.complianceConfidence, 0) / generatedOutput.territories.length) >= 60 ? 'bg-yellow-400 text-yellow-900' :
                'bg-red-400 text-red-900'
              }`}>
                {Math.round(generatedOutput.territories.reduce((sum, t) => sum + t.confidence.complianceConfidence, 0) / generatedOutput.territories.length)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2">
          <span>📊</span>
          CONFIDENCE REPORT
        </button>
        <button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2">
          <span>📥</span>
          EXPORT PDF
        </button>
        <button className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2">
          <span>📧</span>
          EMAIL BRIEF
        </button>
        <button 
          onClick={onNewBrief}
          className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2"
        >
          <span>🔄</span>
          NEW BRIEF
        </button>
      </div>
    </div>
  );
};