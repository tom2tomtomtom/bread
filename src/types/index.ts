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

// Enhanced version with confidence scoring
export interface EnhancedGeneratedOutput extends GeneratedOutput {
  overallConfidence: number;
  territories: EnhancedTerritory[];
  metadata: GenerationMetadata;
}

export interface EnhancedTerritory extends Territory {
  confidence: TerritoryConfidence;
}

export interface TerritoryConfidence {
  marketFit: number;
  complianceConfidence: number;
  audienceResonance: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface GenerationMetadata {
  generatedAt: Date;
  model: string;
  processingTime: number;
  tokensUsed?: number;
  cost?: number;
}

// Brief Analysis Types
export interface BriefAnalysis {
  score: number; // 0-100
  suggestions: string[];
  strengths: string[];
  warnings: string[];
  marketInsights: string[];
  wordCount?: number;
  completeness?: number;
  clarity?: number;
  strategicDepth?: number;
  missingElements?: string[];
  weaknesses?: string[];
  confidence?: number;
}

export interface RealTimeAnalysis {
  score: number;
  wordCount: number;
  completeness: number;
  suggestions: string[];
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

// ===== CAMPAIGN TEMPLATE SYSTEM TYPES =====

export type CampaignTemplateType = 'launch' | 'promotional' | 'brand_building' | 'retention_loyalty';

export type EvolutionType = 'amplify' | 'pivot' | 'refine' | 'localize' | 'modernize' | 'differentiate';

export interface StrategicFramework {
  primaryObjective: string;
  messagingHierarchy: string[];
  audienceStrategy: AudienceApproach;
  competitivePositioning: PositioningStrategy;
  emotionalTerritory: EmotionalApproach;
  keyPerformanceIndicators: string[];
  successMetrics: SuccessMetric[];
}

export interface AudienceApproach {
  primaryAudience: string;
  secondaryAudiences: string[];
  psychographicProfile: string;
  behavioralTriggers: string[];
  communicationStyle: 'direct' | 'emotional' | 'rational' | 'aspirational' | 'conversational';
  culturalConsiderations: string[];
}

export interface PositioningStrategy {
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  differentiationPoints: string[];
  competitiveAdvantages: string[];
  valueProposition: string;
  brandPersonality: string[];
}

export interface EmotionalApproach {
  primaryEmotion: 'excitement' | 'trust' | 'aspiration' | 'belonging' | 'urgency' | 'comfort';
  emotionalJourney: string[];
  tonalAttributes: string[];
  brandVoice: 'authoritative' | 'friendly' | 'innovative' | 'reliable' | 'premium' | 'accessible';
}

export interface SuccessMetric {
  name: string;
  target: number;
  unit: string;
  timeframe: string;
  priority: 'primary' | 'secondary' | 'tertiary';
}

export interface VisualGuidelines {
  colorPalette: ColorGuideline[];
  typography: TypographyGuideline[];
  imageryStyle: ImageryStyle;
  layoutPrinciples: LayoutPrinciple[];
  brandElements: BrandElement[];
  visualHierarchy: VisualHierarchy;
}

export interface ColorGuideline {
  name: string;
  hex: string;
  usage: 'primary' | 'secondary' | 'accent' | 'neutral';
  emotionalAssociation: string;
  applicationRules: string[];
}

export interface TypographyGuideline {
  name: string;
  fontFamily: string;
  usage: 'headline' | 'subheading' | 'body' | 'caption' | 'display';
  weight: string;
  size: string;
  lineHeight: string;
}

export interface ImageryStyle {
  photographyStyle: 'lifestyle' | 'product' | 'conceptual' | 'documentary' | 'artistic';
  colorTreatment: 'natural' | 'enhanced' | 'filtered' | 'monochrome' | 'high-contrast';
  composition: 'centered' | 'rule-of-thirds' | 'dynamic' | 'minimal' | 'layered';
  subjectMatter: string[];
  moodKeywords: string[];
}

export interface LayoutPrinciple {
  name: string;
  description: string;
  applicationRules: string[];
  examples: string[];
}

export interface BrandElement {
  type: 'logo' | 'icon' | 'pattern' | 'texture' | 'graphic';
  name: string;
  usage: string;
  placement: string[];
  sizing: string[];
}

export interface VisualHierarchy {
  primaryFocus: string;
  secondaryElements: string[];
  supportingElements: string[];
  informationFlow: string[];
}

export interface ContentStructure {
  messagingFramework: MessagingFramework;
  contentPillars: ContentPillar[];
  narrativeFlow: NarrativeFlow;
  callToAction: CallToActionStrategy;
  contentAdaptation: ContentAdaptation;
}

export interface MessagingFramework {
  primaryMessage: string;
  supportingMessages: string[];
  proofPoints: string[];
  messagingHierarchy: MessageHierarchy[];
  tonalGuidelines: string[];
}

export interface MessageHierarchy {
  level: 'primary' | 'secondary' | 'tertiary';
  message: string;
  weight: number;
  placement: string[];
}

export interface ContentPillar {
  name: string;
  description: string;
  keyMessages: string[];
  contentTypes: string[];
  channelRelevance: ChannelRelevance[];
}

export interface ChannelRelevance {
  channel: ChannelFormat;
  relevanceScore: number;
  adaptationNotes: string[];
}

export interface NarrativeFlow {
  openingHook: string;
  problemStatement: string;
  solutionPresentation: string;
  benefitReinforcement: string;
  actionDirection: string;
}

export interface CallToActionStrategy {
  primaryCTA: string;
  secondaryCTAs: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  placementStrategy: string[];
  visualTreatment: string;
}

export interface ContentAdaptation {
  channelSpecificRules: ChannelAdaptationRule[];
  lengthVariations: LengthVariation[];
  formatOptimizations: FormatOptimization[];
}

export interface ChannelAdaptationRule {
  channel: ChannelFormat;
  adaptationRules: string[];
  restrictions: string[];
  opportunities: string[];
}

export interface LengthVariation {
  format: 'short' | 'medium' | 'long' | 'extended';
  wordCount: number;
  keyElements: string[];
  usage: string[];
}

export interface FormatOptimization {
  format: ChannelFormat;
  optimizations: string[];
  bestPractices: string[];
  avoidances: string[];
}

export interface ChannelSpecifications {
  supportedChannels: ChannelFormat[];
  channelPriority: ChannelPriority[];
  crossChannelStrategy: CrossChannelStrategy;
  platformOptimizations: PlatformOptimization[];
  distributionStrategy: DistributionStrategy;
}

export interface ChannelPriority {
  channel: ChannelFormat;
  priority: 'primary' | 'secondary' | 'tertiary';
  reasoning: string;
  expectedImpact: number;
  resourceAllocation: number;
}

export interface CrossChannelStrategy {
  consistencyLevel: 'identical' | 'adapted' | 'customized';
  messagingAlignment: string[];
  visualConsistency: string[];
  timingCoordination: TimingCoordination;
}

export interface TimingCoordination {
  launchSequence: LaunchSequence[];
  frequencyRules: FrequencyRule[];
  seasonalConsiderations: string[];
}

export interface LaunchSequence {
  channel: ChannelFormat;
  timing: 'pre-launch' | 'launch' | 'post-launch' | 'ongoing';
  delay: number; // hours
  reasoning: string;
}

export interface FrequencyRule {
  channel: ChannelFormat;
  frequency: string;
  optimalTiming: string[];
  restrictions: string[];
}

export interface DistributionStrategy {
  organic: OrganicStrategy;
  paid: PaidStrategy;
  earned: EarnedStrategy;
  owned: OwnedStrategy;
}

export interface OrganicStrategy {
  channels: ChannelFormat[];
  contentTypes: string[];
  engagementTactics: string[];
  communityBuilding: string[];
}

export interface PaidStrategy {
  channels: ChannelFormat[];
  budgetAllocation: BudgetAllocation[];
  targetingStrategy: string[];
  bidStrategy: string;
}

export interface BudgetAllocation {
  channel: ChannelFormat;
  percentage: number;
  reasoning: string;
  expectedROI: number;
}

export interface EarnedStrategy {
  prTargets: string[];
  influencerStrategy: string[];
  communityEngagement: string[];
  viralPotential: string[];
}

export interface OwnedStrategy {
  channels: ChannelFormat[];
  contentStrategy: string[];
  audienceNurturing: string[];
  conversionOptimization: string[];
}

export interface PerformanceMetrics {
  kpis: KPIDefinition[];
  benchmarks: PerformanceBenchmark[];
  trackingSetup: TrackingSetup;
  reportingSchedule: ReportingSchedule;
  optimizationTriggers: OptimizationTrigger[];
}

export interface KPIDefinition {
  name: string;
  description: string;
  measurement: string;
  target: number;
  unit: string;
  timeframe: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  trackingMethod: string;
}

export interface PerformanceBenchmark {
  metric: string;
  industry: number;
  category: number;
  historical: number;
  aspirational: number;
  source: string;
}

export interface TrackingSetup {
  platforms: TrackingPlatform[];
  customEvents: CustomEvent[];
  attributionModel: string;
  reportingFrequency: string;
}

export interface TrackingPlatform {
  name: string;
  metrics: string[];
  integrationRequired: boolean;
  setupInstructions: string[];
}

export interface CustomEvent {
  name: string;
  description: string;
  trigger: string;
  parameters: EventParameter[];
}

export interface EventParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ReportingSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  stakeholders: string[];
  format: 'dashboard' | 'report' | 'presentation';
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
}

export interface OptimizationTrigger {
  condition: string;
  threshold: number;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  automationPossible: boolean;
}

// Main Campaign Template Interface
export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  type: CampaignTemplateType;
  strategicFramework: StrategicFramework;
  visualGuidelines: VisualGuidelines;
  contentStructure: ContentStructure;
  channelSpecs: ChannelSpecifications;
  performanceKPIs: PerformanceMetrics;
  templateConfiguration: TemplateConfiguration;
  brandAdaptation: BrandAdaptation;
  examples: TemplateExample[];
  metadata: TemplateMetadata;
}

