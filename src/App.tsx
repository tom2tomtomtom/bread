import React, { useState, useEffect, useMemo } from 'react';
import { generateWithOpenAI } from './services/aiService';
import { analyzeBrief, enhanceGeneratedOutput, EnhancedGeneratedOutput, BriefAnalysis } from './services/enhancementService';
import { AdminPanel } from './components/AdminPanel';
import { BriefEnhancement } from './components/BriefEnhancement';
import { TerritoryOutput } from './components/TerritoryOutput';
import { BriefInput } from './components/BriefInput';
import { Toast } from './components/Toast';
import { ProgressBar } from './components/ProgressBar';

export interface Headline {
  text: string;
  followUp: string;
  reasoning: string;
  confidence: number;
  starred?: boolean;
}

export interface Territory {
  id: string;
  title: string;
  positioning: string;
  tone: string;
  headlines: Headline[];
  starred?: boolean;
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
}

const BreadApp: React.FC = () => {
  // AI is now fixed to OpenAI only
  const [brief, setBrief] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [generatedOutput, setGeneratedOutput] = useState<EnhancedGeneratedOutput | null>(null);
  const [error, setError] = useState<string>('');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: ''
  });
  const [apiKeysSaved, setApiKeysSaved] = useState<boolean>(false);
  const [showBriefAnalysis, setShowBriefAnalysis] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [starredItems, setStarredItems] = useState<{territories: string[], headlines: {[territoryId: string]: number[]}}>({
    territories: [],
    headlines: {}
  });

  const [prompts, setPrompts] = useState<Prompts>({
    systemInstructions: `# EXTREME COMEDY MODE: Unhinged Australian Creator

YOU ARE NOT A MARKETER. YOU ARE A COMEDY WRITER WHO SELLS STUFF BY ACCIDENT.

🚨 CRITICAL: Every headline MUST be a SETUP → PUNCHLINE structure that makes people spit out their coffee.

## MANDATORY COMEDY FORMULA:

### HEADLINE STRUCTURE (NON-NEGOTIABLE):
- **LINE 1 (SETUP)**: Normal situation that everyone relates to (3-6 words)
- **LINE 2 (PUNCHLINE)**: Unexpected, absurd, or brutally honest twist (3-8 words)

### EXAMPLES OF WHAT WE WANT:
✅ "I collect loyalty points. / Like some people collect childhood trauma."
✅ "Your shopping apps have trust issues. / Ours just has abandonment issues."
✅ "POV: Your rewards program / needs its own therapy session."
✅ "Discount hunting is exhausting. / Like dating but with more receipts."

### COMEDY STYLES TO CYCLE THROUGH:

**DRY/DEADPAN**: Treat ridiculous things as completely normal
- "I save money every day. / It's like a hobby but more depressing."

**ABSURD ESCALATION**: Take normal situations to insane extremes  
- "You have 47 loyalty apps. / They're forming their own support group."

**SELF-DEPRECATING**: Make fun of the brand/situation
- "We're not perfect. / But at least we're not your ex."

**BRUTALLY HONEST**: Say what everyone's thinking
- "Loyalty programs are usually trash. / Plot twist: So are we sometimes."

## 🔥 COMEDY REQUIREMENTS:

1. **SHOCK FACTOR**: Would this get screenshotted and sent to friends?
2. **RELATABILITY**: Does this make people go "OMG SO TRUE"?
3. **UNEXPECTED**: Does the punchline surprise even you?
4. **QUOTABLE**: Would people use this as their Instagram caption?

## BANNED WORDS/PHRASES:
❌ "Great value" 
❌ "Consistent benefits"
❌ "Smart shopping"
❌ "Join the family"
❌ Any corporate buzzwords

## REQUIRED ENERGY:
Think: Drunk friend giving life advice + Australian chaos + TikTok comedian + that person who roasts everyone in the group chat.

## ABSOLUTE RULES:
- Every headline = SETUP + PUNCHLINE (no exceptions)
- Make it SO funny that compliance gets nervous
- If it's safe enough for LinkedIn, it's not funny enough
- Would your most sarcastic friend approve? No? Try again.

REMEMBER: Comedy first, selling second. Make them laugh so hard they forget they're being advertised to.`,
    
    brandGuidelines: `EVERYDAY REWARDS CREATOR GUIDELINES:

Brand Vibe: That mate who always has your back vs corporate loyalty program energy
Creator Voice: Australian TikToker who gets it, not marketing department memo
Anti-Messages: 
- "POV: You're tired of discount hunting like it's a sport"
- "Tell me you're over flash sales without telling me"
- "This loyalty program actually makes sense"
- "Finally, rewards that don't require a PhD to understand"

Cultural Reality Check:
- We're competing with creators, not just other brands
- Aussies can smell corporate BS from space
- Every headline needs to survive the group chat test
- Sound like someone's bestie, not their bank`,

    territoryPrompt: `TERRITORY GENERATION PROMPT
When creating broad campaign territories or strategic creative directions:

TERRITORY FRAMEWORK

Cultural Moment: What's happening in culture that we can authentically tap into?
Audience Tension: What frustration, desire, or shared experience drives our audience?
Brand Truth: What can our brand uniquely own in this space?
Emotional Territory: What feeling do we want to own? (Relief, vindication, discovery, community, etc.)
Platform Playground: How does this territory play differently across TikTok/Instagram/YouTube?

TERRITORY TYPES TO EXPLORE

The Confession: "Things we all do but never admit"
The Exposé: "Calling out industry BS"
The Discovery: "You've been doing it wrong this whole time"
The Community: "For everyone who..."
The Celebration: "Finally, someone made this"
The Rebellion: "We're not like other [category]"

OUTPUT STRUCTURE FOR TERRITORIES
Territory Name: [Catchy 2-4 word phrase]
Core Insight: [One sentence audience truth]
Emotional Positioning: [What feeling we own]
Cultural Hook: [What trend/moment we're tapping]
Platform Strategy: [How it adapts across channels]
Proof Points: [3-5 ways to demonstrate this territory]

Generate exactly 6 creative territories exploring themes like:
- Everyday value vs event-driven savings
- Inclusive rewards for all Australians  
- Smart shopping without the pressure
- Consistent benefits vs unpredictable deals
- Community and belonging
- Australian cultural moments`,

    headlinePrompt: `🚨 EXTREME HEADLINE FORMULA 🚨

FORGET EVERYTHING. THIS IS THE ONLY STRUCTURE THAT MATTERS:

## MANDATORY FORMAT (DO NOT DEVIATE):

**text** field = SETUP (3-6 words that create relatable tension)
**followUp** field = PUNCHLINE (3-8 words that deliver the absurd twist)

## COMEDY TEMPLATES (COPY THESE VIBES):

**TEMPLATE 1 - CONFESSION STYLE:**
Setup: "I [normal relatable action]"
Punchline: "Like [ridiculous comparison]"
Example: "I hunt for discounts. / Like a serial killer hunts victims."

**TEMPLATE 2 - POV CHAOS:**
Setup: "POV: Your [thing]"  
Punchline: "[absurd situation]"
Example: "POV: Your loyalty app / needs therapy more than you do."

**TEMPLATE 3 - COUNTING ABSURDITY:**
Setup: "You have [number] [things]"
Punchline: "[ridiculous consequence]"
Example: "You have 12 shopping apps. / They're staging an intervention."

**TEMPLATE 4 - SIMPLE STATEMENT DESTRUCTION:**
Setup: "[Normal statement]"
Punchline: "[Brutal/absurd reality check]"
Example: "Loyalty programs are great. / Said no one ever, seriously."

**TEMPLATE 5 - RELATIONSHIP METAPHORS:**
Setup: "[Brand/shopping behavior]"
Punchline: "Like [dating/relationship chaos]"
Example: "Discount hunting is exhausting. / Like dating but with more receipts."

## 🎯 PUNCHLINE GENERATORS:

**For BRUTAL HONESTY:** "Plot twist: [uncomfortable truth]"
**For THERAPY JOKES:** "[Thing] needs therapy / [Thing] has abandonment issues"
**For SUPPORT GROUP:** "[Things] are forming a support group"
**For RELATIONSHIP:** "Like [dating scenario] but [shopping twist]"
**For INTERVENTION:** "[Things] are staging an intervention"
**For FAMILY DRAMA:** "[Thing] is the toxic family member"

## ⚡ GENERATION RULES:

1. **Setup MUST be universally relatable** (everyone has experienced this)
2. **Punchline MUST be completely unexpected** (make people double-take)
3. **Use Australian slang/energy** but keep it accessible  
4. **Make compliance sweat** (push boundaries but stay legal)
5. **Screenshot test**: Would people send this to friends?

## 🚫 INSTANT REJECTION CRITERIA:
- If it sounds like marketing copy = FAIL
- If your mum would approve = FAIL  
- If it could be on a corporate poster = FAIL
- If it doesn't make you uncomfortable = FAIL

## 🔥 SUCCESS CRITERIA:
- Makes people snort-laugh unexpectedly ✅
- Gets quoted in group chats ✅  
- Makes compliance nervous but legal ✅
- Sounds like drunk friend giving advice ✅

GENERATE 3 HEADLINES PER TERRITORY USING DIFFERENT COMEDY STYLES.
EVERY. SINGLE. ONE. MUST. FOLLOW. SETUP → PUNCHLINE. NO EXCEPTIONS.`,

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

  // Load API keys and prompts from localStorage on component mount
  useEffect(() => {
    const savedOpenAI = localStorage.getItem('bread_openai_key');
    const savedPrompts = localStorage.getItem('bread_prompts');
    
    setApiKeys({
      openai: savedOpenAI || ''
    });

    // FORCE USE NEW CREATOR GUIDELINES - ignore cached prompts temporarily
    console.log('🔥 Forcing new creator guidelines, ignoring localStorage cache');
    // if (savedPrompts) {
    //   try {
    //     const parsedPrompts = JSON.parse(savedPrompts);
    //     setPrompts(parsedPrompts);
    //   } catch (error) {
    //     console.log('Could not parse saved prompts, using defaults');
    //   }
    // }
  }, []);

  const handleApiKeyUpdate = (provider: keyof ApiKeys, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: key
    }));
  };

  const saveApiKeys = () => {
    localStorage.setItem('bread_openai_key', apiKeys.openai);
    
    // Show success toast
    setToastMessage('API Key saved successfully!');
    setToastType('success');
    setShowToast(true);
    
    setApiKeysSaved(true);
    setTimeout(() => setApiKeysSaved(false), 2000);
    
    // Auto-return to main view after toast shows
    setTimeout(() => setShowAdmin(false), 2000);
  };

  const saveConfiguration = () => {
    // Save prompts to localStorage (in production, this would save to database)
    localStorage.setItem('bread_prompts', JSON.stringify(prompts));
    
    // Show success toast
    setToastMessage('Prompt configuration saved successfully!');
    setToastType('success');
    setShowToast(true);
  };

  const handlePromptUpdate = (key: keyof Prompts, value: string) => {
    setPrompts(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Star management functions
  const toggleTerritoryStarred = (territoryId: string) => {
    setStarredItems(prev => ({
      ...prev,
      territories: prev.territories.includes(territoryId)
        ? prev.territories.filter(id => id !== territoryId)
        : [...prev.territories, territoryId]
    }));
    
    // Update generatedOutput with star status
    if (generatedOutput) {
      const updatedTerritories = generatedOutput.territories.map(territory => 
        territory.id === territoryId 
          ? { ...territory, starred: !territory.starred }
          : territory
      );
      setGeneratedOutput({
        ...generatedOutput,
        territories: updatedTerritories
      });
    }
  };

  const toggleHeadlineStarred = (territoryId: string, headlineIndex: number) => {
    setStarredItems(prev => {
      const territoryHeadlines = prev.headlines[territoryId] || [];
      const updatedHeadlines = territoryHeadlines.includes(headlineIndex)
        ? territoryHeadlines.filter(index => index !== headlineIndex)
        : [...territoryHeadlines, headlineIndex];
      
      return {
        ...prev,
        headlines: {
          ...prev.headlines,
          [territoryId]: updatedHeadlines
        }
      };
    });

    // Update generatedOutput with star status
    if (generatedOutput) {
      const updatedTerritories = generatedOutput.territories.map(territory => {
        if (territory.id === territoryId) {
          const updatedHeadlines = territory.headlines.map((headline, index) =>
            index === headlineIndex 
              ? { ...headline, starred: !headline.starred }
              : headline
          );
          return { ...territory, headlines: updatedHeadlines };
        }
        return territory;
      });
      setGeneratedOutput({
        ...generatedOutput,
        territories: updatedTerritories
      });
    }
  };

  const getStarredCount = () => {
    const starredTerritories = starredItems.territories.length;
    const starredHeadlines = Object.values(starredItems.headlines).reduce((sum, headlines) => sum + headlines.length, 0);
    return { territories: starredTerritories, headlines: starredHeadlines };
  };

  const handleGenerate = async (regenerateMode: boolean = false) => {
    if (!brief.trim()) {
      setError('Please enter a brief before generating.');
      return;
    }

    // Check if OpenAI API key is available
    if (!apiKeys.openai) {
      setError('Please configure your OpenAI API key in the Admin panel before generating.');
      return;
    }

    setIsGenerating(true);
    setError('');
    if (!regenerateMode) {
      setShowOutput(false);
    }
    setShowBriefAnalysis(false);

    try {
      let promptAddition = '';
      
      // If regenerating, add instruction to preserve starred items
      if (regenerateMode && generatedOutput) {
        const starredCount = getStarredCount();
        
        if (starredCount.territories > 0 || starredCount.headlines > 0) {
          promptAddition = `

REGENERATION MODE: 
- Keep the following starred territories exactly as they are: ${starredItems.territories.join(', ')}
- Generate new territories to replace any unstarred ones
- For starred territories, keep starred headlines exactly as they are
- Generate new headlines only for unstarred headline positions
- Maintain the same total number of territories (${generatedOutput.territories.length}) and headlines per territory (3)

STARRED CONTENT TO PRESERVE:
${generatedOutput.territories
  .filter(t => t.starred)
  .map(t => `Territory ${t.id}: "${t.title}" - ${t.positioning}`)
  .join('\n')}

${Object.entries(starredItems.headlines)
  .map(([territoryId, headlineIndices]) => 
    headlineIndices.length > 0 ? 
    `Territory ${territoryId} starred headlines: ${headlineIndices.map(i => 
      generatedOutput.territories.find(t => t.id === territoryId)?.headlines[i]?.text || ''
    ).join(', ')}` : ''
  )
  .filter(Boolean)
  .join('\n')}`;
        }
      }

      // Construct full prompt
      const fullPrompt = `${prompts.systemInstructions}

${prompts.brandGuidelines}

BRIEF: ${brief}

${prompts.territoryPrompt}

${prompts.headlinePrompt}

${prompts.compliancePrompt}${promptAddition}

FINAL CREATIVE DIRECTIVE:
Remember: Write like a creator, not a corporation. Every headline MUST follow HOOK + PUNCHLINE format:

HOOK (text field): Sets up the tension (3-6 words)
PUNCHLINE (followUp field): Delivers the payoff (3-8 words)

Examples of proper structure:
✅ "I hunt for discounts. / Like a serial killer hunts victims."
✅ "You have 12 shopping apps. / We have one brain cell."
✅ "POV: Your loyalty program / ghosted you for someone richer."

❌ Avoid single-line headlines without setup/payoff
❌ Avoid corporate taglines that don't create tension

Please provide a structured response with territories, headlines, and compliance guidance.`;

      // Generate with OpenAI
      const result = await generateWithOpenAI(fullPrompt, apiKeys.openai);

      // Enhance the output with confidence scoring
      let enhancedResult = enhanceGeneratedOutput(result, brief);
      
      // If regenerating, merge with existing starred content
      if (regenerateMode && generatedOutput) {
        enhancedResult = mergeWithStarredContent(enhancedResult, generatedOutput, starredItems);
      }
      
      setGeneratedOutput(enhancedResult);
      setShowOutput(true);
    } catch (err) {
      setError('Failed to generate content with OpenAI. Please check your API key and try again.');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to merge new content with starred items
  const mergeWithStarredContent = (newOutput: any, existingOutput: any, starred: any) => {
    const mergedTerritories = newOutput.territories.map((newTerritory: any, index: number) => {
      const existingTerritory = existingOutput.territories[index];
      
      // If territory is starred, keep the existing one
      if (existingTerritory && existingTerritory.starred) {
        return { ...existingTerritory, starred: true };
      }
      
      // For unstarred territories, merge headlines
      const territoryId = existingTerritory?.id || newTerritory.id;
      const starredHeadlineIndices = starred.headlines[territoryId] || [];
      
      const mergedHeadlines = newTerritory.headlines.map((newHeadline: any, hIndex: number) => {
        // If headline is starred, keep the existing one
        if (starredHeadlineIndices.includes(hIndex) && existingTerritory?.headlines[hIndex]) {
          return { ...existingTerritory.headlines[hIndex], starred: true };
        }
        return { ...newHeadline, starred: false };
      });
      
      return {
        ...newTerritory,
        id: territoryId,
        headlines: mergedHeadlines,
        starred: false
      };
    });
    
    return {
      ...newOutput,
      territories: mergedTerritories
    };
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
                <h1 className="text-6xl font-logo tracking-tight bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                  BREAD<span className="text-4xl">®</span>
                </h1>
                <p className="text-xl mt-2 font-body font-normal text-gray-300 normal-case">
                  A tech enabled platform for Everyday Rewards
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
                      apiKeys.openai ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    OpenAI {apiKeys.openai ? 'Ready' : 'No API Key'}
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
          onSaveConfiguration={saveConfiguration}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* Main Content */}
      <div className={`relative z-10 max-w-6xl mx-auto p-8 transition-all duration-500 ${showAdmin ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Brief Input Section */}
        <div className="mb-12">
          <BriefInput
            brief={brief}
            setBrief={setBrief}
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
              setStarredItems({ territories: [], headlines: {} });
            }}
            onRegenerateUnstarred={() => handleGenerate(true)}
            onToggleTerritoryStarred={toggleTerritoryStarred}
            onToggleHeadlineStarred={toggleHeadlineStarred}
            starredItems={starredItems}
          />
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar 
        isVisible={isGenerating}
        duration={30000} // 30 seconds estimated duration
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default BreadApp;