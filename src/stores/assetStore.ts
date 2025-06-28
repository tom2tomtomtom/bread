import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UploadedAsset,
  UploadProgress,
  AssetFilters,
  AssetCollection,
  AssetSearchResult,
  AssetUploadConfig,
  AssetType,
  ViewMode,
  SortBy,
  SortOrder,
  LayoutVariation,
  LayoutTemplate,
  ExportConfiguration,
  VisualIntelligence,
  BrandGuidelines,
  Territory,
  LayoutGenerationRequest,
  // Multimedia generation types
  TextToImageRequest,
  ImageToVideoRequest,
  GenerationQueue,
  GeneratedAsset,
  PromptEnhancement,
  QualityAssessment,
  BatchGenerationRequest,
  BatchGenerationResult,
  ImageType,
  CulturalContext,
} from '../types';
import { APP_CONFIG } from '../config/app';
import { assetService } from '../services/assetService';
import { layoutGenerationService } from '../services/layoutGenerationService';
import { visualIntelligenceService } from '../services/visualIntelligenceService';
import { multimediaGenerationService } from '../services/multimediaGenerationService';

interface AssetState {
  // Asset data
  assets: UploadedAsset[];
  collections: AssetCollection[];

  // Upload state
  uploadProgress: UploadProgress[];
  isUploading: boolean;

  // UI state
  selectedAssets: string[];
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  filters: AssetFilters;
  searchResults: AssetSearchResult | null;

  // Configuration
  uploadConfig: AssetUploadConfig;

  // Loading states
  isLoading: boolean;
  isSearching: boolean;

  // Layout Generation State
  layouts: LayoutVariation[];
  templates: LayoutTemplate[];
  currentLayout: LayoutVariation | null;
  visualIntelligence: VisualIntelligence | null;
  isGeneratingLayouts: boolean;
  isAnalyzingVisuals: boolean;
  layoutGenerationError: string | null;

  // Multimedia Generation State
  generationQueue: GenerationQueue[];
  generatedAssets: GeneratedAsset[];
  currentGeneration: GenerationQueue | null;
  isGeneratingImage: boolean;
  isGeneratingVideo: boolean;
  generationProgress: number;
  generationError: string | null;
  promptEnhancements: PromptEnhancement[];
  qualityAssessments: QualityAssessment[];
  batchGenerations: BatchGenerationResult[];

  // Actions - Asset Management
  uploadAssets: (files: File[]) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  deleteAssets: (ids: string[]) => Promise<void>;
  updateAsset: (id: string, updates: Partial<UploadedAsset>) => Promise<void>;
  updateAssetTags: (id: string, tags: string[]) => Promise<void>;
  toggleAssetFavorite: (id: string) => Promise<void>;