export interface TemplateConfiguration {
  customizationLevel: 'low' | 'medium' | 'high' | 'full';
  requiredInputs: RequiredInput[];
  optionalInputs: OptionalInput[];
  brandingRequirements: BrandingRequirement[];
  technicalSpecs: TechnicalSpecification[];
}

export interface RequiredInput {
  field: string;
  type: 'text' | 'image' | 'video' | 'color' | 'selection' | 'number';
  description: string;
  validation: ValidationRule[];
  examples: string[];
}

export interface OptionalInput {
  field: string;
  type: 'text' | 'image' | 'video' | 'color' | 'selection' | 'number';
  description: string;
  defaultValue: string | number | boolean | null;
  impact: string;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'fileSize' | 'dimensions';
  value: string | number | RegExp | boolean;
  message: string;
}

export interface BrandingRequirement {
  element: 'logo' | 'colors' | 'fonts' | 'imagery' | 'voice' | 'messaging';
  importance: 'critical' | 'important' | 'recommended' | 'optional';
  guidelines: string[];
  flexibility: number; // 0-100
}

export interface TechnicalSpecification {
  aspect: 'dimensions' | 'fileSize' | 'format' | 'resolution' | 'duration' | 'quality';
  requirements: TechnicalRequirement[];
  recommendations: string[];
}

