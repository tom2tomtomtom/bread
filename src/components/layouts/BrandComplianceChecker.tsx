import React, { useState } from 'react';
import { ComplianceScore, ComplianceViolation } from '../../types';

interface BrandComplianceCheckerProps {
  compliance: ComplianceScore;
  onFixViolation?: (violation: ComplianceViolation) => void;
  showDetails?: boolean;
}

export const BrandComplianceChecker: React.FC<BrandComplianceCheckerProps> = ({
  compliance,
  onFixViolation,
  showDetails = true,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-yellow-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getScoreBorder = (score: number): string => {
    if (score >= 90) return 'border-green-200';
    if (score >= 75) return 'border-yellow-200';
    if (score >= 60) return 'border-orange-200';
    return 'border-red-200';
  };

  const getViolationIcon = (type: ComplianceViolation['type']): string => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'suggestion': return '💡';
      default: return 'ℹ️';
    }
  };

  const getViolationColor = (type: ComplianceViolation['type']): string => {
    switch (type) {
      case 'error': return 'text-red-700 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'suggestion': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: ComplianceViolation['impact']): string => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const categoryLabels: Record<keyof ComplianceScore['categories'], string> = {
    brandAlignment: 'Brand Alignment',
    colorCompliance: 'Color Compliance',
    fontCompliance: 'Font Compliance',
    logoUsage: 'Logo Usage',
    spacing: 'Spacing & Layout',
    legalRequirements: 'Legal Requirements',
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className={`rounded-lg border p-4 ${getScoreBackground(compliance.overall)} ${getScoreBorder(compliance.overall)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">🏆 Brand Compliance Score</h3>
            <p className="text-sm text-gray-600 mt-1">
              Overall compliance with brand guidelines and standards
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(compliance.overall)}`}>
              {compliance.overall}%
            </div>
            <div className="text-sm text-gray-500">
              {compliance.overall >= 90 ? 'Excellent' :
               compliance.overall >= 75 ? 'Good' :
               compliance.overall >= 60 ? 'Fair' : 'Needs Work'}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {showDetails && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">📊 Category Breakdown</h4>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSection === 'categories' ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'categories' && (
            <div className="mt-4 space-y-3">
              {Object.entries(compliance.categories).map(([key, score]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {categoryLabels[key as keyof ComplianceScore['categories']]}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          score >= 90 ? 'bg-green-500' :
                          score >= 75 ? 'bg-yellow-500' :
                          score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                      {score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Violations */}
      {compliance.violations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <button
            onClick={() => toggleSection('violations')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">
              🚨 Issues Found ({compliance.violations.length})
            </h4>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSection === 'violations' ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'violations' && (
            <div className="mt-4 space-y-3">
              {compliance.violations.map((violation, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-3 ${getViolationColor(violation.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-lg mr-2">{getViolationIcon(violation.type)}</span>
                        <span className="font-medium">{violation.category}</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getImpactColor(violation.impact)}`}>
                          {violation.impact} impact
                        </span>
                      </div>
                      
                      <p className="text-sm mb-2">{violation.description}</p>
                      
                      {violation.element && (
                        <p className="text-xs opacity-75 mb-2">
                          <strong>Element:</strong> {violation.element}
                        </p>
                      )}
                      
                      <div className="bg-white bg-opacity-50 rounded p-2 text-sm">
                        <strong>Fix:</strong> {violation.fix}
                      </div>
                    </div>

                    {onFixViolation && (
                      <button
                        onClick={() => onFixViolation(violation)}
                        className="ml-3 px-3 py-1 bg-white bg-opacity-75 hover:bg-opacity-100 rounded text-sm font-medium transition-colors"
                      >
                        Fix
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {compliance.recommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <button
            onClick={() => toggleSection('recommendations')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">
              💡 Recommendations ({compliance.recommendations.length})
            </h4>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expandedSection === 'recommendations' ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === 'recommendations' && (
            <div className="mt-4 space-y-2">
              {compliance.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-500 mt-0.5">💡</span>
                  <p className="text-sm text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
          📋 Export Report
        </button>
        
        <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
          ✅ Mark as Reviewed
        </button>
        
        {compliance.violations.length > 0 && (
          <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium">
            🔧 Auto-Fix Issues
          </button>
        )}
      </div>

      {/* Compliance Summary */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="font-bold text-red-600">
              {compliance.violations.filter(v => v.type === 'error').length}
            </div>
            <div className="text-gray-600">Errors</div>
          </div>
          
          <div className="text-center">
            <div className="font-bold text-yellow-600">
              {compliance.violations.filter(v => v.type === 'warning').length}
            </div>
            <div className="text-gray-600">Warnings</div>
          </div>
          
          <div className="text-center">
            <div className="font-bold text-blue-600">
              {compliance.violations.filter(v => v.type === 'suggestion').length}
            </div>
            <div className="text-gray-600">Suggestions</div>
          </div>
          
          <div className="text-center">
            <div className="font-bold text-green-600">
              {compliance.recommendations.length}
            </div>
            <div className="text-gray-600">Recommendations</div>
          </div>
        </div>
      </div>
    </div>
  );
};