  // Actions - Search & Filtering
  searchAssets: (query: string) => Promise<void>;
  setFilters: (filters: Partial<AssetFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => UploadedAsset[];

  // Actions - Selection
  selectAsset: (id: string) => void;
  selectAssets: (ids: string[]) => void;
  deselectAsset: (id: string) => void;
  clearSelection: () => void;
  toggleAssetSelection: (id: string) => void;
  selectAll: () => void;

  // Actions - Collections
  createCollection: (name: string, description?: string) => Promise<AssetCollection>;
  updateCollection: (id: string, updates: Partial<AssetCollection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addAssetsToCollection: (collectionId: string, assetIds: string[]) => Promise<void>;
  removeAssetsFromCollection: (collectionId: string, assetIds: string[]) => Promise<void>;

  // Actions - UI
  setViewMode: (mode: ViewMode) => void;
  setSorting: (sortBy: SortBy, sortOrder: SortOrder) => void;

  // Actions - Configuration
  updateUploadConfig: (config: Partial<AssetUploadConfig>) => void;

  // Actions - Layout Generation
  generateLayouts: (request: LayoutGenerationRequest) => Promise<LayoutVariation[]>;
  analyzeVisualIntelligence: (
    assets: UploadedAsset[],
    territory: Territory
  ) => Promise<VisualIntelligence>;
  selectLayout: (layout: LayoutVariation) => void;
  updateLayout: (layoutId: string, updates: Partial<LayoutVariation>) => void;
  deleteLayout: (layoutId: string) => void;
  duplicateLayout: (layoutId: string) => LayoutVariation;
  exportLayout: (layoutId: string, config: ExportConfiguration) => Promise<string>;
  clearLayouts: () => void;
  clearLayoutError: () => void;

  // Actions - Multimedia Generation
  generateImage: (request: TextToImageRequest) => Promise<string>; // Returns queue ID
  generateVideo: (request: ImageToVideoRequest) => Promise<string>; // Returns queue ID
  enhancePrompt: (
    prompt: string,
    territory: Territory,
    brandGuidelines: BrandGuidelines,
    imageType: ImageType,
    culturalContext: CulturalContext
  ) => Promise<PromptEnhancement>;
  assessQuality: (
    assetId: string,
    territory: Territory,
    brandGuidelines: BrandGuidelines
  ) => Promise<QualityAssessment>;
  batchGenerate: (request: BatchGenerationRequest) => Promise<string>; // Returns batch ID
  getGenerationStatus: (queueId: string) => GenerationQueue | undefined;
  cancelGeneration: (queueId: string) => Promise<void>;
  retryGeneration: (queueId: string) => Promise<void>;
  clearGenerationQueue: () => void;
  clearGenerationError: () => void;
  startGenerationPolling: () => void;

  // Utility actions
  getAssetById: (id: string) => UploadedAsset | undefined;
  getAssetsByType: (type: AssetType) => UploadedAsset[];
  getAssetsByCollection: (collectionId: string) => UploadedAsset[];
  getRecentAssets: (limit?: number) => UploadedAsset[];
  getFavoriteAssets: () => UploadedAsset[];
  getAssetUsageStats: () => {
    totalAssets: number;
    totalSize: number;
    byType: Record<AssetType, number>;
  };
}

// Default configuration
const DEFAULT_UPLOAD_CONFIG: AssetUploadConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFormats: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'audio/mp3',
    'audio/wav',
    'application/pdf',
  ],
  maxFilesPerUpload: 10,
  enableAIAnalysis: true,
  autoGenerateThumbnails: true,
  compressionQuality: 0.8,
};

// Default filters
const DEFAULT_FILTERS: AssetFilters = {
  search: '',
  type: 'all',
  format: 'all',
  tags: [],
  collections: [],
  onlyFavorites: false,
  onlyPublic: false,
};

