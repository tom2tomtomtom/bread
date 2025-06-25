import { useState, useCallback, useEffect } from 'react';
import { Prompts, ApiKeys, ToastType } from '../types';

// Default prompts configuration
const DEFAULT_PROMPTS: Prompts = {
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
- "Join millions of smart shoppers. / Start earning rewards on every purchase."
- Clear, benefit-focused messaging`,

  brandGuidelines: `# EVERYDAY REWARDS BRAND GUIDELINES

## BRAND PERSONALITY
- **Helpful & Reliable**: Always there when you need us
- **Smart & Savvy**: Makes shopping easier and more rewarding
- **Friendly & Approachable**: Like a trusted friend who knows the best deals
- **Australian**: Understands local shopping culture and values

## TONE OF VOICE
- Conversational and warm
- Confident but not pushy
- Helpful without being preachy
- Optimistic and positive
- Authentically Australian

## KEY MESSAGES
- Everyday Rewards makes every shop more rewarding
- Earn points on groceries, fuel, and more
- Exclusive member offers and discounts
- Simple, easy, and free to join
- Australia's most popular loyalty program`,

  territoryPrompt: `Generate 6 creative territories that position Everyday Rewards as the smart choice for Australian shoppers. Each territory should:

1. Have a clear strategic positioning vs competitors
2. Appeal to different shopper motivations
3. Be ownable by Everyday Rewards
4. Work across multiple touchpoints
5. Feel fresh and distinctive

Focus on territories that highlight:
- Everyday value vs waiting for sales
- Smart shopping habits
- Community and belonging
- Simplicity and ease
- Australian shopping culture`,

  headlinePrompt: `For each territory, create 3 headlines using the SETUP → PUNCHLINE format:

HEADLINE STRUCTURE:
- Setup: Relatable situation, problem, or observation
- Punchline: How Everyday Rewards solves it or makes it better

REQUIREMENTS:
- Mix the 3 personality types (Problem-Solver, Gag Writer, Sales Pro)
- Keep headlines conversational and Australian
- Ensure each headline feels different from the others
- Make the benefit clear and compelling
- Use natural, everyday language`,

  compliancePrompt: `Provide compliance guidance for each territory and headline:

COMPLIANCE REQUIREMENTS:
- All claims must be truthful and substantiated
- Avoid superlatives unless provable (biggest, best, etc.)
- Ensure offers are clearly explained
- Check for misleading or deceptive content
- Verify all statements can be backed up
- Flag any potential regulatory concerns

RISK ASSESSMENT:
- LOW: Standard marketing claims, no regulatory concerns
- MEDIUM: Claims requiring substantiation or clarification
- HIGH: Potential regulatory issues requiring legal review`
};

export const useConfiguration = () => {
  // Configuration state
  const [prompts, setPrompts] = useState<Prompts>(DEFAULT_PROMPTS);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ openai: '' });
  const [apiKeysSaved, setApiKeysSaved] = useState<boolean>(false);
  const [generateImages, setGenerateImages] = useState<boolean>(false);
  
  // UI state
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<ToastType>('success');

  // Load configuration from localStorage on mount
  useEffect(() => {
    try {
      // Load prompts
      const savedPrompts = localStorage.getItem('bread_prompts');
      if (savedPrompts) {
        setPrompts(JSON.parse(savedPrompts));
      }

      // Load API keys (though they're now server-side, keeping for backward compatibility)
      const savedApiKeys = localStorage.getItem('bread_openai_key');
      if (savedApiKeys) {
        setApiKeys({ openai: savedApiKeys });
        setApiKeysSaved(true);
      }

      // Load image generation preference
      const savedGenerateImages = localStorage.getItem('bread_generate_images');
      if (savedGenerateImages) {
        setGenerateImages(savedGenerateImages === 'true');
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }, []);

  const updatePrompt = useCallback((key: keyof Prompts, value: string) => {
    setPrompts(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateApiKey = useCallback((provider: keyof ApiKeys, key: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  }, []);

  const saveApiKeys = useCallback(() => {
    localStorage.setItem('bread_openai_key', apiKeys.openai);
    setApiKeysSaved(true);
    showToastMessage('API Key saved successfully!', 'success');
  }, [apiKeys.openai, showToastMessage]);

  const saveConfiguration = useCallback(() => {
    try {
      localStorage.setItem('bread_prompts', JSON.stringify(prompts));
      showToastMessage('Configuration saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      showToastMessage('Failed to save configuration', 'error');
    }
  }, [prompts, showToastMessage]);

  const toggleGenerateImages = useCallback((enabled: boolean) => {
    setGenerateImages(enabled);
    localStorage.setItem('bread_generate_images', enabled.toString());
  }, []);

  const showToastMessage = useCallback((message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const toggleAdmin = useCallback(() => {
    setShowAdmin(prev => !prev);
  }, []);

  return {
    // Configuration state
    prompts,
    apiKeys,
    apiKeysSaved,
    generateImages,
    
    // UI state
    showAdmin,
    showToast,
    toastMessage,
    toastType,
    
    // Actions
    updatePrompt,
    updateApiKey,
    saveApiKeys,
    saveConfiguration,
    toggleGenerateImages,
    showToastMessage,
    hideToast,
    toggleAdmin
  };
};