export interface TechnicalRequirement {
  channel: ChannelFormat;
  specification: string;
  value: any;
  tolerance: string;
}

export interface BrandAdaptation {
  adaptationPoints: AdaptationPoint[];
  brandConsistency: BrandConsistencyRule[];
  customizationOptions: CustomizationOption[];
  qualityChecks: QualityCheck[];
}

export interface AdaptationPoint {
  element: string;
  description: string;
  adaptationLevel: 'none' | 'minor' | 'moderate' | 'major';
  brandImpact: 'low' | 'medium' | 'high';
  guidelines: string[];
}

export interface BrandConsistencyRule {
  rule: string;
  enforcement: 'strict' | 'flexible' | 'guideline';
  exceptions: string[];
  validation: string;
}

export interface CustomizationOption {
  name: string;
  description: string;
  type: 'color' | 'typography' | 'layout' | 'imagery' | 'messaging';
  options: CustomizationChoice[];
  impact: string;
}

export interface CustomizationChoice {
  value: string | number | boolean;
  label: string;
  preview: string;
  brandAlignment: number; // 0-100
}

export interface QualityCheck {
  name: string;
  description: string;
  automated: boolean;
  criteria: QualityCriteria[];
  threshold: number;
}

export interface QualityCriteria {
  aspect: string;
  measurement: string;
  target: number;
  weight: number;
}

