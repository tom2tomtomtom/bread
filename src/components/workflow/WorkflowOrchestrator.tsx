import React from 'react';
import { useTemplateWorkflowStore, WorkflowStep } from '../../stores/templateWorkflowStore';
import { TemplateSelector } from '../templates/TemplateSelector';
import { TemplateCustomizer } from '../templates/TemplateCustomizer';
import { MotivationGenerator } from '../motivation/MotivationGenerator';
import { CopyGenerator } from '../copy/CopyGenerator';
import { AssetLibrary } from '../assets/AssetLibrary';
import { ExportManager } from '../territory/ExportManager';
import { useCopyStore } from '../../stores/copyStore';
import { useAssetStore } from '../../stores/assetStore';
interface WorkflowOrchestratorProps {
  onComplete?: () => void;
}

const STEP_LABELS: Record<WorkflowStep, string> = {
  'template-selection': 'Select Template',
  'brief-input': 'Input Brief',
  'motivation-generation': 'Generate Motivations',
  'copy-generation': 'Generate Copy',
  'asset-selection': 'Select Assets',
  'template-population': 'Populate Template',
  'export': 'Export & Download',
};

const STEP_ICONS: Record<WorkflowStep, string> = {
  'template-selection': '🎯',
  'brief-input': '📝',
  'motivation-generation': '🧠',
  'copy-generation': '✍️',
  'asset-selection': '🖼️',
  'template-population': '🎨',
  'export': '📤',
};

