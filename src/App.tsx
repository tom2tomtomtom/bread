import React, { useState, useEffect, useMemo } from 'react';
import { generateWithOpenAI, generateWithClaude } from './services/aiService';
import { analyzeBrief, enhanceGeneratedOutput, EnhancedGeneratedOutput, BriefAnalysis } from './services/enhancementService';
import { ShoppingMoments } from './components/ShoppingMoments';
import { AdminPanel } from './components/AdminPanel';
import { BriefEnhancement } from './components/BriefEnhancement';
import { TerritoryOutput } from './components/TerritoryOutput';
import { BriefInput } from './components/BriefInput';

export interface Territory {
  id: string;
  title: string;
  positioning: string;
  tone: string;
  headlines: string[];
}

export interface ComplianceData {
  powerBy: string[];
  output: string;
  notes: string[];
}

export interface GeneratedOutput {
  territories: Territory[];
  compliance: ComplianceData;
}

export interface Prompts {
  systemInstructions: string;
  brandGuidelines: string;
  territoryPrompt: string;
  headlinePrompt: string;
  compliancePrompt: string;
}

export interface ApiKeys {
  openai: string;
  claude: string;
}

const BreadApp: React.FC = () => {
  const [selectedAI, setSelectedAI] = useState<'openai' | 'claude'>('openai');
  const [brief, setBrief] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [generatedOutput, setGeneratedOutput] = useState<EnhancedGeneratedOutput | null>(null);
  const [error, setError] = useState<string>('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    claude: ''
  });
  const [apiKeysSaved, setApiKeysSaved] = useState<boolean>(false);
  const [showBriefAnalysis, setShowBriefAnalysis] = useState<boolean>(false);

  const [prompts, setPrompts] = useState<Prompts>({
    systemInstructions: `You are BREAD®, a creative AI platform designed to generate high-quality advertising territories and headlines for Everyday Rewards, Australia's largest loyalty program.

Your role is to:
1. Generate 6 distinct creative territories with unique positioning
2. Create 3 compelling headlines per territory
3. Ensure Australian market relevance and cultural nuances
4. Maintain brand consistency with Everyday Rewards values
5. Provide compliance guidance for ACCC standards

Always structure your response with clear separation between TERRITORIES and EXECUTIONS.`,
    
    brandGuidelines: `EVERYDAY REWARDS BRAND GUIDELINES:

Brand Personality: Friendly, helpful, rewarding, accessible
Tone of Voice: Conversational, optimistic, inclusive, Australian
Key Messages: 
- Every shop counts
- Rewards that matter
- Making everyday better
- Value for all Australians

Competitive Context:
- Position against one-off sales events
- Emphasize ongoing value vs limited-time offers
- Highlight accessibility and inclusivity
- Focus on everyday benefits over flashy promotions`,

    territoryPrompt: `Generate exactly 6 creative territories. Each territory should include:
- A catchy title (2-4 words)
- Clear positioning statement (1-2 sentences)
- Distinct strategic angle

Territory themes should explore:
- Everyday value vs event-driven savings
- Inclusive rewards for all Australians  
- Smart shopping without the pressure
- Consistent benefits vs unpredictable deals
- Community and belonging
- Australian cultural moments`,

    headlinePrompt: `For each territory, create exactly 3 headlines that:
- Capture the territory's core message
- Use conversational Australian tone
- Include specific value propositions
- Are suitable for digital advertising
- Range from 4-12 words each
- Avoid hyperbole or unsubstantiated claims`,

    compliancePrompt: `Provide compliance guidance covering:
- ACCC advertising standards alignment
- Terms and conditions requirements
- Substantiation needs for claims made
- Risk assessment for proposed messaging
- Recommended disclaimers if needed`
  });

  // Real-time brief analysis
  const briefAnalysis: BriefAnalysis = useMemo(() => {
    if (brief.trim().length < 10) {
      return {
        score: 0,
        suggestions: [],
        strengths: [],
        warnings: [],
        marketInsights: []
      };
    }
    return analyzeBrief(brief);
  }, [brief]);

  // Show analysis when brief has content and user is typing
  useEffect(() => {
    if (brief.trim().length > 20 && !showOutput) {
      setShowBriefAnalysis(true);
    } else {
      setShowBriefAnalysis(false);
    }
  }, [brief, showOutput]);

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedOpenAI = localStorage.getItem('bread_openai_key');
    const savedClaude = localStorage.getItem('bread_claude_key');
    
    setApiKeys({
      openai: savedOpenAI || '',
      claude: savedClaude || ''
    });
  }, []);

  const handleApiKeyUpdate = (provider: keyof ApiKeys, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: key
    }));
  };

  const saveApiKeys = () => {
    localStorage.setItem('bread_openai_key', apiKeys.openai);
    localStorage.setItem('bread_claude_key', apiKeys.claude);
    setApiKeysSaved(true);
    setTimeout(() => setApiKeysSaved(false), 2000);
  };

  const handlePromptUpdate = (key: keyof Prompts, value: string) => {
    setPrompts(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerate = async () => {
    if (!brief.trim()) {
      setError('Please enter a brief before generating.');
      return;
    }

    // Check if API key is available for selected AI
    const requiredKey = selectedAI === 'openai' ? apiKeys.openai : apiKeys.claude;
    if (!requiredKey) {
      setError(`Please configure your ${selectedAI === 'openai' ? 'OpenAI' : 'Claude'} API key in the Admin panel before generating.`);
      return;
    }

    setIsGenerating(true);
    setError('');
    setShowOutput(false);
    setShowBriefAnalysis(false);

    try {
      // Construct full prompt
      const fullPrompt = `${prompts.systemInstructions}

${prompts.brandGuidelines}

BRIEF: ${brief}

${prompts.territoryPrompt}

${prompts.headlinePrompt}

${prompts.compliancePrompt}

Please provide a structured response with territories, headlines, and compliance guidance.`;

      let result: GeneratedOutput;
      if (selectedAI === 'openai') {
        result = await generateWithOpenAI(fullPrompt, requiredKey);
      } else {
        result = await generateWithClaude(fullPrompt, requiredKey);
      }

      // Enhance the output with confidence scoring
      const enhancedResult = enhanceGeneratedOutput(result, brief);
      
      setGeneratedOutput(enhancedResult);
      setShowOutput(true);
    } catch (err) {
      setError(`Failed to generate content with ${selectedAI === 'openai' ? 'OpenAI' : 'Claude'}. Please check your API key and try again.`);
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMomentSelect = (moment: { name: string; date: string }) => {
    setBrief(`${moment.name} is approaching. Generate creative territories for Everyday Rewards to drive engagement and showcase value during this key shopping moment. Focus on positioning Everyday Rewards as the smart choice for everyday value, contrasting with limited-time sales events.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-bold relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-blue-500/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                  BREAD<span className="text-4xl">®</span>
                </h1>
                <p className="text-xl mt-2 font-normal text-gray-300">
                  A TECH ENABLED PLATFORM FOR EVERYDAY REWARDS
                </p>
              </div>
              <div className="text-right">
                <button
                  onClick={() => setShowAdmin(!showAdmin)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 px-6 py-3 rounded-xl font-bold transition-all duration-300 text-gray-300 hover:text-white mb-4"
                >
                  ⚙️ ADMIN
                </button>
                <div className="text-sm text-gray-400">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedAI === 'openai' 
                        ? (apiKeys.openai ? 'bg-green-400' : 'bg-red-400')
                        : (apiKeys.claude ? 'bg-green-400' : 'bg-red-400')
                    }`}></div>
                    {selectedAI === 'openai' ? 'OpenAI' : 'Claude'} {
                      (selectedAI === 'openai' ? apiKeys.openai : apiKeys.claude) ? 'Ready' : 'No API Key'
                    }
                  </div>
                  <div className="text-xs">
                    Smart Analysis • {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {showAdmin && (
        <AdminPanel
          prompts={prompts}
          apiKeys={apiKeys}
          apiKeysSaved={apiKeysSaved}
          onPromptUpdate={handlePromptUpdate}
          onApiKeyUpdate={handleApiKeyUpdate}
          onSaveApiKeys={saveApiKeys}
        />
      )}

      {/* Main Content */}
      <div className={`relative z-10 max-w-6xl mx-auto p-8 transition-all duration-500 ${showAdmin ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Brief Input Section */}
        <div className="mb-12">
          <BriefInput
            brief={brief}
            setBrief={setBrief}
            selectedAI={selectedAI}
            setSelectedAI={setSelectedAI}
            apiKeys={apiKeys}
            error={error}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onMomentSelect={handleMomentSelect}
          />

          {/* Smart Brief Analysis */}
          {showBriefAnalysis && (
            <div className="mt-6">
              <BriefEnhancement 
                analysis={briefAnalysis}
                isVisible={showBriefAnalysis}
              />
            </div>
          )}
        </div>

        {/* Output Section */}
        {showOutput && generatedOutput && (
          <TerritoryOutput
            generatedOutput={generatedOutput}
            onNewBrief={() => {
              setShowOutput(false);
              setBrief('');
              setGeneratedOutput(null);
              setShowBriefAnalysis(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BreadApp;