export const useAssetStore = create<AssetState>()(
  persist(
    (set, get) => ({
      // Initial state
      assets: [],
      collections: [],
      uploadProgress: [],
      isUploading: false,
      selectedAssets: [],
      viewMode: 'grid',
      sortBy: 'date',
      sortOrder: 'desc',
      filters: DEFAULT_FILTERS,
      searchResults: null,
      uploadConfig: DEFAULT_UPLOAD_CONFIG,
      isLoading: false,
      isSearching: false,

      // Layout Generation State
      layouts: [],
      templates: [],
      currentLayout: null,
      visualIntelligence: null,
      isGeneratingLayouts: false,
      isAnalyzingVisuals: false,
      layoutGenerationError: null,

      // Multimedia Generation State
      generationQueue: [],
      generatedAssets: [],
      currentGeneration: null,
      isGeneratingImage: false,
      isGeneratingVideo: false,
      generationProgress: 0,
      generationError: null,
      promptEnhancements: [],
      qualityAssessments: [],
      batchGenerations: [],

      // Asset Management Actions
      uploadAssets: async (files: File[]) => {
        const { uploadConfig } = get();

        // Validate files
        const validFiles = files.filter(file => {
          if (file.size > uploadConfig.maxFileSize) {
            console.warn(`File ${file.name} exceeds maximum size`);
            return false;
          }
          if (!uploadConfig.allowedFormats.includes(file.type)) {
            console.warn(`File ${file.name} has unsupported format`);
            return false;
          }
          return true;
        });

        if (validFiles.length === 0) {
          throw new Error('No valid files to upload');
        }

        if (validFiles.length > uploadConfig.maxFilesPerUpload) {
          throw new Error(
            `Cannot upload more than ${uploadConfig.maxFilesPerUpload} files at once`
          );
        }

        set({ isUploading: true });

        // Initialize upload progress
        const progressItems: UploadProgress[] = validFiles.map(file => ({
          id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          filename: file.name,
          progress: 0,
          status: 'uploading',
        }));

        set(state => ({
          uploadProgress: [...state.uploadProgress, ...progressItems],
        }));

        try {
          // Process each file using the asset service
          const uploadedAssets: UploadedAsset[] = [];

          for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            const progressItem = progressItems[i];

            try {
              // Process the asset upload
              const asset = await assetService.processAssetUpload(file, progress => {
                // Update progress for this specific file
                set(state => ({
                  uploadProgress: state.uploadProgress.map(item =>
                    item.id === progressItem.id
                      ? { ...item, progress, status: 'uploading' as const }
                      : item
                  ),
                }));
              });

              uploadedAssets.push(asset);
              // Mark this file as complete
              set(state => ({
                uploadProgress: state.uploadProgress.map(item =>
                  item.id === progressItem.id
                    ? { ...item, progress: 100, status: 'complete' as const }
                    : item
                ),
              }));
            } catch (fileError) {
              // Mark this file as error
              set(state => ({
                uploadProgress: state.uploadProgress.map(item =>
                  item.id === progressItem.id
                    ? { ...item, status: 'error' as const, error: (fileError as Error).message }
                    : item
                ),
              }));
            }
          }

          // Add successfully uploaded assets to the store
          if (uploadedAssets.length > 0) {
            set(state => ({
              assets: [...state.assets, ...uploadedAssets],
            }));
          }

          // Clear completed uploads after a delay
          setTimeout(() => {
            set(state => ({
              uploadProgress: state.uploadProgress.filter(
                item => !progressItems.find(p => p.id === item.id)
              ),
            }));
          }, 3000);
        } catch (error) {
          // Update progress to error
          set(state => ({
            uploadProgress: state.uploadProgress.map(item =>
              progressItems.find(p => p.id === item.id)
                ? { ...item, status: 'error' as const, error: (error as Error).message }
                : item
            ),
          }));
          throw error;
        } finally {
          set({ isUploading: false });
        }
      },

      deleteAsset: async (id: string) => {
        set(state => ({
          assets: state.assets.filter(asset => asset.id !== id),
          selectedAssets: state.selectedAssets.filter(assetId => assetId !== id),
        }));
      },

      deleteAssets: async (ids: string[]) => {
        set(state => ({
          assets: state.assets.filter(asset => !ids.includes(asset.id)),
          selectedAssets: state.selectedAssets.filter(assetId => !ids.includes(assetId)),
        }));
      },

      updateAsset: async (id: string, updates: Partial<UploadedAsset>) => {
        set(state => ({
          assets: state.assets.map(asset =>
            asset.id === id ? { ...asset, ...updates, updatedAt: new Date() } : asset
          ),
        }));
      },

      updateAssetTags: async (id: string, tags: string[]) => {
        await get().updateAsset(id, { tags });
      },

      toggleAssetFavorite: async (id: string) => {
        const asset = get().getAssetById(id);
        if (asset) {
          await get().updateAsset(id, { isFavorite: !asset.isFavorite });
        }
      },

      // Search & Filtering Actions
      searchAssets: async (query: string) => {
        set({ isSearching: true });

        try {
          const { assets } = get();
          const filteredAssets = assets.filter(
            asset =>
              asset.filename.toLowerCase().includes(query.toLowerCase()) ||
              asset.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
              (asset.description && asset.description.toLowerCase().includes(query.toLowerCase()))
          );

          set({
            searchResults: {
              assets: filteredAssets,
              total: filteredAssets.length,
              page: 1,
              pageSize: 50,
              hasMore: false,
            },
            filters: { ...get().filters, search: query },
          });
        } finally {
          set({ isSearching: false });
        }
      },

      setFilters: (newFilters: Partial<AssetFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearFilters: () => {
        set({ filters: DEFAULT_FILTERS, searchResults: null });
      },

      applyFilters: () => {
        const { assets, filters } = get();

        return assets.filter(asset => {
          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
              asset.filename.toLowerCase().includes(searchLower) ||
              asset.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
              (asset.description && asset.description.toLowerCase().includes(searchLower));

            if (!matchesSearch) return false;
          }

          // Type filter
          if (filters.type !== 'all' && asset.type !== filters.type) {
            return false;
          }

          // Format filter
          if (filters.format !== 'all' && asset.format !== filters.format) {
            return false;
          }

          // Tags filter
          if (filters.tags.length > 0) {
            const hasMatchingTag = filters.tags.some(tag => asset.tags.includes(tag));
            if (!hasMatchingTag) return false;
          }

          // Collections filter
          if (filters.collections.length > 0) {
            const hasMatchingCollection = filters.collections.some(collectionId =>
              asset.collections.includes(collectionId)
            );
            if (!hasMatchingCollection) return false;
          }

          // Favorites filter
          if (filters.onlyFavorites && !asset.isFavorite) {
            return false;
          }

          // Public filter
          if (filters.onlyPublic && !asset.isPublic) {
            return false;
          }

          // Date range filter
          if (filters.dateRange) {
            const assetDate = new Date(asset.uploadedAt);
            if (assetDate < filters.dateRange.start || assetDate > filters.dateRange.end) {
              return false;
            }
          }

          // Size range filter
          if (filters.sizeRange) {
            if (
              asset.metadata.size < filters.sizeRange.min ||
              asset.metadata.size > filters.sizeRange.max
            ) {
              return false;
            }
          }

          return true;
        });
      },

      // Selection Actions
      selectAsset: (id: string) => {
        set(state => ({
          selectedAssets: state.selectedAssets.includes(id)
            ? state.selectedAssets
            : [...state.selectedAssets, id],
        }));
      },

      selectAssets: (ids: string[]) => {
        set({ selectedAssets: ids });
      },

      deselectAsset: (id: string) => {
        set(state => ({
          selectedAssets: state.selectedAssets.filter(assetId => assetId !== id),
        }));
      },

      clearSelection: () => {
        set({ selectedAssets: [] });
      },

      toggleAssetSelection: (id: string) => {
        const { selectedAssets } = get();
        if (selectedAssets.includes(id)) {
          get().deselectAsset(id);
        } else {
          get().selectAsset(id);
        }
      },

      selectAll: () => {
        const filteredAssets = get().applyFilters();
        set({ selectedAssets: filteredAssets.map(asset => asset.id) });
      },

      // Collection Actions (placeholder implementations)
      createCollection: async (name: string, description?: string) => {
        const newCollection: AssetCollection = {
          id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          description,
          assetIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublic: false,
        };

        set(state => ({
          collections: [...state.collections, newCollection],
        }));

        return newCollection;
      },

      updateCollection: async (id: string, updates: Partial<AssetCollection>) => {
        set(state => ({
          collections: state.collections.map(collection =>
            collection.id === id ? { ...collection, ...updates, updatedAt: new Date() } : collection
          ),
        }));
      },

      deleteCollection: async (id: string) => {
        set(state => ({
          collections: state.collections.filter(collection => collection.id !== id),
        }));
      },

      addAssetsToCollection: async (collectionId: string, assetIds: string[]) => {
        set(state => ({
          collections: state.collections.map(collection =>
            collection.id === collectionId
              ? {
                  ...collection,
                  assetIds: Array.from(new Set([...collection.assetIds, ...assetIds])),
                  updatedAt: new Date(),
                }
              : collection
          ),
          assets: state.assets.map(asset =>
            assetIds.includes(asset.id)
              ? {
                  ...asset,
                  collections: Array.from(new Set([...asset.collections, collectionId])),
                  updatedAt: new Date(),
                }
              : asset
          ),
        }));
      },

      removeAssetsFromCollection: async (collectionId: string, assetIds: string[]) => {
        set(state => ({
          collections: state.collections.map(collection =>
            collection.id === collectionId
              ? {
                  ...collection,
                  assetIds: collection.assetIds.filter(id => !assetIds.includes(id)),
                  updatedAt: new Date(),
                }
              : collection
          ),
          assets: state.assets.map(asset =>
            assetIds.includes(asset.id)
              ? {
                  ...asset,
                  collections: asset.collections.filter(id => id !== collectionId),
                  updatedAt: new Date(),
                }
              : asset
          ),
        }));
      },

      // UI Actions
      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode });
      },

      setSorting: (sortBy: SortBy, sortOrder: SortOrder) => {
        set({ sortBy, sortOrder });
      },

      // Configuration Actions
      updateUploadConfig: (config: Partial<AssetUploadConfig>) => {
        set(state => ({
          uploadConfig: { ...state.uploadConfig, ...config },
        }));
      },

      // Utility Actions
      getAssetById: (id: string) => {
        return get().assets.find(asset => asset.id === id);
      },

      getAssetsByType: (type: AssetType) => {
        return get().assets.filter(asset => asset.type === type);
      },

      getAssetsByCollection: (collectionId: string) => {
        return get().assets.filter(asset => asset.collections.includes(collectionId));
      },

      getRecentAssets: (limit = 10) => {
        return get()
          .assets.sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          )
          .slice(0, limit);
      },

      getFavoriteAssets: () => {
        return get().assets.filter(asset => asset.isFavorite);
      },

      getAssetUsageStats: () => {
        const { assets } = get();
        const totalAssets = assets.length;
        const totalSize = assets.reduce((sum, asset) => sum + asset.metadata.size, 0);

        const byType = assets.reduce(
          (acc, asset) => {
            acc[asset.type] = (acc[asset.type] || 0) + 1;
            return acc;
          },
          {} as Record<AssetType, number>
        );

        return { totalAssets, totalSize, byType };
      },

      // Layout Generation Actions
      generateLayouts: async (request: LayoutGenerationRequest) => {
        set({ isGeneratingLayouts: true, layoutGenerationError: null });

        try {
          console.log('🎨 Generating layouts with AI...', request);

          const layouts = await layoutGenerationService.generateLayouts(request);

          set(state => ({
            layouts: [...state.layouts, ...layouts],
            isGeneratingLayouts: false,
            currentLayout: layouts[0] || null, // Select best layout
          }));

          console.log(`✅ Generated ${layouts.length} layout variations`);
          return layouts;
        } catch (error) {
          console.error('Layout generation failed:', error);
          set({
            isGeneratingLayouts: false,
            layoutGenerationError:
              error instanceof Error ? error.message : 'Layout generation failed',
          });
          throw error;
        }
      },

      analyzeVisualIntelligence: async (assets: UploadedAsset[], territory: Territory) => {
        set({ isAnalyzingVisuals: true, layoutGenerationError: null });

        try {
          console.log('🧠 Analyzing visual intelligence...', {
            assets: assets.length,
            territory: territory.id,
          });

          const intelligence = await visualIntelligenceService.analyzeVisualIntelligence(
            assets,
            territory
          );

          set({
            visualIntelligence: intelligence,
            isAnalyzingVisuals: false,
          });

          console.log('✅ Visual intelligence analysis completed');
          return intelligence;
        } catch (error) {
          console.error('Visual intelligence analysis failed:', error);
          set({
            isAnalyzingVisuals: false,
            layoutGenerationError:
              error instanceof Error ? error.message : 'Visual analysis failed',
          });
          throw error;
        }
      },

      selectLayout: (layout: LayoutVariation) => {
        set({ currentLayout: layout });
        console.log('🎯 Selected layout:', layout.id);
      },

      updateLayout: (layoutId: string, updates: Partial<LayoutVariation>) => {
        set(state => ({
          layouts: state.layouts.map(layout =>
            layout.id === layoutId ? { ...layout, ...updates, updatedAt: new Date() } : layout
          ),
          currentLayout:
            state.currentLayout?.id === layoutId
              ? { ...state.currentLayout, ...updates, updatedAt: new Date() }
              : state.currentLayout,
        }));
        console.log('📝 Updated layout:', layoutId);
      },

      deleteLayout: (layoutId: string) => {
        set(state => ({
          layouts: state.layouts.filter(layout => layout.id !== layoutId),
          currentLayout: state.currentLayout?.id === layoutId ? null : state.currentLayout,
        }));
        console.log('🗑️ Deleted layout:', layoutId);
      },

      duplicateLayout: (layoutId: string) => {
        const state = get();
        const originalLayout = state.layouts.find(layout => layout.id === layoutId);

        if (!originalLayout) {
          throw new Error('Layout not found');
        }

        const duplicatedLayout: LayoutVariation = {
          ...originalLayout,
          id: `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${originalLayout.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set(state => ({
          layouts: [...state.layouts, duplicatedLayout],
        }));

        console.log('📋 Duplicated layout:', layoutId, '→', duplicatedLayout.id);
        return duplicatedLayout;
      },

      exportLayout: async (layoutId: string, config: ExportConfiguration) => {
        const state = get();
        const layout = state.layouts.find(l => l.id === layoutId);

        if (!layout) {
          throw new Error('Layout not found');
        }

        try {
          console.log('📤 Exporting layout:', layoutId, config);

          // In production, this would generate the actual file
          const exportUrl = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify({
              layout,
              config,
              exportedAt: new Date().toISOString(),
            })
          )}`;

          console.log('✅ Layout exported successfully');
          return exportUrl;
        } catch (error) {
          console.error('Layout export failed:', error);
          throw new Error(
            `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      },

      clearLayouts: () => {
        set({
          layouts: [],
          currentLayout: null,
          visualIntelligence: null,
        });
        console.log('🧹 Cleared all layouts');
      },

      clearLayoutError: () => {
        set({ layoutGenerationError: null });
      },

      // Multimedia Generation Actions
      generateImage: async (request: TextToImageRequest) => {
        set({ isGeneratingImage: true, generationError: null, generationProgress: 0 });

        try {
          // Starting image generation

          // Use the simple API directly
          const { generateSimpleImage_API } = await import('../services/secureApiService');

          const response = await generateSimpleImage_API(request.prompt, {
            territory: request.territory,
            imageType: request.imageType,
            quality: request.quality === 'ultra' ? 'hd' : request.quality,
          });

          console.log('🎯 Direct API response:', response);

          if (response && response.length > 0) {
            const imageResult = response[0];
            console.log('🖼️ Processing image result:', imageResult);

            // Map ImageType to AssetType
            const assetTypeMap: Record<string, AssetType> = {
              product: 'product',
              lifestyle: 'lifestyle',
              background: 'background',
              hero: 'background',
              icon: 'icon',
              pattern: 'texture',
            };

            // Create asset directly and add to store
            const generatedAsset: UploadedAsset = {
              id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              filename: `generated-image-${Date.now()}.png`,
              type: assetTypeMap[request.imageType || 'background'] || 'background',
              format: 'image',
              status: 'ready',
              url: imageResult.imageUrl,
              thumbnailUrl: imageResult.imageUrl,
              uploadedAt: new Date(),
              updatedAt: new Date(),
              metadata: {
                filename: `generated-image-${Date.now()}.png`,
                originalName: `generated-image-${Date.now()}.png`,
                size: 1024000, // Estimated size
                mimeType: 'image/png',
                dimensions: {
                  width: 1024,
                  height: 1024,
                },
                fileHash: `hash_${Date.now()}`,
              },
              usageRights: {
                license: 'proprietary',
                usage_rights: ['commercial_use', 'modification_allowed'],
                attribution_required: false,
                commercial_use: true,
                modification_allowed: true,
              },
              tags: ['ai-generated', 'dalle-3'],
              collections: [],
              isPublic: false,
              isFavorite: false,
              usageCount: 0,
              description: `AI generated image: ${request.prompt}`,
            };

            // Add asset to the store immediately
            console.log('🚀 About to add asset to store:', generatedAsset);

            set(state => {
              const newAssets = [generatedAsset, ...state.assets];
              console.log('🎨 Adding generated asset to store:', {
                newAsset: generatedAsset,
                currentAssetsCount: state.assets.length,
                newAssetsCount: newAssets.length,
                assetId: generatedAsset.id,
                assetUrl: generatedAsset.url,
              });
              return {
                assets: newAssets,
                isGeneratingImage: false,
                generationProgress: 100,
              };
            });

            console.log('✅ Generated image added to library successfully!');
            console.log('📊 Final asset count:', get().assets.length);
            return `asset_${generatedAsset.id}`;
          } else {
            throw new Error('No image data received from API');
          }
        } catch (error) {
          console.error('💥 Image generation failed in store:', error);
          const errorMessage = error instanceof Error ? error.message : 'Image generation failed';
          console.error('💥 Setting error state:', errorMessage);
          set({
            isGeneratingImage: false,
            generationError: errorMessage,
          });
          throw error;
        }
      },

      generateVideo: async (request: ImageToVideoRequest) => {
        set({ isGeneratingVideo: true, generationError: null, generationProgress: 0 });

        try {
          console.log('🎬 Starting video generation...', request);

          // Queue the generation request
          const queueId = await multimediaGenerationService.queueGeneration(request, 'normal');

          const queueItem = multimediaGenerationService.getQueueStatus(queueId);
          if (queueItem) {
            set(state => ({
              generationQueue: [...state.generationQueue, queueItem],
              currentGeneration: queueItem,
            }));
          }

          console.log(`✅ Video generation queued: ${queueId}`);
          return queueId;
        } catch (error) {
          console.error('Video generation failed:', error);
          set({
            isGeneratingVideo: false,
            generationError: error instanceof Error ? error.message : 'Video generation failed',
          });
          throw error;
        }
      },

      enhancePrompt: async (
        prompt: string,
        territory: Territory,
        brandGuidelines: BrandGuidelines,
        imageType: ImageType,
        culturalContext: CulturalContext
      ) => {
        try {
          console.log('✨ Enhancing prompt for territory-driven generation...');

          const enhancement = await multimediaGenerationService.enhancePromptForTerritory(
            prompt,
            territory,
            brandGuidelines,
            imageType,
            culturalContext
          );

          set(state => ({
            promptEnhancements: [...state.promptEnhancements, enhancement],
          }));

          console.log('✅ Prompt enhanced successfully');
          return enhancement;
        } catch (error) {
          console.error('Prompt enhancement failed:', error);
          throw error;
        }
      },

      assessQuality: async (
        assetId: string,
        _territory: Territory,
        _brandGuidelines: BrandGuidelines
      ) => {
        try {
          // Mock quality assessment (in production, this would use AI analysis)
          const assessment: QualityAssessment = {
            score: 85,
            brandCompliance: 90,
            technicalQuality: 88,
            creativityScore: 82,
            territoryAlignment: 87,
            issues: [],
            recommendations: [
              'Consider adjusting color saturation for better brand alignment',
              'Optimize composition for mobile viewing',
            ],
            approved: true,
          };

          set(state => ({
            qualityAssessments: [...state.qualityAssessments, assessment],
          }));

          return assessment;
        } catch (error) {
          throw error;
        }
      },

      batchGenerate: async (request: BatchGenerationRequest) => {
        try {
          console.log('📦 Starting batch generation...', request);

          // Mock batch generation (in production, this would handle multiple requests)
          const batchResult: BatchGenerationResult = {
            batchId: `batch_${Date.now()}`,
            totalRequests: request.requests.length,
            completedRequests: 0,
            failedRequests: 0,
            results: [],
            errors: [],
            startTime: new Date(),
          };

          set(state => ({
            batchGenerations: [...state.batchGenerations, batchResult],
          }));

          console.log(`✅ Batch generation started: ${batchResult.batchId}`);
          return batchResult.batchId;
        } catch (error) {
          console.error('Batch generation failed:', error);
          throw error;
        }
      },

      getGenerationStatus: (queueId: string) => {
        const { generationQueue } = get();
        return generationQueue.find(item => item.id === queueId);
      },

      cancelGeneration: async (queueId: string) => {
        try {
          console.log('❌ Cancelling generation...', queueId);

          set(state => ({
            generationQueue: state.generationQueue.map(item =>
              item.id === queueId ? { ...item, status: 'cancelled' } : item
            ),
          }));

          console.log('✅ Generation cancelled');
        } catch (error) {
          console.error('Failed to cancel generation:', error);
          throw error;
        }
      },

      retryGeneration: async (queueId: string) => {
        try {
          console.log('🔄 Retrying generation...', queueId);

          set(state => ({
            generationQueue: state.generationQueue.map(item =>
              item.id === queueId
                ? {
                    ...item,
                    status: 'queued',
                    retryCount: item.retryCount + 1,
                    updatedAt: new Date(),
                  }
                : item
            ),
          }));

          console.log('✅ Generation retry queued');
        } catch (error) {
          console.error('Failed to retry generation:', error);
          throw error;
        }
      },

      clearGenerationQueue: () => {
        set({
          generationQueue: [],
          currentGeneration: null,
          generatedAssets: [],
        });
        console.log('🧹 Cleared generation queue');
      },

      clearGenerationError: () => {
        set({ generationError: null });
      },

      // Simplified polling for legacy compatibility (not used with direct API integration)
      startGenerationPolling: () => {
        // Polling not needed - using direct API integration
      },
    }),
    {
      name: `${APP_CONFIG.storage.keys.appState}-assets`,
      partialize: state => ({
        // Persist only essential data
        assets: state.assets,
        collections: state.collections,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        uploadConfig: state.uploadConfig,
        // Layout data
        layouts: state.layouts,
        templates: state.templates,
        currentLayout: state.currentLayout,
        // Multimedia generation data
        generatedAssets: state.generatedAssets,
        promptEnhancements: state.promptEnhancements,
        qualityAssessments: state.qualityAssessments,
        batchGenerations: state.batchGenerations,
      }),
    }
  )
);
