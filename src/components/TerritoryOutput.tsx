import React from 'react';
import { EnhancedGeneratedOutput } from '../services/enhancementService';
import { ConfidenceScoring } from './ConfidenceScoring';

interface TerritoryOutputProps {
  generatedOutput: EnhancedGeneratedOutput;
  onNewBrief: () => void;
}

export const TerritoryOutput: React.FC<TerritoryOutputProps> = ({ generatedOutput, onNewBrief }) => {
  const handleReset = () => {
    if (window.confirm('Are you sure you want to start a new brief? This will clear all current results.')) {
      onNewBrief();
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline text-white">CREATIVE TERRITORIES & EXECUTIONS</h1>
          <p className="text-gray-400 text-sm font-body normal-case">AI-generated creative territories with confidence scoring</p>
        </div>
        <button 
          onClick={handleReset}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-400/30 flex items-center gap-2"
        >
          <span>🔄</span>
          START NEW BRIEF
        </button>
      </div>

      {/* Overall Confidence Score */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-purple-400/10 to-blue-400/10 border border-purple-400/20 rounded-3xl p-6 shadow-2xl text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-4xl">🧠</div>
          <div>
            <h3 className="text-2xl font-subheading text-purple-400">OVERALL CONFIDENCE</h3>
            <p className="text-sm text-gray-300 font-body normal-case">AI-Generated Performance Prediction</p>
          </div>
          <div className={`text-4xl font-black px-6 py-3 rounded-2xl ${
            generatedOutput.overallConfidence >= 80 ? 'text-green-400 bg-green-400/10' :
            generatedOutput.overallConfidence >= 60 ? 'text-yellow-400 bg-yellow-400/10' :
            'text-red-400 bg-red-400/10'
          }`}>
            {generatedOutput.overallConfidence}%
          </div>
        </div>
        <p className="text-sm text-gray-300 font-body normal-case">
          Based on market fit, compliance confidence, and audience resonance analysis
        </p>
      </div>

      {/* Territories & Headlines */}
      <div className="backdrop-blur-xl bg-yellow-400/10 border border-yellow-400/20 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-4xl font-subheading mb-8 text-yellow-400 drop-shadow-lg">
          TERRITORIES & EXECUTIONS
        </h2>
        <div className="space-y-12">
          {generatedOutput.territories.map((territory, index) => (
            <div key={territory.id} className="space-y-6">
              {/* Territory Card */}
              <div 
                className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 text-black p-6 rounded-2xl shadow-xl shadow-yellow-400/20 hover:shadow-yellow-400/30 transition-all duration-300"
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
                <h3 className="text-2xl font-subheading mb-4">
                  "{territory.title}"
                </h3>
                <div className="bg-black/10 p-3 rounded-xl mb-3">
                  <div className="text-xs font-subheading mb-2">POSITIONING</div>
                  <p className="font-body font-normal text-sm text-gray-800 normal-case">{territory.positioning}</p>
                </div>
                
                {/* Risk Level Indicator */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-subheading text-gray-700">RISK LEVEL:</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    territory.confidence.riskLevel === 'LOW' ? 'bg-green-500 text-white' :
                    territory.confidence.riskLevel === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {territory.confidence.riskLevel}
                  </span>
                </div>
              </div>

              {/* Headlines Cards - Individual Cards for Each Headline */}
              <div className="space-y-4">
                {territory.headlines.map((headline, hIndex) => (
                  <div 
                    key={hIndex}
                    className="bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300"
                    style={{ animationDelay: `${index * 300 + hIndex * 100 + 50}ms` }}
                  >
                    {/* Main Headline */}
                    <div className="mb-4">
                      <h4 className="text-xl font-subheading mb-2">
                        "{headline.text}"
                      </h4>
                      <p className="text-lg font-body text-blue-100 normal-case">
                        {headline.followUp}
                      </p>
                    </div>
                    
                    {/* Reasoning */}
                    <div className="bg-white/10 p-4 rounded-xl mb-4">
                      <div className="text-xs font-subheading mb-2 text-blue-200">WHY THIS WORKS</div>
                      <p className="font-body font-normal text-sm normal-case text-blue-50">
                        {headline.reasoning}
                      </p>
                    </div>
                    
                    {/* Individual Headline Confidence */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-subheading text-blue-200">HEADLINE CONFIDENCE:</span>
                      <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                        headline.confidence >= 80 ? 'bg-green-400 text-green-900' :
                        headline.confidence >= 60 ? 'bg-yellow-400 text-yellow-900' :
                        'bg-red-400 text-red-900'
                      }`}>
                        {headline.confidence}%
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Territory Tone - Separate Card */}
                <div className="bg-gradient-to-br from-purple-500 via-purple-400 to-purple-600 text-white p-6 rounded-2xl shadow-xl shadow-purple-500/20">
                  <div className="text-xs font-subheading mb-2 text-purple-200">TERRITORY TONE</div>
                  <p className="font-body font-normal text-lg normal-case">{territory.tone}</p>
                  
                  {/* Territory Confidence Scoring Panel */}
                  <div className="mt-4">
                    <ConfidenceScoring 
                      confidence={territory.confidence}
                      territoryId={territory.id}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Compliance */}
      <div className="backdrop-blur-xl bg-orange-400/10 border border-orange-400/20 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-4xl font-subheading mb-8 text-orange-400 drop-shadow-lg">
          COMPLIANCE CO-PILOT
        </h2>
        <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 text-white p-8 rounded-2xl shadow-xl shadow-orange-500/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-sm font-subheading mb-4 text-orange-100">POWERED BY</div>
              <ul className="font-body font-normal text-sm space-y-2 normal-case">
                {generatedOutput.compliance.powerBy.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-sm font-subheading mb-4 text-orange-100">OUTPUT</div>
              <p className="font-body font-normal text-sm normal-case">
                {generatedOutput.compliance.output}
              </p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
              <div className="text-sm font-subheading mb-4 text-orange-100">COMPLIANCE NOTES</div>
              <ul className="font-body font-normal text-sm space-y-2 normal-case">
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
              <span className="font-subheading">OVERALL COMPLIANCE CONFIDENCE:</span>
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
          onClick={handleReset}
          className="bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/30 hover:border-red-400/40 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 text-red-300 hover:text-red-200"
        >
          <span>🔄</span>
          START NEW BRIEF
        </button>
      </div>
    </div>
  );
};