export interface TemplateExample {
  id: string;
  name: string;
  description: string;
  industry: string;
  brand: string;
  channels: ChannelFormat[];
  assets: ExampleAsset[];
  performance: ExamplePerformance;
  learnings: string[];
}

export interface ExampleAsset {
  type: 'image' | 'video' | 'copy' | 'layout';
  url: string;
  description: string;
  channel: ChannelFormat;
  metrics: AssetMetric[];
}

export interface AssetMetric {
  name: string;
  value: number;
  unit: string;
  benchmark: number;
}

export interface ExamplePerformance {
  overallScore: number;
  kpiResults: KPIResult[];
  insights: string[];
  recommendations: string[];
}

export interface KPIResult {
  kpi: string;
  target: number;
  actual: number;
  variance: number;
  status: 'exceeded' | 'met' | 'missed' | 'pending';
}

export interface TemplateMetadata {
  version: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  averageRating: number;
  tags: string[];
  category: string;
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedSetupTime: number; // minutes
  supportedLanguages: string[];
  marketRelevance: MarketRelevance[];
}

export interface MarketRelevance {
  market: string;
  relevanceScore: number;
  adaptationNotes: string[];
  localConsiderations: string[];
}

// Template Recommendation System
export interface TemplateRecommendation {
  templateId: string;
  confidenceScore: number;
  reasoning: string[];
  briefAlignment: BriefAlignmentScore;
  expectedPerformance: PerformanceProjection;
  customizationSuggestions: CustomizationSuggestion[];
  riskFactors: RiskFactor[];
}

export interface BriefAlignmentScore {
  overall: number;
  objective: number;
  audience: number;
  messaging: number;
  channels: number;
  timeline: number;
  budget: number;
}

export interface PerformanceProjection {
  expectedROI: number;
  confidenceInterval: [number, number];
  keyDrivers: string[];
  riskFactors: string[];
  benchmarkComparison: BenchmarkComparison[];
}

export interface BenchmarkComparison {
  metric: string;
  projected: number;
  industry: number;
  category: number;
  variance: number;
}

