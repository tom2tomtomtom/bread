import React, { useState } from 'react';
import { EnhancedGeneratedOutput } from '../../types';
import { pdfExportService, PDFExportOptions } from '../../services/pdfExportService';

interface ExportManagerProps {
  generatedOutput: EnhancedGeneratedOutput;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

/**
 * ExportManager - Handles all export functionality
 * 
 * Responsibilities:
 * - PDF export with customizable options
 * - CSV export for data analysis
 * - Export configuration management
 * - Export status and error handling
 */
export const ExportManager: React.FC<ExportManagerProps> = ({
  generatedOutput,
  onShowToast,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<PDFExportOptions>({
    includeImages: false,
    includeConfidenceScores: true,
    includeCompliance: true,
    format: 'a4',
    orientation: 'portrait'
  });

  // PDF Export Handler
  const handleExportToPDF = async () => {
    setIsExporting(true);
    try {
      const result = await pdfExportService.exportTerritoriesToPDF(generatedOutput, exportOptions);
      
      if (result.success) {
        console.log(`✅ PDF exported successfully: ${result.filename}`);
        onShowToast?.(`PDF exported: ${result.filename}`, 'success');
      } else {
        console.error('❌ PDF export failed:', result.error);
        onShowToast?.(`PDF export failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('❌ PDF export error:', error);
      onShowToast?.('PDF export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // CSV Export Handler
  const handleExportToCSV = () => {
    try {
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
      generatedOutput.territories.forEach((territory) => {
        const avgConfidence = Math.round(
          (territory.confidence.marketFit +
            territory.confidence.complianceConfidence +
            territory.confidence.audienceResonance) / 3
        );

        territory.headlines.forEach((headline) => {
          csvData.push([
            territory.id,
            territory.title,
            territory.positioning,
            territory.tone,
            avgConfidence,
            territory.confidence.riskLevel,
            headline.text,
            headline.followUp || '',
            headline.reasoning || '',
            headline.confidence || '',
          ]);
        });
      });

      // Convert to CSV string
      const csvContent = csvData.map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `aideas-territories-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      onShowToast?.('CSV exported successfully', 'success');
    } catch (error) {
      console.error('❌ CSV export error:', error);
      onShowToast?.('CSV export failed. Please try again.', 'error');
    }
  };

  // Update export options
  const updateExportOption = <K extends keyof PDFExportOptions>(
    key: K,
    value: PDFExportOptions[K]
  ) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>📄</span>
        Export Options
      </h3>

      {/* Export Options */}
      <div className="space-y-4 mb-6">
        {/* PDF Options */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">PDF Export Settings</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={exportOptions.includeConfidenceScores}
                onChange={(e) => updateExportOption('includeConfidenceScores', e.target.checked)}
                className="rounded"
              />
              Include confidence scores
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={exportOptions.includeCompliance}
                onChange={(e) => updateExportOption('includeCompliance', e.target.checked)}
                className="rounded"
              />
              Include compliance section
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={exportOptions.includeImages}
                onChange={(e) => updateExportOption('includeImages', e.target.checked)}
                className="rounded"
              />
              Include images (if available)
            </label>
          </div>
        </div>

        {/* Format Options */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Format</h4>
          <div className="flex gap-2">
            <select
              value={exportOptions.format}
              onChange={(e) => updateExportOption('format', e.target.value as 'a4' | 'letter')}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
            <select
              value={exportOptions.orientation}
              onChange={(e) => updateExportOption('orientation', e.target.value as 'portrait' | 'landscape')}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExportToPDF}
          disabled={isExporting}
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Exporting...
            </>
          ) : (
            <>
              <span>📄</span>
              Export PDF
            </>
          )}
        </button>

        <button
          onClick={handleExportToCSV}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>📊</span>
          Export CSV
        </button>
      </div>
    </div>
  );
};

export default ExportManager;
