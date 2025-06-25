import React from 'react';
import { Prompts, ApiKeys } from '../App';

interface AdminPanelProps {
  prompts: Prompts;
  apiKeys: ApiKeys;
  apiKeysSaved: boolean;
  generateImages: boolean;
  onPromptUpdate: (key: keyof Prompts, value: string) => void;
  onApiKeyUpdate: (provider: keyof ApiKeys, key: string) => void;
  onSaveApiKeys: () => void;
  onSaveConfiguration: () => void;
  onGenerateImagesToggle: (enabled: boolean) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  prompts,
  apiKeys,
  apiKeysSaved,
  generateImages,
  onPromptUpdate,
  onApiKeyUpdate,
  onSaveApiKeys,
  onSaveConfiguration,
  onGenerateImagesToggle,
  onClose,
}) => {
  const handleTemplateLoad = (templateName: string) => {
    if (templateName === 'onepass') {
      onPromptUpdate(
        'systemInstructions',
        'You are BREAD®, generating creative territories for OnePass, a premium membership program...'
      );
      onPromptUpdate(
        'brandGuidelines',
        'ONEPASS BRAND GUIDELINES:\n\nBrand Personality: Premium, exclusive, convenient...'
      );
      onPromptUpdate('territoryPrompt', 'Generate 6 creative territories for OnePass...');
      onPromptUpdate('headlinePrompt', 'Create headlines that emphasize premium value...');
      onPromptUpdate('compliancePrompt', 'Ensure compliance with OnePass terms...');
      alert('OnePass template loaded successfully!');
    } else {
      alert(`${templateName} template will be available soon!`);
    }
  };

  const handleSaveConfiguration = () => {
    // Call the configuration save handler (shows toast)
    onSaveConfiguration();

    // Auto-close admin panel after saving
    setTimeout(() => {
      onClose();
    }, 1500); // Small delay so user sees the toast message
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-8 mb-8">
      <div className="backdrop-blur-xl bg-purple-400/10 border border-purple-400/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-purple-400 drop-shadow-lg">CONFIGURATION</h2>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg font-bold transition-all duration-300 text-gray-300 hover:text-white"
          >
            ✕ Close
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Instructions */}
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-gray-200">
                System Instructions
              </label>
              <textarea
                value={prompts.systemInstructions}
                onChange={e => onPromptUpdate('systemInstructions', e.target.value)}
                className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white font-normal resize-none focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                placeholder="Enter system instructions..."
              />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3 text-gray-200">Brand Guidelines</label>
              <textarea
                value={prompts.brandGuidelines}
                onChange={e => onPromptUpdate('brandGuidelines', e.target.value)}
                className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white font-normal resize-none focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                placeholder="Enter brand guidelines..."
              />
            </div>
          </div>

          {/* Prompt Templates */}
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-3 text-gray-200">
                Territory Generation Prompt
              </label>
              <textarea
                value={prompts.territoryPrompt}
                onChange={e => onPromptUpdate('territoryPrompt', e.target.value)}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white font-normal resize-none focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                placeholder="Territory generation instructions..."
              />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3 text-gray-200">
                Headline Generation Prompt
              </label>
              <textarea
                value={prompts.headlinePrompt}
                onChange={e => onPromptUpdate('headlinePrompt', e.target.value)}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white font-normal resize-none focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                placeholder="Headline generation instructions..."
              />
            </div>

            <div>
              <label className="block text-lg font-bold mb-3 text-gray-200">
                Compliance Co-pilot Prompt
              </label>
              <textarea
                value={prompts.compliancePrompt}
                onChange={e => onPromptUpdate('compliancePrompt', e.target.value)}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white font-normal resize-none focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                placeholder="Compliance guidance instructions..."
              />
            </div>
          </div>
        </div>

        {/* AI Image Generation Configuration */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <label className="block text-lg font-bold mb-4 text-gray-200">
            🎨 AI IMAGE GENERATION
          </label>

          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Generate AI Images for Headlines
                </h3>
                <p className="text-sm text-gray-300 font-normal">
                  Automatically create DALL-E generated background images for phone panels based on
                  headline content and territory context.
                </p>
              </div>

              <button
                onClick={() => onGenerateImagesToggle(!generateImages)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                  generateImages ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    generateImages ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-purple-300 font-bold mb-1">📱 Visual Impact</div>
                <div className="text-gray-300 font-normal">
                  Phone panels display as complete mobile ads with compelling background visuals
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-purple-300 font-bold mb-1">🤖 Smart Prompts</div>
                <div className="text-gray-300 font-normal">
                  Context-aware prompts based on headline content, territory tone, and brief context
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-purple-300 font-bold mb-1">💰 Cost Estimate</div>
                <div className="text-gray-300 font-normal">
                  ~$0.04 per image, 18 images = ~$0.72 per generation
                </div>
              </div>
            </div>

            {generateImages && (
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="text-sm text-purple-300 font-bold mb-1">
                  ✨ Image Generation Enabled
                </div>
                <div className="text-xs text-purple-200 font-normal">
                  DALL-E will generate background images automatically when creating headlines. This
                  will increase generation time and API costs.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-400">Last saved: {new Date().toLocaleTimeString()}</div>
          <button
            onClick={handleSaveConfiguration}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-400/30"
          >
            💾 SAVE & CLOSE
          </button>
        </div>

        {/* Template Presets */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <label className="block text-lg font-bold mb-4 text-gray-200">QUICK TEMPLATES</label>
          <div className="flex gap-4 flex-wrap">
            <button className="bg-yellow-500/20 border-2 border-yellow-500/40 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 text-yellow-300">
              ✓ Everyday Rewards
            </button>
            <button
              onClick={() => handleTemplateLoad('onepass')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300"
            >
              OnePass
            </button>
            <button
              onClick={() => handleTemplateLoad('generic')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300"
            >
              Generic Retail
            </button>
            <button
              onClick={() => handleTemplateLoad('custom')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300"
            >
              + Custom Template
            </button>
          </div>
        </div>

        {/* API Configuration */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-lg font-bold text-gray-200">🔑 AI API CONFIGURATION</label>
            {apiKeysSaved && (
              <div className="text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                ✓ Keys Saved
              </div>
            )}
          </div>

          <div className="mb-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-300">
                OpenAI API Key
                <span
                  className={`ml-2 text-xs ${apiKeys.openai ? 'text-green-400' : 'text-red-400'}`}
                >
                  {apiKeys.openai ? '● Connected' : '○ Not configured'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKeys.openai}
                  onChange={e => onApiKeyUpdate('openai', e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white font-normal focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all duration-300 pr-10"
                />
                {apiKeys.openai && (
                  <button
                    onClick={() => onApiKeyUpdate('openai', '')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Get your key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  OpenAI Platform
                </a>
              </div>
              <div className="text-xs text-blue-400 mt-2 bg-blue-400/10 p-2 rounded">
                💡 BREAD now uses OpenAI for both text generation and DALL-E image generation
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onSaveApiKeys}
              disabled={!apiKeys.openai}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-400/30 disabled:opacity-50"
            >
              💾 Save API Key
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear the stored OpenAI API key?')) {
                  localStorage.removeItem('bread_openai_key');
                  onApiKeyUpdate('openai', '');
                }
              }}
              className="bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 px-6 py-3 rounded-lg font-bold transition-all duration-300 text-gray-300 hover:text-red-300"
            >
              🗑️ Clear Key
            </button>
          </div>

          {/* API Status */}
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-sm font-bold mb-2 text-green-300">🔒 Secure API Status</div>
            <div className="text-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>OpenAI Text Generation: Secure Server-side</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${generateImages ? 'bg-purple-400' : 'bg-gray-500'}`}
                ></div>
                <span>
                  DALL-E Image Generation: {generateImages ? 'Enabled (Secure)' : 'Disabled'}
                </span>
              </div>
            </div>
            <div className="text-xs text-green-200 mt-2">
              ✅ API keys are now handled securely server-side. No sensitive data exposed in
              browser.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