export interface CustomizationSuggestion {
  element: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface RiskFactor {
  factor: string;
  probability: number;
  impact: 'low' | 'medium' | 'high';
  mitigation: string[];
  monitoring: string[];
}

// Template Selection and State Management
export interface TemplateSelectionState {
  selectedTemplate: CampaignTemplate | null;
  customizations: TemplateCustomization[];
  validationResults: ValidationResult[];
  previewAssets: PreviewAsset[];
  isCustomizing: boolean;
  customizationProgress: number;
}

export interface TemplateCustomization {
  field: string;
  value: any;
  isValid: boolean;
  validationMessage?: string;
  brandAlignment: number;
}

export interface ValidationResult {
  field: string;
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface PreviewAsset {
  id: string;
  type: 'image' | 'video' | 'layout';
  url: string;
  channel: ChannelFormat;
  status: 'generating' | 'ready' | 'error';
  metadata: PreviewMetadata;
}

export interface PreviewMetadata {
  generatedAt: Date;
  templateId: string;
  customizations: TemplateCustomization[];
  qualityScore: number;
  brandCompliance: number;
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

// ===== MULTIMEDIA GENERATION INTERFACES =====

export type AIProvider = 'openai' | 'midjourney' | 'stable-diffusion' | 'runway' | 'stable-video';
export type ImageType = 'product' | 'lifestyle' | 'background' | 'hero' | 'icon' | 'pattern';
export type AnimationType = 'subtle_float' | 'gentle_rotation' | 'parallax' | 'zoom' | 'fade' | 'slide';
export type VideoFormat = 'mp4' | 'mov' | 'webm' | 'gif';
export type PlatformOptimization = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter';
export type GenerationStatus = 'queued' | 'processing' | 'complete' | 'error' | 'cancelled';
export type CulturalContext = 'australian' | 'global' | 'regional';

export interface TextToImageRequest {
  prompt: string;
  territory: Territory;
  brandGuidelines: BrandGuidelines;
  imageType: ImageType;
  styleConsistency: boolean;
  culturalContext: CulturalContext;
  provider?: AIProvider;
  dimensions?: {
    width: number;
    height: number;
  };
  quality?: 'standard' | 'hd' | 'ultra';
  style?: string;
  negativePrompt?: string;
  seed?: number;
}

export interface ImageToVideoRequest {
  sourceImageId: string;
  sourceImageUrl: string;
  animationType: AnimationType;
  duration: number; // in seconds
  outputFormat: VideoFormat;
  platformOptimization: PlatformOptimization;
  provider?: AIProvider;
  quality?: 'standard' | 'hd' | 'ultra';
  fps?: number;
  customPrompt?: string;
}

export interface GenerationQueue {
  id: string;
  type: 'image' | 'video';
  status: GenerationStatus;
  progress: number; // 0-100
  estimatedCompletion: Date;
  request: TextToImageRequest | ImageToVideoRequest;
  result?: GeneratedAsset;
  error?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  priority: 'low' | 'normal' | 'high';
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  metadata: GeneratedAssetMetadata;
  provider: AIProvider;
  generationTime: number; // in milliseconds
  cost?: number;
  quality: 'standard' | 'hd' | 'ultra';
  createdAt: Date;
}

export interface GeneratedAssetMetadata {
  originalPrompt: string;
  enhancedPrompt: string;
  territory?: Territory;
  brandGuidelines?: BrandGuidelines;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  format: string;
  duration?: number; // for videos
  fps?: number; // for videos
  seed?: number;
  model: string;
  parameters: Record<string, any>;
}

export interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxRetries: number;
  timeout: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  costPerGeneration: number;
  supportedFormats: string[];
  maxDimensions: {
    width: number;
    height: number;
  };
}

export interface MultimediaGenerationConfig {
  providers: ProviderConfig[];
  defaultProvider: AIProvider;
  fallbackProviders: AIProvider[];
  qualitySettings: {
    standard: Record<string, any>;
    hd: Record<string, any>;
    ultra: Record<string, any>;
  };
  batchProcessing: {
    maxConcurrent: number;
    batchSize: number;
    delayBetweenBatches: number;
  };
  storage: {
    bucket: string;
    path: string;
    enableCDN: boolean;
  };
}

export interface PromptEnhancement {
  originalPrompt: string;
  enhancedPrompt: string;
  territory: Territory;
  brandGuidelines: BrandGuidelines;
  styleKeywords: string[];
  qualityModifiers: string[];
  culturalAdaptations: string[];
  brandConsistencyElements: string[];
  reasoning: string;
}

export interface QualityAssessment {
  score: number; // 0-100
  brandCompliance: number; // 0-100
  technicalQuality: number; // 0-100
  creativityScore: number; // 0-100
  territoryAlignment: number; // 0-100
  issues: QualityIssue[];
  recommendations: string[];
  approved: boolean;
}

export interface QualityIssue {
  type: 'brand_violation' | 'technical_issue' | 'content_issue' | 'territory_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
}

export interface BatchGenerationRequest {
  requests: (TextToImageRequest | ImageToVideoRequest)[];
  priority: 'low' | 'normal' | 'high';
  callback?: string; // webhook URL
  metadata?: Record<string, any>;
}

export interface BatchGenerationResult {
  batchId: string;
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  results: GeneratedAsset[];
  errors: Array<{
    requestIndex: number;
    error: string;
  }>;
  startTime: Date;
  endTime?: Date;
  estimatedCompletion?: Date;
}

// Template performance and usage tracking types
export interface TemplatePerformanceData {
  templateId: string;
  totalUsage: number;
  successRate: number;
  averageRating: number;
  conversionRate: number;
  lastUsed: Date;
  performanceMetrics: {
    clickThroughRate: number;
    engagementRate: number;
    completionRate: number;
  };
}

export interface TemplateUsageRecord {
  id: string;
  templateId: string;
  userId: string;
  timestamp: Date;
  success: boolean;
  rating?: number;
  feedback?: string;
  generatedContent: {
    territories: number;
    headlines: number;
    assets: number;
  };
}

// App state interface for better organization
export interface AppState {
  brief: string;
  isGenerating: boolean;
  showOutput: boolean;
  showAdmin: boolean;
  generatedOutput: GeneratedOutput | null;
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
