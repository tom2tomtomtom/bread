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
  const { setParsedBrief, parsedBrief, briefText: storedBriefText } = useTemplateWorkflowStore();
  const [briefText, setBriefText] = React.useState(storedBriefText || '');
  const [parsedFields, setParsedFields] = React.useState(parsedBrief || {
    goal: '',
    targetAudience: '',
    keyBenefits: [],
    brandPersonality: '',
    productDetails: '',
    campaignRequirements: '',
    toneMood: '',
    callToAction: '',
    competitiveContext: '',
    constraints: ''
  });
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStatus, setProcessingStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleContinue = () => {
    setParsedBrief(briefText, parsedFields);
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

  const callBriefParsingAPI = async (text: string, fileName?: string) => {
    console.log('🤖 Calling AI brief parsing API...');
    try {
      const response = await fetch('/.netlify/functions/parse-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          briefText: text,
          fileName: fileName
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ AI parsing successful:', data);

      if (data.success && data.parsedBrief) {
        return data.parsedBrief;
      } else {
        throw new Error(data.error || 'Failed to parse brief');
      }
    } catch (error) {
      console.error('❌ API parsing failed:', error);
      throw error;
    }
  };

  const processFile = async (file: File) => {
    console.log('🚀 Starting file processing:', file.name);
    setIsProcessing(true);
    setProcessingStatus('processing');
    setStatusMessage(`Processing ${file.name}...`);
    
    try {
      // Step 1: Extract text from file
      const text = await extractTextFromFile(file);
      console.log('📝 Text content preview:', text.substring(0, 200) + '...');
      
      // Update the brief text immediately
      setBriefText(text);

      // Step 2: Parse brief using AI API
      setStatusMessage(`Analyzing brief content with AI...`);
      const aiParsedBrief = await callBriefParsingAPI(text, file.name);
      
      // Update parsed fields
      console.log('📝 Updating form fields with AI-parsed content');
      setParsedFields(aiParsedBrief);

      // Count how many fields were successfully parsed
      const parsedFieldCount = Object.values(aiParsedBrief).filter(value => {
        if (Array.isArray(value)) return value.length > 0;
        return value && value.toString().trim().length > 0;
      }).length;

      console.log('✅ Successfully parsed brief with AI:', { 
        fieldsExtracted: parsedFieldCount,
        goal: aiParsedBrief.goal ? 'Found' : 'Not found',
        audience: aiParsedBrief.targetAudience ? 'Found' : 'Not found',
        benefits: aiParsedBrief.keyBenefits?.length || 0
      });

      setProcessingStatus('success');
      setStatusMessage(`✅ AI analysis complete! Extracted ${parsedFieldCount} structured fields from your brief.`);

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
        {/* Brief Text */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Campaign Brief (Raw Text)
            </label>
            {briefText.length > 50 && (
              <button
                onClick={() => callBriefParsingAPI(briefText).then(setParsedFields).catch(console.error)}
                disabled={isProcessing}
                className="text-sm bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 px-3 py-1 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                🤖 AI Parse
              </button>
            )}
          </div>
          <textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all resize-none"
            rows={6}
            placeholder="Paste or type your campaign brief here, or drag and drop a file above..."
          />
        </div>

        {/* Parsed Fields Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Goal *
            </label>
            <input
              type="text"
              value={parsedFields.goal}
              onChange={(e) => setParsedFields({...parsedFields, goal: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
              placeholder="e.g., Increase brand awareness, Drive sales..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Audience *
            </label>
            <input
              type="text"
              value={parsedFields.targetAudience}
              onChange={(e) => setParsedFields({...parsedFields, targetAudience: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
              placeholder="e.g., Young professionals aged 25-35..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product/Service Details
            </label>
            <input
              type="text"
              value={parsedFields.productDetails}
              onChange={(e) => setParsedFields({...parsedFields, productDetails: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
              placeholder="What are you advertising?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Brand Personality
            </label>
            <input
              type="text"
              value={parsedFields.brandPersonality}
              onChange={(e) => setParsedFields({...parsedFields, brandPersonality: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
              placeholder="e.g., Modern, trustworthy, innovative..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tone & Mood
            </label>
            <input
              type="text"
              value={parsedFields.toneMood}
              onChange={(e) => setParsedFields({...parsedFields, toneMood: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
              placeholder="e.g., Professional, friendly, urgent..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Call to Action
            </label>
            <input
              type="text"
              value={parsedFields.callToAction}
              onChange={(e) => setParsedFields({...parsedFields, callToAction: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
              placeholder="e.g., Shop now, Learn more, Sign up..."
            />
          </div>
        </div>

        {/* Key Benefits */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Key Benefits (one per line)
          </label>
          <textarea
            value={parsedFields.keyBenefits.join('\n')}
            onChange={(e) => setParsedFields({...parsedFields, keyBenefits: e.target.value.split('\n').filter(b => b.trim())})}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all resize-none"
            rows={3}
            placeholder="List the main benefits or value propositions..."
          />
        </div>

        {/* Additional Fields */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Requirements
            </label>
            <input
              type="text"
              value={parsedFields.campaignRequirements}
              onChange={(e) => setParsedFields({...parsedFields, campaignRequirements: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
              placeholder="Specific requirements or constraints..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Competitive Context
            </label>
            <input
              type="text"
              value={parsedFields.competitiveContext}
              onChange={(e) => setParsedFields({...parsedFields, competitiveContext: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
              placeholder="Competitor insights or differentiation..."
            />
          </div>
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
            disabled={!briefText || !parsedFields.goal || !parsedFields.targetAudience}
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
  const { selectedAssets, uploadAssets, generateImage, generateVideo, isGeneratingImage, isGeneratingVideo, generationError, uploadProgress, isUploading } = useAssetStore();
  const { markStepCompleted, parsedBrief, briefText } = useTemplateWorkflowStore();
  const [activeTab, setActiveTab] = React.useState<'browse' | 'generate-images' | 'generate-videos' | 'upload'>('browse');
  const [imagePrompt, setImagePrompt] = React.useState('');
  const [videoSettings, setVideoSettings] = React.useState({
    sourceImageUrl: '',
    animationType: 'subtle_float' as const,
    duration: 3,
    platformOptimization: 'instagram' as const
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleAssetSelect = (asset: any) => {
    // Asset selection is handled by the AssetLibrary component
    console.log('Asset selected:', asset);
  };

  const handleContinue = () => {
    markStepCompleted('asset-selection');
    onContinue();
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;

    // Use parsed brief data to enhance the prompt
    const enhancedPrompt = parsedBrief ? 
      `${imagePrompt}. Brand personality: ${parsedBrief.brandPersonality}. Tone: ${parsedBrief.toneMood}. Product: ${parsedBrief.productDetails}` :
      imagePrompt;

    try {
      await generateImage({
        prompt: enhancedPrompt,
        imageType: 'hero',
        culturalContext: 'global',
        quality: 'hd',
        styleConsistency: true,
        brandGuidelines: parsedBrief ? {
          colors: {
            primary: '#FF6B35',
            secondary: ['#F7931E', '#FFD23F'],
            accent: ['#007BFF', '#28A745'],
            neutral: ['#6C757D', '#E9ECEF']
          },
          style: parsedBrief.brandPersonality ? [parsedBrief.brandPersonality] : ['modern'],
          tone: parsedBrief.toneMood || 'professional'
        } : undefined
      });
      setImagePrompt('');
    } catch (error) {
      console.error('Image generation failed:', error);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoSettings.sourceImageUrl) return;

    try {
      await generateVideo({
        sourceImageId: 'temp-id',
        sourceImageUrl: videoSettings.sourceImageUrl,
        animationType: videoSettings.animationType,
        duration: videoSettings.duration,
        outputFormat: 'mp4',
        platformOptimization: videoSettings.platformOptimization,
        quality: 'hd'
      });
    } catch (error) {
      console.error('Video generation failed:', error);
    }
  };

  const handleFileUpload = (files: File[]) => {
    uploadAssets(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
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
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(Array.from(files));
    }
  };

  const tabs = [
    { id: 'browse', label: 'Browse Library', icon: '📚' },
    { id: 'generate-images', label: 'Generate Images', icon: '🎨' },
    { id: 'generate-videos', label: 'Generate Videos', icon: '🎬' },
    { id: 'upload', label: 'Upload Assets', icon: '📤' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">🖼️ Select & Create Assets</h1>
        <p className="text-gray-400 text-lg">Browse existing assets, generate new ones, or upload your own</p>
        {selectedAssets.length > 0 && (
          <div className="mt-4 text-orange-400">
            {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1 inline-flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-black font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8 min-h-[500px]">
        {activeTab === 'browse' && (
          <div>
            <AssetLibrary
              onAssetSelect={handleAssetSelect}
              selectionMode={true}
              className="text-white"
            />
          </div>
        )}

        {activeTab === 'generate-images' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">🎨 AI Image Generation</h3>
              <p className="text-gray-400">Create custom images using AI based on your campaign brief</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image Description
                </label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all resize-none"
                  rows={4}
                  placeholder="Describe the image you want to generate... (e.g., Professional product photo of a smartphone on a clean white background with soft lighting)"
                />
              </div>

              {parsedBrief && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-300 font-medium mb-2">✨ Auto-Enhanced with Campaign Data:</h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    {parsedBrief.brandPersonality && <li>• Brand: {parsedBrief.brandPersonality}</li>}
                    {parsedBrief.toneMood && <li>• Tone: {parsedBrief.toneMood}</li>}
                    {parsedBrief.productDetails && <li>• Product: {parsedBrief.productDetails}</li>}
                  </ul>
                </div>
              )}

              <button
                onClick={handleGenerateImage}
                disabled={!imagePrompt.trim() || isGeneratingImage}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-black disabled:text-gray-400 font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                {isGeneratingImage ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                    Generating Image...
                  </div>
                ) : (
                  '🎨 Generate Image'
                )}
              </button>

              {generationError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{generationError}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'generate-videos' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">🎬 AI Video Generation</h3>
              <p className="text-gray-400">Create animated videos from images</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source Image URL
                </label>
                <input
                  type="url"
                  value={videoSettings.sourceImageUrl}
                  onChange={(e) => setVideoSettings({...videoSettings, sourceImageUrl: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                  placeholder="Paste image URL to animate..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Animation Type
                  </label>
                  <select
                    value={videoSettings.animationType}
                    onChange={(e) => setVideoSettings({...videoSettings, animationType: e.target.value as any})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                  >
                    <option value="subtle_float">Subtle Float</option>
                    <option value="gentle_rotation">Gentle Rotation</option>
                    <option value="parallax">Parallax</option>
                    <option value="zoom">Zoom</option>
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={videoSettings.duration}
                    onChange={(e) => setVideoSettings({...videoSettings, duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform Optimization
                </label>
                <select
                  value={videoSettings.platformOptimization}
                  onChange={(e) => setVideoSettings({...videoSettings, platformOptimization: e.target.value as any})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={!videoSettings.sourceImageUrl || isGeneratingVideo}
                className="w-full bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-300 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white disabled:text-gray-400 font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                {isGeneratingVideo ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating Video...
                  </div>
                ) : (
                  '🎬 Generate Video'
                )}
              </button>

              {generationError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{generationError}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">📤 Upload Assets</h3>
              <p className="text-gray-400">Add your own images, videos, and other assets to the library</p>
            </div>

            {/* Drag & Drop Zone */}
            <div 
              className={`max-w-2xl mx-auto p-8 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
                isDragOver 
                  ? 'border-orange-400 bg-orange-400/10' 
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                {isUploading ? (
                  <div className="text-orange-400">
                    <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Uploading assets...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-white font-medium mb-2">
                      Drag & drop your assets here
                    </p>
                    <p className="text-gray-400 text-sm">
                      Supports images, videos, audio files (max 50MB each)
                    </p>
                    <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-black font-medium px-6 py-2 rounded-lg transition-colors">
                      Choose Files
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="max-w-2xl mx-auto space-y-2">
                {uploadProgress.map((progress) => (
                  <div key={progress.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm">{progress.filename}</span>
                      <span className="text-gray-400 text-xs">{progress.status}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress.status === 'complete' ? 'bg-green-500' :
                          progress.status === 'error' ? 'bg-red-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                    {progress.error && (
                      <p className="text-red-300 text-xs mt-1">{progress.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}
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