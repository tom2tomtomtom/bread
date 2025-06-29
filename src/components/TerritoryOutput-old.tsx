import React, { useState } from 'react';
import { EnhancedGeneratedOutput } from '../types';
import { ConfidenceScoring } from './ConfidenceScoring';
import { pdfExportService, PDFExportOptions } from '../services/pdfExportService';
import { TerritoryEvolution, PerformancePrediction } from '../types';

interface TerritoryOutputProps {
  generatedOutput: EnhancedGeneratedOutput;
  onNewBrief: () => void;
  onRegenerateUnstarred: () => void;
  onToggleTerritoryStarred: (territoryId: string) => void;
  onToggleHeadlineStarred: (territoryId: string, headlineIndex: number) => void;
  starredItems: { territories: string[]; headlines: { [territoryId: string]: number[] } };

  // Enhanced features (optional for backward compatibility)
  onSelectTerritoryForEvolution?: (territoryId: string | null) => void;
  onGenerateEvolutionSuggestions?: (territoryId: string) => void;
  onPredictTerritoryPerformance?: (territoryId: string) => void;
  territoryEvolutions?: { [territoryId: string]: TerritoryEvolution[] };
  performancePredictions?: { [territoryId: string]: PerformancePrediction };
}

export const TerritoryOutput: React.FC<TerritoryOutputProps> = ({
  generatedOutput,
  onNewBrief,
  onRegenerateUnstarred,
  onToggleTerritoryStarred,
  onToggleHeadlineStarred,
  starredItems,
  onSelectTerritoryForEvolution,
  onPredictTerritoryPerformance,
  territoryEvolutions,
  performancePredictions,
}) => {
  const [showConfidenceReport, setShowConfidenceReport] = useState(false);

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to start a new brief? This will clear all current results.'
      )
    ) {
      onNewBrief();
    }
  };

  const generateConfidenceReport = () => {
    setShowConfidenceReport(true);
  };

  const exportToPDF = async () => {
    try {
      const options: PDFExportOptions = {
        includeImages: false,
        includeConfidenceScores: true,
        includeCompliance: true,
        format: 'a4',
        orientation: 'portrait',
      };

      const result = await pdfExportService.exportTerritoriesToPDF(generatedOutput, options);

      if (result.success) {
        console.log(`✅ PDF exported successfully: ${result.filename}`);
        // Show success toast if available
        if ((window as any).showToast) {
          (window as any).showToast(`PDF exported: ${result.filename}`, 'success');
        }
      } else {
        console.error('❌ PDF export failed:', result.error);
        // Show error toast if available
        if ((window as any).showToast) {
          (window as any).showToast(`PDF export failed: ${result.error}`, 'error');
        }
      }
    } catch (error) {
      console.error('❌ PDF export error:', error);
      // Show error toast if available
      if ((window as any).showToast) {
        (window as any).showToast('PDF export failed. Please try again.', 'error');
      }
    }
  };

  const exportToCSV = () => {
    // Create CSV content
    const csvData = [];

    // Headers
    csvData.push([
      'Territory ID',
      'Title',
      'Positioning',
      'Tone',
      'Territory Confidence',
      'Risk Level',
      'Headline Text',
      'Follow-up',
      'Reasoning',
      'Headline Confidence',
    ]);

    // Data rows
    generatedOutput.territories.forEach(territory => {
      const territoryConfidence = Math.round(
        (territory.confidence.marketFit +
          territory.confidence.complianceConfidence +
          territory.confidence.audienceResonance) /
          3
      );

      territory.headlines.forEach(headline => {
        csvData.push([
          territory.id,
          territory.title,
          territory.positioning.replace(/,/g, ';'), // Replace commas to avoid CSV issues
          territory.tone.replace(/,/g, ';'),
          territoryConfidence,
          territory.confidence.riskLevel,
          headline.text.replace(/,/g, ';'),
          headline.followUp.replace(/,/g, ';'),
          headline.reasoning.replace(/,/g, ';'),
          headline.confidence,
        ]);
      });
    });

    // Convert to CSV string
    const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `aideas-creative-territories-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline text-white">CREATIVE TERRITORIES & EXECUTIONS</h1>
          <p className="text-gray-400 text-sm font-body normal-case">
            AI-generated creative territories with confidence scoring
          </p>
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
            <p className="text-sm text-gray-300 font-body normal-case">
              AI-Generated Performance Prediction
            </p>
          </div>
          <div
            className={`text-4xl font-black px-6 py-3 rounded-2xl ${
              generatedOutput.overallConfidence >= 80
                ? 'text-green-400 bg-green-400/10'
                : generatedOutput.overallConfidence >= 60
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-red-400 bg-red-400/10'
            }`}
          >
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
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-red-600 bg-white/20 px-2 py-1 rounded-full">
                      {territory.id}
                    </div>
                    <button
                      onClick={() => onToggleTerritoryStarred(territory.id)}
                      className={`text-lg transition-all duration-300 hover:scale-110 ${
                        starredItems.territories.includes(territory.id)
                          ? 'text-yellow-500 drop-shadow-lg'
                          : 'text-gray-400 hover:text-yellow-400'
                      }`}
                      title={
                        starredItems.territories.includes(territory.id)
                          ? 'Unstar territory'
                          : 'Star territory'
                      }
                    >
                      {starredItems.territories.includes(territory.id) ? '⭐' : '☆'}
                    </button>

                    {/* Enhanced Features Buttons */}
                    {onSelectTerritoryForEvolution && (
                      <button
                        onClick={() => onSelectTerritoryForEvolution(territory.id)}
                        className="text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 px-2 py-1 rounded-lg text-blue-600 transition-all flex items-center gap-1"
                        title="Evolve this territory"
                      >
                        <span>🧬</span>
                        Evolve
                      </button>
                    )}

                    {onPredictTerritoryPerformance && (
                      <button
                        onClick={() => onPredictTerritoryPerformance(territory.id)}
                        className="text-sm bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 px-2 py-1 rounded-lg text-purple-600 transition-all flex items-center gap-1"
                        title="Predict performance"
                      >
                        <span>📊</span>
                        Predict
                      </button>
                    )}
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      Math.round(
                        (territory.confidence.marketFit +
                          territory.confidence.complianceConfidence +
                          territory.confidence.audienceResonance) /
                          3
                      ) >= 80
                        ? 'bg-green-400 text-white'
                        : Math.round(
                              (territory.confidence.marketFit +
                                territory.confidence.complianceConfidence +
                                territory.confidence.audienceResonance) /
                                3
                            ) >= 60
                          ? 'bg-yellow-600 text-white'
                          : 'bg-red-500 text-white'
                    }`}
                  >
                    {Math.round(
                      (territory.confidence.marketFit +
                        territory.confidence.complianceConfidence +
                        territory.confidence.audienceResonance) /
                        3
                    )}
                    % CONF
                  </div>
                </div>
                <h3 className="text-2xl font-subheading mb-4">"{territory.title}"</h3>
                <div className="bg-black/10 p-3 rounded-xl mb-3">
                  <div className="text-xs font-subheading mb-2">POSITIONING</div>
                  <p className="font-body font-normal text-sm text-gray-800 normal-case">
                    {territory.positioning}
                  </p>
                </div>

                {/* Enhanced Features Indicators */}
                <div className="flex gap-2 mb-3">
                  {/* Performance Prediction Indicator */}
                  {performancePredictions?.[territory.id] && (
                    <div className="bg-purple-500/20 border border-purple-500/30 px-2 py-1 rounded-lg">
                      <div className="text-xs font-bold text-purple-600 flex items-center gap-1">
                        <span>📊</span>
                        Performance: {performancePredictions[territory.id].overallScore}/100
                      </div>
                    </div>
                  )}

                  {/* Evolution Count Indicator */}
                  {territoryEvolutions?.[territory.id] &&
                    territoryEvolutions[territory.id].length > 0 && (
                      <div className="bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded-lg">
                        <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                          <span>🧬</span>
                          {territoryEvolutions[territory.id].length} Evolution
                          {territoryEvolutions[territory.id].length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                </div>

                {/* Risk Level Indicator */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-subheading text-gray-700">RISK LEVEL:</span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      territory.confidence.riskLevel === 'LOW'
                        ? 'bg-green-500 text-white'
                        : territory.confidence.riskLevel === 'MEDIUM'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-red-500 text-white'
                    }`}
                  >
                    {territory.confidence.riskLevel}
                  </span>
                </div>
              </div>

              {/* Phone Panels Grid for Headlines */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {territory.headlines.map((headline, hIndex) => (
                  <div
                    key={hIndex}
                    className="relative group"
                    style={{ animationDelay: `${index * 300 + hIndex * 100 + 50}ms` }}
                  >
                    {/* Phone Frame */}
                    <div className="bg-gray-800 p-2 rounded-3xl shadow-2xl hover:scale-105 transition-all duration-300">
                      {/* Phone Screen */}
                      <div
                        className="text-white rounded-2xl overflow-hidden shadow-inner relative"
                        style={{
                          aspectRatio: '9 / 16',
                          backgroundImage: headline.imageUrl
                            ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${headline.imageUrl})`
                            : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #1e3a8a 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {/* Loading state overlay for missing images */}
                        {!headline.imageUrl && (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600"></div>
                        )}

                        {/* Status Bar */}
                        <div className="relative z-10 bg-black/10 px-4 py-2 flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <span className="ml-1 font-mono">AIdeas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono">📶</span>
                            <span className="font-mono">🔋</span>
                          </div>
                        </div>

                        {/* Phone Content - Centered */}
                        <div className="relative z-10 p-4 h-full flex flex-col justify-center items-center text-center">
                          {/* Main Headline */}
                          <div className="mb-6">
                            <h4 className="text-lg font-bold mb-3 leading-tight drop-shadow-lg">
                              "{headline.text}"
                            </h4>
                            <p className="text-blue-100 text-sm font-medium drop-shadow">
                              {headline.followUp}
                            </p>
                          </div>

                          {/* Confidence Badge */}
                          <div className="mb-4">
                            <div
                              className={`inline-block px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                                headline.confidence >= 80
                                  ? 'bg-green-400/80 text-green-900'
                                  : headline.confidence >= 60
                                    ? 'bg-yellow-400/80 text-yellow-900'
                                    : 'bg-red-400/80 text-red-900'
                              }`}
                            >
                              {headline.confidence}% CONFIDENCE
                            </div>
                          </div>

                          {/* Star Button */}
                          <div>
                            <button
                              onClick={() => onToggleHeadlineStarred(territory.id, hIndex)}
                              className={`text-2xl transition-all duration-300 hover:scale-110 drop-shadow-lg ${
                                (starredItems.headlines[territory.id] || []).includes(hIndex)
                                  ? 'text-yellow-300'
                                  : 'text-gray-300 hover:text-yellow-200'
                              }`}
                              title={
                                (starredItems.headlines[territory.id] || []).includes(hIndex)
                                  ? 'Unstar headline'
                                  : 'Star headline'
                              }
                            >
                              {(starredItems.headlines[territory.id] || []).includes(hIndex)
                                ? '⭐'
                                : '☆'}
                            </button>
                          </div>

                          {/* AI-Generated Image Indicator */}
                          {headline.imageUrl && (
                            <div className="absolute top-16 right-4">
                              <div className="text-xs bg-purple-500/80 text-white px-2 py-1 rounded-full backdrop-blur-sm">
                                🎨 AI
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Hover Overlay with Reasoning */}
                        <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col justify-center z-20">
                          <div className="text-center">
                            <h5 className="text-sm font-bold text-yellow-300 mb-3">
                              WHY THIS WORKS
                            </h5>
                            <p className="text-xs text-blue-100 leading-relaxed">
                              {headline.reasoning}
                            </p>
                            {headline.imageUrl && (
                              <div className="mt-3 text-xs text-purple-300">
                                <div className="text-purple-200">🎨 AI-Generated Visual</div>
                                <div className="text-xs text-purple-400 mt-1">
                                  Background designed by DALL-E
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Territory Tone - Separate Card */}
              <div className="bg-gradient-to-br from-purple-500 via-purple-400 to-purple-600 text-white p-6 rounded-2xl shadow-xl shadow-purple-500/20">
                <div className="text-xs font-subheading mb-2 text-purple-200">TERRITORY TONE</div>
                <p className="font-body font-normal text-lg normal-case">{territory.tone}</p>

                {/* Territory Confidence Scoring Panel */}
                <div className="mt-4">
                  <ConfidenceScoring confidence={territory.confidence} territoryId={territory.id} />
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
              <div
                className={`px-4 py-2 rounded-full font-bold ${
                  Math.round(
                    generatedOutput.territories.reduce(
                      (sum, t) => sum + t.confidence.complianceConfidence,
                      0
                    ) / generatedOutput.territories.length
                  ) >= 80
                    ? 'bg-green-400 text-green-900'
                    : Math.round(
                          generatedOutput.territories.reduce(
                            (sum, t) => sum + t.confidence.complianceConfidence,
                            0
                          ) / generatedOutput.territories.length
                        ) >= 60
                      ? 'bg-yellow-400 text-yellow-900'
                      : 'bg-red-400 text-red-900'
                }`}
              >
                {Math.round(
                  generatedOutput.territories.reduce(
                    (sum, t) => sum + t.confidence.complianceConfidence,
                    0
                  ) / generatedOutput.territories.length
                )}
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Report Modal */}
      {showConfidenceReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-purple-900/90 backdrop-blur-xl border border-purple-400/30 rounded-3xl p-8 shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-headline text-white">📊 CONFIDENCE REPORT</h3>
              <button
                onClick={() => setShowConfidenceReport(false)}
                className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-gray-300 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="font-subheading text-purple-300 mb-4">OVERALL PERFORMANCE</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {generatedOutput.overallConfidence}%
                    </div>
                    <div className="text-xs text-gray-300 font-body normal-case">
                      Overall Confidence
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {generatedOutput.territories.length}
                    </div>
                    <div className="text-xs text-gray-300 font-body normal-case">Territories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {generatedOutput.territories.reduce((sum, t) => sum + t.headlines.length, 0)}
                    </div>
                    <div className="text-xs text-gray-300 font-body normal-case">Headlines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.round(
                        generatedOutput.territories.reduce(
                          (sum, t) => sum + t.confidence.complianceConfidence,
                          0
                        ) / generatedOutput.territories.length
                      )}
                      %
                    </div>
                    <div className="text-xs text-gray-300 font-body normal-case">Compliance</div>
                  </div>
                </div>
              </div>

              {/* Territory Breakdown */}
              <div className="space-y-4">
                <h4 className="font-subheading text-purple-300">TERRITORY BREAKDOWN</h4>
                {generatedOutput.territories.map((territory, _index) => {
                  const avgConfidence = Math.round(
                    (territory.confidence.marketFit +
                      territory.confidence.complianceConfidence +
                      territory.confidence.audienceResonance) /
                      3
                  );
                  const avgHeadlineConfidence = Math.round(
                    territory.headlines.reduce((sum, h) => sum + h.confidence, 0) /
                      territory.headlines.length
                  );

                  return (
                    <div key={territory.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-subheading text-white">
                          {territory.id}: {territory.title}
                        </h5>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            avgConfidence >= 80
                              ? 'bg-green-400 text-green-900'
                              : avgConfidence >= 60
                                ? 'bg-yellow-400 text-yellow-900'
                                : 'bg-red-400 text-red-900'
                          }`}
                        >
                          {avgConfidence}%
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-gray-400 font-body normal-case">Market Fit</div>
                          <div className="text-white font-bold">
                            {territory.confidence.marketFit}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 font-body normal-case">Compliance</div>
                          <div className="text-white font-bold">
                            {territory.confidence.complianceConfidence}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 font-body normal-case">
                            Audience Resonance
                          </div>
                          <div className="text-white font-bold">
                            {territory.confidence.audienceResonance}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 font-body normal-case">Avg Headlines</div>
                          <div className="text-white font-bold">{avgHeadlineConfidence}%</div>
                        </div>
                      </div>

                      <div className="mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            territory.confidence.riskLevel === 'LOW'
                              ? 'bg-green-500/20 text-green-300'
                              : territory.confidence.riskLevel === 'MEDIUM'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {territory.confidence.riskLevel} RISK
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Starred Items Summary */}
      {(starredItems.territories.length > 0 ||
        Object.values(starredItems.headlines).some(arr => arr.length > 0)) && (
        <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6 shadow-2xl text-center">
          <h3 className="text-lg font-subheading text-yellow-400 mb-3">⭐ STARRED ITEMS</h3>
          <div className="flex justify-center gap-6 text-sm font-body normal-case">
            <div className="text-gray-300">
              <span className="font-bold text-white">{starredItems.territories.length}</span>{' '}
              starred territories
            </div>
            <div className="text-gray-300">
              <span className="font-bold text-white">
                {Object.values(starredItems.headlines).reduce((sum, arr) => sum + arr.length, 0)}
              </span>{' '}
              starred headlines
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-body normal-case">
            Starred items will be preserved during regeneration
          </p>
        </div>
      )}

      {/* Enhanced Action Buttons */}
      <div className="flex gap-4 justify-center flex-wrap">
        {(starredItems.territories.length > 0 ||
          Object.values(starredItems.headlines).some(arr => arr.length > 0)) && (
          <button
            onClick={onRegenerateUnstarred}
            className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-yellow-600/30 border border-yellow-500/30 hover:border-yellow-400/40 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 text-yellow-300 hover:text-yellow-200"
          >
            <span>⭐</span>
            REGENERATE UNSTARRED
          </button>
        )}
        <button
          onClick={generateConfidenceReport}
          className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-500/30 hover:border-purple-400/40 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 text-purple-300 hover:text-purple-200"
        >
          <span>📊</span>
          CONFIDENCE REPORT
        </button>
        <button
          onClick={exportToPDF}
          className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/30 hover:border-blue-400/40 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 text-blue-300 hover:text-blue-200"
        >
          <span>📥</span>
          EXPORT PDF
        </button>
        <button
          onClick={exportToCSV}
          className="bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-500/30 hover:border-green-400/40 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 text-green-300 hover:text-green-200"
        >
          <span>📊</span>
          EXPORT CSV
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
