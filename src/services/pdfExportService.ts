import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { EnhancedGeneratedOutput } from '../types';

export interface PDFExportOptions {
  includeImages?: boolean;
  includeConfidenceScores?: boolean;
  includeCompliance?: boolean;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
}

export interface PDFExportResult {
  success: boolean;
  filename?: string;
  error?: string;
  size?: number;
}

/**
 * Secure PDF export service that replaces the memory-leak prone window.open() approach
 * Uses jsPDF for proper PDF generation with automatic cleanup
 */
export class PDFExportService {
  private static instance: PDFExportService;

  public static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService();
    }
    return PDFExportService.instance;
  }

  /**
   * Export territories report to PDF with proper memory management
   */
  public async exportTerritoriesToPDF(
    generatedOutput: EnhancedGeneratedOutput,
    options: PDFExportOptions = {}
  ): Promise<PDFExportResult> {
    try {
      const {
        includeImages = false,
        includeConfidenceScores = true,
        includeCompliance = true,
        format = 'a4',
        orientation = 'portrait',
      } = options;

      // Create PDF document
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format,
      });

      // Set document properties
      pdf.setProperties({
        title: 'AIDEAS Creative Territories Report',
        subject: 'AI-Generated Creative Territories',
        author: 'AIDEAS Platform',
        creator: 'AIDEAS Creative Platform',
      });

      // Add header
      this.addHeader(pdf);

      // Add overall confidence if enabled
      if (includeConfidenceScores) {
        this.addOverallConfidence(pdf, generatedOutput.overallConfidence);
      }

      // Add territories
      let yPosition = 60;
      for (const territory of generatedOutput.territories) {
        yPosition = await this.addTerritory(pdf, territory, yPosition, {
          includeImages,
          includeConfidenceScores,
        });

        // Add new page if needed
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      }

      // Add compliance section if enabled
      if (includeCompliance && generatedOutput.compliance) {
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }
        this.addComplianceSection(pdf, generatedOutput.compliance, yPosition);
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `aideas-territories-${timestamp}.pdf`;

      // Save PDF
      pdf.save(filename);

      return {
        success: true,
        filename,
        size: pdf.internal.pages.length,
      };
    } catch (error) {
      console.error('PDF Export Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Export HTML element to PDF using html2canvas
   */
  public async exportElementToPDF(
    element: HTMLElement,
    filename: string = 'export.pdf'
  ): Promise<PDFExportResult> {
    try {
      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add image to PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up canvas
      canvas.remove();

      // Save PDF
      pdf.save(filename);

      return {
        success: true,
        filename,
        size: pdf.internal.pages.length,
      };
    } catch (error) {
      console.error('Element to PDF Export Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export element to PDF',
      };
    }
  }

  private addHeader(pdf: jsPDF): void {
    // Add logo/title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AIDEAS', 20, 20);

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Creative Territories Report', 20, 30);

    // Add timestamp
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 40);

    // Add separator line
    pdf.setLineWidth(0.5);
    pdf.line(20, 45, 190, 45);
  }

  private addOverallConfidence(pdf: jsPDF, confidence: number): void {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Confidence Score', 20, 55);

    // Color code confidence score
    const color =
      confidence >= 80 ? [34, 197, 94] : confidence >= 60 ? [245, 158, 11] : [239, 68, 68];
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text(`${confidence}%`, 120, 55);
    pdf.setTextColor(0, 0, 0); // Reset to black
  }

  private async addTerritory(
    pdf: jsPDF,
    territory: any,
    yPosition: number,
    options: { includeImages: boolean; includeConfidenceScores: boolean }
  ): Promise<number> {
    let currentY = yPosition;

    // Territory title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${territory.id}: "${territory.title}"`, 20, currentY);
    currentY += 10;

    // Territory details
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    // Positioning
    pdf.text('Positioning:', 20, currentY);
    const positioningLines = pdf.splitTextToSize(territory.positioning, 150);
    pdf.text(positioningLines, 50, currentY);
    currentY += positioningLines.length * 5 + 5;

    // Tone
    pdf.text('Tone:', 20, currentY);
    const toneLines = pdf.splitTextToSize(territory.tone, 150);
    pdf.text(toneLines, 50, currentY);
    currentY += toneLines.length * 5 + 5;

    // Confidence scores if enabled
    if (options.includeConfidenceScores && territory.confidence) {
      const avgConfidence = Math.round(
        (territory.confidence.marketFit +
          territory.confidence.complianceConfidence +
          territory.confidence.audienceResonance) /
          3
      );

      pdf.text('Confidence:', 20, currentY);
      const color =
        avgConfidence >= 80 ? [34, 197, 94] : avgConfidence >= 60 ? [245, 158, 11] : [239, 68, 68];
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(`${avgConfidence}%`, 60, currentY);
      pdf.setTextColor(0, 0, 0);

      pdf.text(`Risk Level: ${territory.confidence.riskLevel}`, 90, currentY);
      currentY += 8;
    }

    // Headlines
    pdf.setFont('helvetica', 'bold');
    pdf.text('Headlines:', 20, currentY);
    currentY += 8;

    pdf.setFont('helvetica', 'normal');
    territory.headlines.forEach((headline: any, index: number) => {
      pdf.text(`${index + 1}. "${headline.text}"`, 25, currentY);
      currentY += 6;

      if (headline.followUp) {
        const followUpLines = pdf.splitTextToSize(headline.followUp, 140);
        pdf.text(followUpLines, 30, currentY);
        currentY += followUpLines.length * 4 + 2;
      }

      if (options.includeConfidenceScores && headline.confidence) {
        pdf.setFontSize(9);
        pdf.text(`Confidence: ${headline.confidence}%`, 30, currentY);
        currentY += 5;
        pdf.setFontSize(11);
      }

      currentY += 3;
    });

    currentY += 10; // Space between territories
    return currentY;
  }

  private addComplianceSection(pdf: jsPDF, compliance: any, yPosition: number): void {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Compliance Summary', 20, yPosition);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    let currentY = yPosition + 10;

    if (compliance.output) {
      pdf.text('Output:', 20, currentY);
      const outputLines = pdf.splitTextToSize(compliance.output, 150);
      pdf.text(outputLines, 20, currentY + 5);
      currentY += outputLines.length * 5 + 10;
    }

    if (compliance.powerBy && compliance.powerBy.length > 0) {
      pdf.text('Powered by:', 20, currentY);
      pdf.text(compliance.powerBy.join(', '), 20, currentY + 5);
      currentY += 15;
    }

    if (compliance.notes && compliance.notes.length > 0) {
      pdf.text('Notes:', 20, currentY);
      currentY += 8;

      compliance.notes.forEach((note: string) => {
        const noteLines = pdf.splitTextToSize(`• ${note}`, 160);
        pdf.text(noteLines, 25, currentY);
        currentY += noteLines.length * 5 + 3;
      });
    }
  }
}

// Export singleton instance
export const pdfExportService = PDFExportService.getInstance();
