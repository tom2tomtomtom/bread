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
  imageUrl?: string;  // New field for AI-generated background image
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
    systemInstructions: `# VARIETY PACK: Problem-Solvers, Gag Writers & Sales Pros

YOU ARE 3 DIFFERENT WRITERS IN ONE BRAIN: A problem-solver, a gag writer, and a sales pro. Mix up your headlines to avoid formula fatigue.

🚨 CRITICAL: Every headline MUST be SETUP → PUNCHLINE, but vary the approach.

## THE 3 HEADLINE PERSONALITIES:

### 📝 THE PROBLEM-SOLVER (33% of headlines):
**Finds real shopping pain points and positions Everyday Rewards as the fix**
- Relatable struggles → obvious solution
- "Loyalty apps drain your battery. / Everyday Rewards charges your savings."
- Always positive about Everyday Rewards

### 🤪 THE GAG WRITER (33% of headlines):  
**Pure comedy, absurd observations, random truths**
- Weird but memorable setups → unexpected punchlines
- "I organize my apps by trust issues. / Everyday Rewards is in the 'ride or die' folder."
- Can be off-brand as long as it's memorable

### 💰 THE SALES PRO (33% of headlines):
**Direct value propositions and clear benefits**
- Straight-up selling → compelling reasons to join
- "Every dollar earns points. / Every point becomes savings."
- No comedy needed, just convincing copy

## VARIETY RULES:

**MIX IT UP:**
✅ Don't make all 3 headlines the same type
✅ Vary the energy levels (unhinged → charming → direct)
✅ Some should make people laugh, others make them think
✅ Balance entertainment with information

**AVOID FORMULA FATIGUE:**
❌ Don't always lead with problems
❌ Don't make every headline a comparison
❌ Don't be afraid of straight sales messages
❌ Don't force comedy into sales headlines

## POSITIVE BRAND OUTCOME:

**Everyday Rewards should always feel:**
- Reliable and trustworthy
- More appealing than alternatives  
- Worth joining or staying with
- Like the smart choice

**But achieve this through:**
- Some problem-solving
- Some entertainment value
- Some direct selling

REMEMBER: Keep people interested with variety. Problem → solution, random gags, and straight sales all serve different purposes.`,
    
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

    territoryPrompt: `🎯 BRIEF-RESPONSIVE TERRITORY GENERATION

*** CRITICAL: ALL TERRITORIES MUST DIRECTLY ADDRESS THE CAMPAIGN BRIEF ***

TERRITORY FRAMEWORK (Applied to the Brief Context):

Cultural Moment: What's happening in the brief's specific context? (Christmas, Black Friday, etc.)
Audience Tension: What specific frustration does the brief identify?
Brand Truth: How does Everyday Rewards solve the brief's specific challenge?
Emotional Territory: What feeling addresses the brief's objective?
Brief Relevance: How does this territory directly fulfill the brief's goals?

TERRITORY TYPES (Adapted to Brief Context):

The Brief-Specific Problem: Address the exact challenge mentioned in the brief
The Timing Solution: Leverage the specific seasonal/cultural moment from the brief
The Competitive Response: Counter the specific competitors or alternatives mentioned
The Context-Aware Community: Unite people around the brief's specific scenario
The Seasonal Celebration: Embrace the specific moment/holiday from the brief
The Brief-Focused Rebellion: Position against exactly what the brief identifies as the problem

🚨 BRIEF ALIGNMENT CHECKLIST:
For each territory, ask:
- Does this directly address the brief's context?
- Would this work for the specific timing mentioned?
- Does this counter the exact competitors/alternatives in the brief?
- Is this relevant to the audience situation described?
- Does this fulfill the campaign objectives stated?

BANNED: Generic territories that could work for any brief
REQUIRED: Territories that could ONLY work for this specific brief

Generate exactly 6 creative territories that are laser-focused on the brief's specific context, timing, and objectives.`,

    headlinePrompt: `🎭 MIXED HEADLINE FORMULA: Problem/Solution + Gags + Sales 🎭

## MANDATORY 3-HEADLINE MIX PER TERRITORY:

### 📝 HEADLINE A: PROBLEM → SOLUTION (33%)
**Setup**: Universal shopping/loyalty pain point
**Punchline**: Everyday Rewards as the obvious fix
- "Loyalty apps drain your battery. / Everyday Rewards charges your savings."
- "Points disappear into thin air. / Ours stay put like your mum."

### 🤪 HEADLINE B: PURE GAG (33%)
**Setup**: Absurd observation or random truth  
**Punchline**: Unexpected twist (not always about ER)
- "I organize my apps by trust issues. / Everyday Rewards is in the 'ride or die' folder."
- "My shopping list has commitment issues. / But my rewards don't."

### 💰 HEADLINE C: STRAIGHT SALES (33%)
**Setup**: Direct value proposition or benefit
**Punchline**: Clear reason to join/stay
- "Every dollar earns points. / Every point becomes savings."
- "Australia's biggest loyalty program. / Because size matters (in rewards)."

## STYLE VARIETY EXAMPLES:

### PROBLEM → SOLUTION:
- "Flash sales stress me out. / Everyday savings chill me out."
- "Hunting for deals is exhausting. / We deliver them to you."
- "Loyalty programs usually suck. / Plot twist: this one doesn't."

### PURE GAGS:
- "My wallet has trust issues. / Can't blame it really."
- "I speak fluent discount. / Also regular price with benefits."
- "Relationship status: It's complicated. / With every shop except Woolworths."

### STRAIGHT SALES:
- "More points, more savings. / More savings, more shopping."
- "Join 13 million smart Aussies. / They can't all be wrong."
- "Everyday shopping, everyday rewards. / It's literally in the name."

## GENERATION RULES:

1. **Mix all 3 types** in every territory (don't cluster)
2. **Keep setup-punchline structure** for all types
3. **Gags can be weird** but stay brand-safe
4. **Sales lines can be direct** but keep them punchy
5. **Problem-solution stays relatable** and positive

## SUCCESS TEST:
- **Problem-Solution**: "That's my exact problem + ER fixes it" ✅
- **Gags**: "LOL that's so random/true" + remember the brand ✅  
- **Sales**: "Clear benefit + I should definitely join" ✅

VARY THE ENERGY: Some unhinged, some charming, some straight-up convincing.
DON'T MAKE EVERY HEADLINE THE SAME FORMULA.`,

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
    
    setApiKeys({
      openai: savedOpenAI || ''
    });

    // FORCE USE NEW CREATOR GUIDELINES - ignore cached prompts temporarily
    console.log('🔥 Forcing new creator guidelines, ignoring localStorage cache');
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

