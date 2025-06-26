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

// Asset Management Types
export type AssetType =
  | 'product'
  | 'lifestyle'
  | 'logo'
  | 'background'
  | 'texture'
  | 'icon'
  | 'other';
export type AssetFormat = 'image' | 'video' | 'audio' | 'document' | 'archive';
export type AssetStatus = 'uploading' | 'processing' | 'ready' | 'error';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'type' | 'usage';
export type SortOrder = 'asc' | 'desc';

export interface AssetMetadata {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for video/audio assets
  colorPalette?: string[];
  dominantColor?: string;
  fileHash: string;
  exifData?: Record<string, any>;
}

export interface ImageAnalysis {
  mood: string[];
  style: string[];
  colors: {
    primary: string;
    secondary: string[];
    palette: string[];
  };
  composition: {
    rule_of_thirds: boolean;
    symmetry: boolean;
    leading_lines: boolean;
  };
  objects: string[];
  faces: number;
  text_detected: boolean;
  quality_score: number;
  aesthetic_score: number;
  brand_safety: boolean;
}

export interface RightsInformation {
  license: 'royalty_free' | 'rights_managed' | 'creative_commons' | 'proprietary' | 'unknown';
  usage_rights: string[];
  attribution_required: boolean;
  commercial_use: boolean;
  modification_allowed: boolean;
  expiry_date?: string;
  source?: string;
  photographer?: string;
}

export interface UploadedAsset {
  id: string;
  filename: string;
  type: AssetType;
  format: AssetFormat;
  status: AssetStatus;
  url: string;
  thumbnailUrl?: string;
  metadata: AssetMetadata;
  aiAnalysis?: ImageAnalysis;
  usageRights: RightsInformation;
  tags: string[];
  description?: string;
  uploadedAt: Date;
  updatedAt: Date;
  uploadedBy?: string;
  usageCount: number;
  lastUsed?: Date;
  collections: string[];
  isPublic: boolean;
  isFavorite: boolean;
}

export interface UploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  estimatedTimeRemaining?: number;
}

export interface AssetFilters {
  search: string;
  type: AssetType | 'all';
  format: AssetFormat | 'all';
  tags: string[];
  collections: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  onlyFavorites: boolean;
  onlyPublic: boolean;
}

export interface AssetCollection {
  id: string;
  name: string;
  description?: string;
  assetIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  thumbnailAssetId?: string;
}

// Enhanced Brief Intelligence Types
export interface MissingElement {
  category: string;
  element: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestion: string;
  impact: string;
}

export interface Suggestion {
  type: 'STRATEGIC' | 'TACTICAL' | 'CREATIVE' | 'COMPLIANCE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
}

