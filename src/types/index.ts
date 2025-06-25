// Core application types and interfaces

export interface Headline {
  text: string;
  followUp: string;
  reasoning: string;
  confidence: number;
  imageUrl?: string; // AI-generated image URL
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

export interface StarredItems {
  territories: string[];
  headlines: { [territoryId: string]: number[] };
}

export type ToastType = 'success' | 'error' | 'info';

// App state interface for better organization
export interface AppState {
  brief: string;
  isGenerating: boolean;
  showOutput: boolean;
  showAdmin: boolean;
  generatedOutput: any | null; // Will be enhanced with proper typing
  error: string;
  apiKeys: ApiKeys;
  apiKeysSaved: boolean;
  showBriefAnalysis: boolean;
  showToast: boolean;
  toastMessage: string;
  toastType: ToastType;
  starredItems: StarredItems;
  generateImages: boolean;
  prompts: Prompts;
}