export const WorkflowOrchestrator: React.FC<WorkflowOrchestratorProps> = ({
  onComplete,
}) => {
  const {
    currentStep,
    completedSteps,
    nextStep,
    previousStep,
    goToStep,
    canProceedToStep,
  } = useTemplateWorkflowStore();

  const handleStepClick = (step: WorkflowStep) => {
    if (canProceedToStep(step)) {
      goToStep(step);
    }
  };

  const handleContinue = () => {
    nextStep();
  };

  const handleBack = () => {
    previousStep();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'template-selection':
        return (
          <TemplateSelectionStep 
            onContinue={handleContinue}
          />
        );
      case 'brief-input':
        return (
          <BriefInputStep 
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 'motivation-generation':
        return (
          <MotivationGenerator 
            onContinue={handleContinue}
          />
        );
      case 'copy-generation':
        return (
          <CopyGenerator 
            onContinue={handleContinue}
          />
        );
      case 'asset-selection':
        return (
          <AssetSelectionStep 
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 'template-population':
        return (
          <TemplatePopulationStep 
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 'export':
        return (
          <ExportStep 
            onComplete={onComplete}
            onBack={handleBack}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Progress Bar */}
      <WorkflowProgressBar 
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        canProceedToStep={canProceedToStep}
      />

      {/* Step Content */}
      <div className="container mx-auto">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

interface WorkflowProgressBarProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  onStepClick: (step: WorkflowStep) => void;
  canProceedToStep: (step: WorkflowStep) => boolean;
}

const WorkflowProgressBar: React.FC<WorkflowProgressBarProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  canProceedToStep,
}) => {
  const steps: WorkflowStep[] = [
    'template-selection',
    'brief-input',
    'motivation-generation',
    'copy-generation',
    'asset-selection',
    'template-population',
    'export'
  ];

  const getStepStatus = (step: WorkflowStep) => {
    if (completedSteps.includes(step)) return 'completed';
    if (step === currentStep) return 'current';
    if (canProceedToStep(step)) return 'available';
    return 'locked';
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500';
      case 'current':
        return 'bg-orange-500 text-white border-orange-500';
      case 'available':
        return 'bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer';
      case 'locked':
        return 'bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed';
      default:
        return 'bg-gray-600 text-gray-400 border-gray-600';
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step);
            const isClickable = status === 'available' || status === 'completed';
            
            return (
              <div key={step} className="flex items-center">
                {/* Step Circle */}
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${getStepClasses(status)}
                  `}
                  onClick={isClickable ? () => onStepClick(step) : undefined}
                  title={STEP_LABELS[step]}
                >
                  {status === 'completed' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-lg">{STEP_ICONS[step]}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-medium ${
                    status === 'current' ? 'text-orange-400' : 
                    status === 'completed' ? 'text-green-400' : 
                    status === 'available' ? 'text-white' : 'text-gray-500'
                  }`}>
                    {STEP_LABELS[step]}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-4 rounded-full transition-all duration-300
                    ${completedSteps.includes(step) ? 'bg-green-500' : 'bg-gray-600'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Template Selection Step - integrated with existing TemplateSelector
const TemplateSelectionStep: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  const { selectTemplate } = useTemplateWorkflowStore();

  const handleTemplateSelected = (template: any) => {
    // Convert template to our SelectedTemplate format
    const selectedTemplate = {
      id: template.id,
      name: template.name,
      type: template.type,
      format: template.channelSpecs?.supportedChannels?.[0] || 'general',
      requirements: {
        headlineMaxLength: template.channelSpecs?.maxCharacters?.headline,
        bodyTextMaxLength: template.channelSpecs?.maxCharacters?.body,
        requiredAssets: template.channelSpecs?.requiredAssets || [],
        optionalAssets: template.channelSpecs?.optionalAssets || [],
      },
    };
    
    selectTemplate(selectedTemplate);
    onContinue();
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">🎯 Select Your Template</h1>
        <p className="text-gray-400 text-lg">Choose the ad format that best fits your campaign goals</p>
      </div>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <TemplateSelector 
          onTemplateSelected={handleTemplateSelected}
        />
      </div>
    </div>
  );
};

const BriefInputStep: React.FC<{ onContinue: () => void; onBack: () => void }> = ({ onContinue, onBack }) => {
  const { setBrief } = useTemplateWorkflowStore();
  const [briefText, setBriefText] = React.useState('');
  const [audience, setAudience] = React.useState('');
  const [goal, setGoal] = React.useState('');
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStatus, setProcessingStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleContinue = () => {
    setBrief(briefText, audience, goal);
    onContinue();
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    console.log('🔍 Extracting text from file:', { 
      name: file.name, 
      type: file.type, 
      size: file.size 
    });

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      console.log('📄 Processing as text file');
      const text = await file.text();
      console.log('✅ Text extracted, length:', text.length);
      return text;
    }

    if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      console.log('📘 Word document detected - attempting extraction');
      try {
        // Import mammoth dynamically to avoid bundle issues
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log('✅ Word document text extracted, length:', result.value.length);
        return result.value;
      } catch (error) {
        console.log('❌ Word document extraction failed:', error);
        return `Word document "${file.name}" detected. Please copy and paste the text content from your document into the text area below.`;
      }
    }

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      console.log('📕 PDF file detected - showing help message');
      return `PDF file "${file.name}" detected. Please copy and paste the text content from your PDF into the text area below.`;
    }

    // Try to read as text anyway
    console.log('🔄 Attempting to read as generic text file');
    try {
      const text = await file.text();
      console.log('✅ Generic text extraction successful, length:', text.length);
      return text;
    } catch (error) {
      console.log('❌ Text extraction failed:', error);
      return `File "${file.name}" uploaded. Please copy and paste the text content into the text area below.`;
    }
  };

  const processFile = async (file: File) => {
    console.log('🚀 Starting file processing:', file.name);
    setIsProcessing(true);
    setProcessingStatus('processing');
    setStatusMessage(`Processing ${file.name}...`);
    
    try {
      const text = await extractTextFromFile(file);
      console.log('📝 Text content preview:', text.substring(0, 200) + '...');
      
      // Try to intelligently parse the content
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      console.log('📋 Parsed into', lines.length, 'lines');
      
      // Look for common patterns in briefs
      let extractedGoal = '';
      let extractedAudience = '';
      let extractedBrief = text;

      // Enhanced parsing patterns
      const goalKeywords = ['goal', 'objective', 'purpose', 'aim', 'mission', 'campaign goal', 'business objective', 'marketing goal'];
      const audienceKeywords = ['audience', 'target', 'demographic', 'customer', 'consumer', 'user', 'segment', 'market'];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        const nextLine = lines[i + 1] || '';
        
        // Look for goal/objective indicators with more patterns
        if (!extractedGoal) {
          for (const keyword of goalKeywords) {
            if (line.includes(keyword)) {
              // Check if the goal is on the same line after a colon
              if (line.includes(':')) {
                const parts = lines[i].split(':');
                if (parts.length > 1) {
                  extractedGoal = parts.slice(1).join(':').trim();
                  break;
                }
              }
              // Check if the goal is on the next line
              else if (nextLine && nextLine.length > 10) {
                extractedGoal = nextLine;
                break;
              }
              // Check if it's a formatted line like "Goal: Increase brand awareness"
              else if (line.includes(keyword) && lines[i].length > keyword.length + 5) {
                extractedGoal = lines[i].substring(lines[i].toLowerCase().indexOf(keyword) + keyword.length).replace(/[:\-\s]*/, '').trim();
                break;
              }
            }
          }
        }
        
        // Look for audience/target indicators with more patterns
        if (!extractedAudience) {
          for (const keyword of audienceKeywords) {
            if (line.includes(keyword)) {
              // Check if the audience is on the same line after a colon
              if (line.includes(':')) {
                const parts = lines[i].split(':');
                if (parts.length > 1) {
                  extractedAudience = parts.slice(1).join(':').trim();
                  break;
                }
              }
              // Check if the audience is on the next line
              else if (nextLine && nextLine.length > 10) {
                extractedAudience = nextLine;
                break;
              }
              // Check if it's a formatted line like "Target Audience: Young professionals"
              else if (line.includes(keyword) && lines[i].length > keyword.length + 5) {
                extractedAudience = lines[i].substring(lines[i].toLowerCase().indexOf(keyword) + keyword.length).replace(/[:\-\s]*/, '').trim();
                break;
              }
            }
          }
        }
      }

      // Clean up extracted fields and validate
      if (extractedGoal) {
        extractedGoal = extractedGoal.replace(/^[:\-\s]+/, '').trim();
        if (extractedGoal.length > 300 || extractedGoal.length < 5) extractedGoal = '';
      }
      
      if (extractedAudience) {
        extractedAudience = extractedAudience.replace(/^[:\-\s]+/, '').trim();
        if (extractedAudience.length > 300 || extractedAudience.length < 5) extractedAudience = '';
      }

      // Update the form fields
      console.log('📝 Updating form fields with extracted content');
      setBriefText(text);
      if (extractedGoal) {
        console.log('🎯 Setting goal:', extractedGoal);
        setGoal(extractedGoal);
      }
      if (extractedAudience) {
        console.log('👥 Setting audience:', extractedAudience);
        setAudience(extractedAudience);
      }

      // Show success message if parsing was successful
      if (extractedGoal || extractedAudience) {
        console.log('✅ Successfully parsed brief:', { 
          goal: extractedGoal ? 'Found' : 'Not found', 
          audience: extractedAudience ? 'Found' : 'Not found' 
        });
        setProcessingStatus('success');
        setStatusMessage(`✅ File processed! ${extractedGoal ? 'Goal' : ''}${extractedGoal && extractedAudience ? ' and ' : ''}${extractedAudience ? 'Audience' : ''} automatically detected.`);
      } else {
        console.log('⚠️ No goal or audience automatically detected - user can fill manually');
        setProcessingStatus('success');
        setStatusMessage(`✅ File content loaded. Please fill goal and audience fields manually.`);
      }

    } catch (error) {
      console.log('❌ File processing error:', error);
      setBriefText(`Error reading file "${file.name}". Please copy and paste the content manually.`);
      setProcessingStatus('error');
      setStatusMessage(`❌ Error processing ${file.name}. Please try again or paste content manually.`);
    } finally {
      setIsProcessing(false);
      // Clear status message after 5 seconds
      setTimeout(() => {
        setProcessingStatus('idle');
        setStatusMessage('');
      }, 5000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    console.log('📂 File dropped!');
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('📁 Files detected:', files.length, files.map(f => f.name));
    if (files.length > 0) {
      processFile(files[0]); // Process the first file
    } else {
      console.log('❌ No files in drop event');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input changed');
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('📄 Selected file:', files[0].name);
      processFile(files[0]);
    } else {
      console.log('❌ No files selected');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">📝 Input Your Brief</h1>
        <p className="text-gray-400 text-lg">Provide details about your campaign or drag & drop a file</p>
      </div>

      {/* Drag & Drop Zone */}
      <div 
        className={`mb-6 p-6 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
          processingStatus === 'success' ? 'border-green-400 bg-green-400/10' :
          processingStatus === 'error' ? 'border-red-400 bg-red-400/10' :
          isDragOver ? 'border-orange-400 bg-orange-400/10' : 
          'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        <div className="text-center">
          {isProcessing ? (
            <div className="text-orange-400">
              <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Processing file...</p>
              {statusMessage && <p className="text-sm mt-2">{statusMessage}</p>}
            </div>
          ) : processingStatus === 'success' ? (
            <div className="text-green-400">
              <div className="text-4xl mb-4">✅</div>
              <p className="font-medium mb-2">{statusMessage}</p>
              <p className="text-gray-400 text-sm">Drop another file to replace</p>
            </div>
          ) : processingStatus === 'error' ? (
            <div className="text-red-400">
              <div className="text-4xl mb-4">❌</div>
              <p className="font-medium mb-2">{statusMessage}</p>
              <p className="text-gray-400 text-sm">Try again or paste content manually</p>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-4">📄</div>
              <p className="text-white font-medium mb-2">
                Drag & drop your brief file here
              </p>
              <p className="text-gray-400 text-sm">
                Supports .txt, .pdf, .doc, .docx files or click to browse
              </p>
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.doc,.docx"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Campaign Goal
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
            placeholder="e.g., Increase brand awareness, Drive sales, Launch new product..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Audience
          </label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
            placeholder="e.g., Young professionals aged 25-35, Tech enthusiasts..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Campaign Brief
          </label>
          <textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all resize-none"
            rows={8}
            placeholder="Describe your product, key benefits, brand personality, and any specific requirements..."
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!briefText || !audience || !goal}
            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-semibold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Motivations →
          </button>
        </div>
      </div>
    </div>
  );
};

const AssetSelectionStep: React.FC<{ onContinue: () => void; onBack: () => void }> = ({ onContinue, onBack }) => {
  const { selectedAssets } = useAssetStore();
  const { markStepCompleted } = useTemplateWorkflowStore();

  const handleAssetSelect = (asset: any) => {
    // Asset selection is handled by the AssetLibrary component
    console.log('Asset selected:', asset);
  };

  const handleContinue = () => {
    markStepCompleted('asset-selection');
    onContinue();
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">🖼️ Select Assets</h1>
        <p className="text-gray-400 text-lg">Choose existing assets or generate new ones for your campaign</p>
        {selectedAssets.length > 0 && (
          <div className="mt-4 text-orange-400">
            {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
        <AssetLibrary
          onAssetSelect={handleAssetSelect}
          selectionMode={true}
          className="text-white"
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300"
        >
          ← Back
        </button>
        <button
          onClick={handleContinue}
          className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-semibold px-8 py-3 rounded-xl transition-all duration-300"
        >
          Continue to Template Population →
        </button>
      </div>
    </div>
  );
};

const TemplatePopulationStep: React.FC<{ onContinue: () => void; onBack: () => void }> = ({ onContinue, onBack }) => {
  const { selectedCopy } = useCopyStore();
  const { selectedAssets } = useAssetStore();
  const { selectedTemplate, markStepCompleted } = useTemplateWorkflowStore();

  const handleCustomizationComplete = (customizations: any) => {
    console.log('Template customization complete:', customizations);
    markStepCompleted('template-population');
    onContinue();
  };

  const handlePreviewGenerated = () => {
    console.log('Template preview generated');
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">🎨 Populate Template</h1>
        <p className="text-gray-400 text-lg">Customize your selected template with copy and assets</p>
        
        {/* Show current selections */}
        <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-gray-400 mb-1">Template</div>
            <div className="text-orange-400 font-medium">
              {selectedTemplate?.name || 'No template selected'}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-gray-400 mb-1">Copy</div>
            <div className="text-green-400 font-medium">
              {selectedCopy ? 'Copy ready' : 'No copy selected'}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-gray-400 mb-1">Assets</div>
            <div className="text-blue-400 font-medium">
              {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
        <TemplateCustomizer
          onCustomizationComplete={handleCustomizationComplete}
          onPreviewGenerated={handlePreviewGenerated}
          onBack={onBack}
        />
      </div>
    </div>
  );
};

const ExportStep: React.FC<{ onComplete?: () => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const { selectedCopy } = useCopyStore();
  const { selectedAssets } = useAssetStore();
  const { selectedTemplate, markStepCompleted } = useTemplateWorkflowStore();
  const [toastMessage, setToastMessage] = React.useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Create a mock generated output for the export manager
  const mockGeneratedOutput = React.useMemo(() => {
    if (!selectedCopy || !selectedTemplate) return null;

    return {
      territories: [
        {
          id: 'workflow-territory-1',
          title: selectedCopy.headline,
          positioning: selectedCopy.bodyText,
          tone: 'Professional',
          headlines: [
            {
              text: selectedCopy.headline,
              followUp: selectedCopy.bodyText,
              reasoning: 'Generated from workflow copy selection',
              confidence: 90
            }
          ],
          confidence: {
            marketFit: 85,
            complianceConfidence: 90,
            audienceResonance: 88,
            riskLevel: 'LOW' as const
          }
        }
      ],
      overallConfidence: 87.7, // Average of the confidence scores
      compliance: {
        overallScore: 90,
        issues: [],
        recommendations: ['Campaign meets all compliance requirements'],
        powerBy: ['workflow-integration'],
        output: 'All compliance checks passed',
        notes: ['Generated from workflow integration']
      },
      metadata: {
        generatedAt: new Date(),
        model: 'workflow-integration',
        requestId: 'workflow-' + Date.now(),
        processingTime: 2500
      }
    };
  }, [selectedCopy, selectedTemplate]);

  const handleToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleExportComplete = () => {
    markStepCompleted('export');
    onComplete?.();
  };

  if (!mockGeneratedOutput) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">📤 Export & Download</h1>
          <p className="text-red-400 text-lg">Please complete previous steps to enable export</p>
          <button
            onClick={onBack}
            className="mt-8 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">📤 Export & Download</h1>
        <p className="text-gray-400 text-lg">Your advertisement is ready for download</p>
        
        {/* Campaign Summary */}
        <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 mb-2">Final Campaign</div>
            <div className="text-white font-medium text-left">
              <div className="text-orange-400 font-bold mb-1">{selectedCopy?.headline}</div>
              <div className="text-gray-300 text-xs">{selectedCopy?.bodyText}</div>
              <div className="text-green-400 text-xs mt-2">{selectedCopy?.callToAction}</div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 mb-2">Template</div>
            <div className="text-white font-medium">
              {selectedTemplate?.name}
              <div className="text-xs text-gray-400 mt-1">{selectedTemplate?.type}</div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 mb-2">Assets</div>
            <div className="text-white font-medium">
              {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} included
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Message */}
      {toastMessage && (
        <div className={`mb-6 p-4 rounded-xl ${
          toastMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
          toastMessage.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
          'bg-blue-500/20 border border-blue-500/30 text-blue-300'
        }`}>
          {toastMessage.message}
        </div>
      )}
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
        <ExportManager
          generatedOutput={mockGeneratedOutput}
          onShowToast={handleToast}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300"
        >
          ← Back
        </button>
        <button
          onClick={handleExportComplete}
          className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-300 hover:to-green-500 text-black font-semibold px-8 py-3 rounded-xl transition-all duration-300"
        >
          ✅ Complete Campaign Creation
        </button>
      </div>
    </div>
  );
};