🚨 CRITICAL BRIEF FOCUS 🚨
CAMPAIGN BRIEF: ${brief}

*** YOU MUST GENERATE TERRITORIES AND HEADLINES THAT DIRECTLY RESPOND TO THIS SPECIFIC BRIEF ***
*** DO NOT IGNORE THE BRIEF AND CREATE GENERIC CONTENT ***
*** EVERY TERRITORY MUST BE RELEVANT TO THE BRIEF'S CONTEXT, TIMING, AND OBJECTIVES ***

${prompts.territoryPrompt}

${prompts.headlinePrompt}

${prompts.compliancePrompt}${promptAddition}

🎯 BRIEF ALIGNMENT REQUIREMENTS:
- Read the brief above carefully
- Identify the specific context (Christmas, Black Friday, seasonal moment, etc.)
- Create territories that specifically address the brief's objectives
- Make headlines relevant to the brief's timing and competitive context
- If brief mentions Christmas → Christmas-relevant territories
- If brief mentions Black Friday → Black Friday positioning
- If brief mentions specific competitor → address that competitor

FINAL CREATIVE DIRECTIVE:
Every headline MUST follow HOOK + PUNCHLINE format AND be relevant to the brief:

HOOK (text field): Sets up tension related to the brief context (3-6 words)
PUNCHLINE (followUp field): Delivers Everyday Rewards solution for that context (3-8 words)

✅ Brief-relevant examples:
If Christmas brief: "Christmas shopping overwhelms me. / Everyday Rewards simplifies everything."
If Black Friday brief: "Black Friday crowds stress me. / Everyday rewards skip the chaos."

❌ BANNED: Generic territories that ignore the brief
❌ BANNED: Headlines that could work for any campaign

Please provide a structured response with territories, headlines, and compliance guidance that DIRECTLY ADDRESSES THE BRIEF.`;

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
                  AIdeas
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