export interface StrategicGap {
  area: string;
  description: string;
  competitiveRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface CulturalInsight {
  context: string;
  relevance: number; // 0-100
  opportunity: string;
  considerations: string[];
}

export interface CompetitiveOpportunity {
  competitor: string;
  weakness: string;
  opportunity: string;
  approach: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CategoryScore {
  score: number; // 0-100
  reasoning: string;
  improvements: string[];
}

export interface EnhancedBriefAnalysis {
  overallScore: number;
  categoryScores: {
    strategicClarity: CategoryScore;
    audienceDefinition: CategoryScore;
    competitiveContext: CategoryScore;
    culturalRelevance: CategoryScore;
    executionClarity: CategoryScore;
    practicalConstraints: CategoryScore;
  };
  missingElements: MissingElement[];
  improvementSuggestions: Suggestion[];
  strategicGaps: StrategicGap[];
  culturalInsights: CulturalInsight[];
  competitiveOpportunities: CompetitiveOpportunity[];
  analysisTimestamp: Date;
  confidence: number; // 0-100
}

// Territory Evolution Types
export type EvolutionType =
  | 'TONE_SHIFT'
  | 'AUDIENCE_PIVOT'
  | 'COMPETITIVE_RESPONSE'
  | 'CULTURAL_ADAPTATION'
  | 'SEASONAL_OPTIMIZATION'
  | 'PERFORMANCE_ENHANCEMENT'
  | 'CREATIVE_EXPLORATION'
  | 'COMPLIANCE_ADJUSTMENT';

export interface TerritoryEvolution {
  id: string;
  originalTerritoryId: string;
  evolutionType: EvolutionType;
  evolutionPrompt: string;
  resultingTerritory: Territory;
  improvementScore: number; // 0-100
  evolutionReasoning: string;
  timestamp: Date;
  parentEvolutionId?: string;
  metadata: {
    briefContext: string;
    targetAudience?: string;
    competitiveContext?: string;
    culturalContext?: string;
  };
}

export interface EvolutionSuggestion {
  type: EvolutionType;
  title: string;
  description: string;
  expectedImpact: string;
  confidence: number; // 0-100
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  prompt: string;
}

export interface EvolutionHistory {
  territoryId: string;
  evolutions: TerritoryEvolution[];
  bestPerformingEvolution?: TerritoryEvolution;
  evolutionTree: EvolutionNode[];
}

export interface EvolutionNode {
  evolution: TerritoryEvolution;
  children: EvolutionNode[];
  performance: {
    score: number;
    reasoning: string;
    metrics: { [key: string]: number };
  };
}

// Layout Generation Types
export type ChannelFormat =
  | 'instagram_post' | 'instagram_story' | 'instagram_reel'
  | 'facebook_post' | 'facebook_story' | 'facebook_cover'
  | 'linkedin_post' | 'linkedin_banner'
  | 'tiktok_video' | 'youtube_thumbnail'
  | 'print_a4' | 'print_a3' | 'billboard_landscape' | 'billboard_portrait'
  | 'banner_leaderboard' | 'banner_rectangle' | 'banner_skyscraper'
  | 'email_header' | 'email_signature'
  | 'pos_display' | 'shelf_talker' | 'window_cling'
  | 'custom';

export interface ChannelSpecs {
  width: number;
  height: number;
  dpi: number;
  colorSpace: 'RGB' | 'CMYK';
  fileFormat: 'PNG' | 'JPG' | 'PDF' | 'SVG' | 'MP4';
  maxFileSize?: number;
  safeArea?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  guidelines?: string[];
}

export interface ColorPalette {
  primary: string;
  secondary: string[];
  accent: string[];
  neutral: string[];
  background: string;
  text: string;
}

export interface BrandGuidelines {
  colors: ColorPalette;
  fonts: {
    primary: string;
    secondary: string;
    fallbacks: string[];
  };
  logoUsage: {
    minSize: number;
    clearSpace: number;
    placement: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    variations: string[];
  };
  spacing: {
    grid: number;
    margins: number;
    padding: number;
  };
  imagery: {
    style: string[];
    filters: string[];
    overlayOpacity: number;
  };
  compliance: {
    requiredElements: string[];
    prohibitedElements: string[];
    legalText: string[];
  };
}

export interface ImagePlacement {
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    overlay?: string;
  };
  zIndex: number;
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TextPlacement {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  rotation: number;
  opacity: number;
  zIndex: number;
  effects: {
    shadow: boolean;
    shadowColor: string;
    shadowBlur: number;
    shadowOffset: { x: number; y: number };
    stroke: boolean;
    strokeColor: string;
    strokeWidth: number;
  };
}

export interface ComplianceScore {
  overall: number; // 0-100
  categories: {
    brandAlignment: number;
    colorCompliance: number;
    fontCompliance: number;
    logoUsage: number;
    spacing: number;
    legalRequirements: number;
  };
  violations: ComplianceViolation[];
  recommendations: string[];
}

export interface ComplianceViolation {
  type: 'error' | 'warning' | 'suggestion';
  category: string;
  description: string;
  element?: string;
  fix: string;
  impact: 'high' | 'medium' | 'low';
}

export interface LayoutVariation {
  id: string;
  templateId: string;
  name: string;
  description: string;
  imageComposition: ImagePlacement[];
  textPlacement: TextPlacement[];
  colorScheme: ColorPalette;
  channelOptimization: ChannelFormat[];
  brandCompliance: ComplianceScore;
  performancePrediction: number; // 0-100
  aiReasoning: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    territoryId: string;
    briefContext: string;
    targetAudience: string;
    generationPrompt: string;
  };
}

export interface LayoutGenerationRequest {
  territory: Territory;
  assets: UploadedAsset[];
  targetFormats: ChannelFormat[];
  brandGuidelines: BrandGuidelines;
  templatePreferences?: TemplatePreference[];
  customRequirements?: string;
  priorityAssets?: string[]; // Asset IDs that should be prominently featured
}

export interface TemplatePreference {
  style: 'minimal' | 'bold' | 'elegant' | 'playful' | 'corporate' | 'artistic';
  layout: 'hero' | 'grid' | 'collage' | 'split' | 'overlay' | 'magazine';
  textDominance: 'text-heavy' | 'balanced' | 'image-heavy';
  colorScheme: 'brand' | 'complementary' | 'monochromatic' | 'vibrant' | 'muted';
}

export interface VisualIntelligence {
  assetTerritoryMatch: AssetTerritoryMatch[];
  colorHarmony: ColorHarmonyAnalysis;
  styleConsistency: StyleConsistencyCheck;
  compositionSuggestions: CompositionSuggestion[];
  performancePrediction: LayoutPerformancePrediction;
}

export interface AssetTerritoryMatch {
  assetId: string;
  territoryId: string;
  matchScore: number; // 0-100
  reasoning: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export interface ColorHarmonyAnalysis {
  harmonyScore: number; // 0-100
  dominantColors: string[];
  suggestedPalette: ColorPalette;
  conflicts: ColorConflict[];
  improvements: ColorImprovement[];
}

export interface ColorConflict {
  type: 'contrast' | 'harmony' | 'brand' | 'accessibility';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedElements: string[];
  solution: string;
}

export interface ColorImprovement {
  type: 'enhancement' | 'accessibility' | 'brand_alignment' | 'mood';
  description: string;
  implementation: string;
  expectedImpact: string;
}

export interface StyleConsistencyCheck {
  consistencyScore: number; // 0-100
  styleElements: {
    typography: number;
    imagery: number;
    spacing: number;
    colors: number;
  };
  inconsistencies: StyleInconsistency[];
  recommendations: string[];
}

export interface StyleInconsistency {
  element: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  fix: string;
}

export interface CompositionSuggestion {
  type: 'layout' | 'hierarchy' | 'balance' | 'focus' | 'flow';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
  priority: 'high' | 'medium' | 'low';
}

export interface LayoutPerformancePrediction {
  overallScore: number; // 0-100
  categoryScores: {
    visualImpact: number;
    brandRecognition: number;
    messageClarity: number;
    audienceAppeal: number;
    channelOptimization: number;
  };
  strengths: string[];
  weaknesses: string[];
  optimizationSuggestions: string[];
  confidence: number;
}

export interface ExportConfiguration {
  format: ChannelFormat;
  quality: 'draft' | 'preview' | 'production';
  includeBleed: boolean;
  includeMarks: boolean;
  colorProfile: string;
  compression: number; // 0-100
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    copyright: string;
  };
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  style: TemplatePreference['style'];
  layout: TemplatePreference['layout'];
  supportedFormats: ChannelFormat[];
  placeholders: {
    images: ImagePlaceholder[];
    text: TextPlaceholder[];
  };
  brandCompliance: {
    logoRequired: boolean;
    colorRestrictions: string[];
    fontRestrictions: string[];
  };
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagePlaceholder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;
  priority: 'primary' | 'secondary' | 'accent';
  suggestedAssetTypes: AssetType[];
  cropGuidelines: string[];
}

export interface TextPlaceholder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  role: 'headline' | 'subheading' | 'body' | 'cta' | 'legal' | 'tagline';
  maxCharacters: number;
  fontSizeRange: { min: number; max: number };
  required: boolean;
}

export interface PerformancePrediction {
  overallScore: number; // 0-100
  categoryScores: {
    audienceResonance: number;
    brandAlignment: number;
    marketFit: number;
    creativePotential: number;
    executionFeasibility: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidence: number;
}

export interface AssetSearchResult {
  assets: UploadedAsset[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AssetUploadConfig {
  maxFileSize: number;
  allowedFormats: string[];
  maxFilesPerUpload: number;
  enableAIAnalysis: boolean;
  autoGenerateThumbnails: boolean;
  compressionQuality: number;
}

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
