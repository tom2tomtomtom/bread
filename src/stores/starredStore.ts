import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StarredItems } from '../types';
import { APP_CONFIG } from '../config/app';

/**
 * StarredStore - Focused store for starred items management
 *
 * Responsibilities:
 * - Starred territories management
 * - Starred headlines management
 * - Favorites organization
 * - Export of starred content
 * - Starred items analytics
 *
 * Benefits:
 * - Dedicated favorites management
 * - Easy starred content operations
 * - Clear separation of starred concerns
 * - Better starred items performance
 */

interface StarredState {
  // Starred items data
  starredItems: StarredItems;

  // Starred items metadata
  starredMetadata: {
    territories: {
      [territoryId: string]: {
        starredAt: string;
        notes?: string;
        tags?: string[];
      };
    };
    headlines: {
      [territoryId: string]: {
        [headlineIndex: number]: {
          starredAt: string;
          notes?: string;
          tags?: string[];
        };
      };
    };
  };

  // Organization features
  collections: {
    id: string;
    name: string;
    description?: string;
    territoryIds: string[];
    headlineRefs: { territoryId: string; headlineIndex: number }[];
    createdAt: string;
    updatedAt: string;
  }[];

  // Actions
  toggleTerritoryStarred: (territoryId: string) => void;
  toggleHeadlineStarred: (territoryId: string, headlineIndex: number) => void;
  clearStarredItems: () => void;

  // Advanced starred operations
  addTerritoryNote: (territoryId: string, note: string) => void;
  addHeadlineNote: (territoryId: string, headlineIndex: number, note: string) => void;
  addTerritoryTags: (territoryId: string, tags: string[]) => void;
  addHeadlineTags: (territoryId: string, headlineIndex: number, tags: string[]) => void;

  // Collection management
  createCollection: (name: string, description?: string) => string;
  addToCollection: (
    collectionId: string,
    territoryId?: string,
    headlineRef?: { territoryId: string; headlineIndex: number }
  ) => void;
  removeFromCollection: (
    collectionId: string,
    territoryId?: string,
    headlineRef?: { territoryId: string; headlineIndex: number }
  ) => void;
  deleteCollection: (collectionId: string) => void;
  updateCollection: (
    collectionId: string,
    updates: { name?: string; description?: string }
  ) => void;

  // Query and analytics
  getStarredCount: () => { territories: number; headlines: number };
  getStarredByTag: (tag: string) => {
    territories: string[];
    headlines: { territoryId: string; headlineIndex: number }[];
  };
  getRecentlyStarred: (limit?: number) => {
    territories: string[];
    headlines: { territoryId: string; headlineIndex: number }[];
  };
  getStarredAnalytics: () => {
    totalStarred: number;
    starredByMonth: { [month: string]: number };
    topTags: { tag: string; count: number }[];
    collections: number;
  };

  // Export functionality
  exportStarredItems: (format: 'json' | 'csv' | 'pdf') => Promise<void>;
  exportCollection: (collectionId: string, format: 'json' | 'csv' | 'pdf') => Promise<void>;
}

export const useStarredStore = create<StarredState>()(
  persist(
    (set, get) => ({
      // Initial state
      starredItems: {
        territories: [],
        headlines: {},
      },
      starredMetadata: {
        territories: {},
        headlines: {},
      },
      collections: [],

      // Basic starred actions
      toggleTerritoryStarred: (territoryId: string) =>
        set(state => {
          const isStarred = state.starredItems.territories.includes(territoryId);
          const newTerritories = isStarred
            ? state.starredItems.territories.filter(id => id !== territoryId)
            : [...state.starredItems.territories, territoryId];

          const newMetadata = { ...state.starredMetadata };
          if (!isStarred) {
            newMetadata.territories[territoryId] = {
              starredAt: new Date().toISOString(),
            };
          } else {
            delete newMetadata.territories[territoryId];
          }

          return {
            starredItems: {
              ...state.starredItems,
              territories: newTerritories,
            },
            starredMetadata: newMetadata,
          };
        }),

      toggleHeadlineStarred: (territoryId: string, headlineIndex: number) =>
        set(state => {
          const territoryHeadlines = state.starredItems.headlines[territoryId] || [];
          const isStarred = territoryHeadlines.includes(headlineIndex);

          const newHeadlines = isStarred
            ? territoryHeadlines.filter(index => index !== headlineIndex)
            : [...territoryHeadlines, headlineIndex];

          const newMetadata = { ...state.starredMetadata };
          if (!newMetadata.headlines[territoryId]) {
            newMetadata.headlines[territoryId] = {};
          }

          if (!isStarred) {
            newMetadata.headlines[territoryId][headlineIndex] = {
              starredAt: new Date().toISOString(),
            };
          } else {
            delete newMetadata.headlines[territoryId][headlineIndex];
          }

          const updatedHeadlines = { ...state.starredItems.headlines };
          if (newHeadlines.length > 0) {
            updatedHeadlines[territoryId] = newHeadlines;
          } else {
            delete updatedHeadlines[territoryId];
          }

          return {
            starredItems: {
              ...state.starredItems,
              headlines: updatedHeadlines,
            },
            starredMetadata: newMetadata,
          };
        }),

      clearStarredItems: () =>
        set({
          starredItems: { territories: [], headlines: {} },
          starredMetadata: { territories: {}, headlines: {} },
        }),

      // Advanced starred operations
      addTerritoryNote: (territoryId: string, note: string) =>
        set(state => ({
          starredMetadata: {
            ...state.starredMetadata,
            territories: {
              ...state.starredMetadata.territories,
              [territoryId]: {
                ...state.starredMetadata.territories[territoryId],
                notes: note,
              },
            },
          },
        })),

      addHeadlineNote: (territoryId: string, headlineIndex: number, note: string) =>
        set(state => ({
          starredMetadata: {
            ...state.starredMetadata,
            headlines: {
              ...state.starredMetadata.headlines,
              [territoryId]: {
                ...state.starredMetadata.headlines[territoryId],
                [headlineIndex]: {
                  ...state.starredMetadata.headlines[territoryId]?.[headlineIndex],
                  notes: note,
                },
              },
            },
          },
        })),

      addTerritoryTags: (territoryId: string, tags: string[]) =>
        set(state => ({
          starredMetadata: {
            ...state.starredMetadata,
            territories: {
              ...state.starredMetadata.territories,
              [territoryId]: {
                ...state.starredMetadata.territories[territoryId],
                tags: [...(state.starredMetadata.territories[territoryId]?.tags || []), ...tags],
              },
            },
          },
        })),

      addHeadlineTags: (territoryId: string, headlineIndex: number, tags: string[]) =>
        set(state => ({
          starredMetadata: {
            ...state.starredMetadata,
            headlines: {
              ...state.starredMetadata.headlines,
              [territoryId]: {
                ...state.starredMetadata.headlines[territoryId],
                [headlineIndex]: {
                  ...state.starredMetadata.headlines[territoryId]?.[headlineIndex],
                  tags: [
                    ...(state.starredMetadata.headlines[territoryId]?.[headlineIndex]?.tags || []),
                    ...tags,
                  ],
                },
              },
            },
          },
        })),

      // Collection management
      createCollection: (name: string, description?: string) => {
        const id = `collection-${Date.now()}`;
        set(state => ({
          collections: [
            ...state.collections,
            {
              id,
              name,
              description,
              territoryIds: [],
              headlineRefs: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },

      addToCollection: (
        collectionId: string,
        territoryId?: string,
        headlineRef?: { territoryId: string; headlineIndex: number }
      ) =>
        set(state => ({
          collections: state.collections.map(collection =>
            collection.id === collectionId
              ? {
                  ...collection,
                  territoryIds:
                    territoryId && !collection.territoryIds.includes(territoryId)
                      ? [...collection.territoryIds, territoryId]
                      : collection.territoryIds,
                  headlineRefs:
                    headlineRef &&
                    !collection.headlineRefs.some(
                      ref =>
                        ref.territoryId === headlineRef.territoryId &&
                        ref.headlineIndex === headlineRef.headlineIndex
                    )
                      ? [...collection.headlineRefs, headlineRef]
                      : collection.headlineRefs,
                  updatedAt: new Date().toISOString(),
                }
              : collection
          ),
        })),

      removeFromCollection: (
        collectionId: string,
        territoryId?: string,
        headlineRef?: { territoryId: string; headlineIndex: number }
      ) =>
        set(state => ({
          collections: state.collections.map(collection =>
            collection.id === collectionId
              ? {
                  ...collection,
                  territoryIds: territoryId
                    ? collection.territoryIds.filter(id => id !== territoryId)
                    : collection.territoryIds,
                  headlineRefs: headlineRef
                    ? collection.headlineRefs.filter(
                        ref =>
                          !(
                            ref.territoryId === headlineRef.territoryId &&
                            ref.headlineIndex === headlineRef.headlineIndex
                          )
                      )
                    : collection.headlineRefs,
                  updatedAt: new Date().toISOString(),
                }
              : collection
          ),
        })),

      deleteCollection: (collectionId: string) =>
        set(state => ({
          collections: state.collections.filter(collection => collection.id !== collectionId),
        })),

      updateCollection: (collectionId: string, updates: { name?: string; description?: string }) =>
        set(state => ({
          collections: state.collections.map(collection =>
            collection.id === collectionId
              ? {
                  ...collection,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : collection
          ),
        })),

      // Query and analytics
      getStarredCount: () => {
        const { starredItems } = get();
        const headlineCount = Object.values(starredItems.headlines).reduce(
          (total, headlines) => total + (headlines?.length || 0),
          0
        );

        return {
          territories: starredItems.territories.length,
          headlines: headlineCount,
        };
      },

      getStarredByTag: (tag: string) => {
        const { starredItems, starredMetadata } = get();

        const territories = starredItems.territories.filter(territoryId =>
          starredMetadata.territories[territoryId]?.tags?.includes(tag)
        );

        const headlines: { territoryId: string; headlineIndex: number }[] = [];
        Object.entries(starredItems.headlines).forEach(([territoryId, headlineIndices]) => {
          headlineIndices?.forEach(headlineIndex => {
            if (starredMetadata.headlines[territoryId]?.[headlineIndex]?.tags?.includes(tag)) {
              headlines.push({ territoryId, headlineIndex });
            }
          });
        });

        return { territories, headlines };
      },

      getRecentlyStarred: (limit = 10) => {
        const { starredItems, starredMetadata } = get();

        // Get all starred items with timestamps
        const allStarred: Array<{
          type: 'territory' | 'headline';
          territoryId: string;
          headlineIndex?: number;
          starredAt: string;
        }> = [];

        // Add territories
        starredItems.territories.forEach(territoryId => {
          const metadata = starredMetadata.territories[territoryId];
          if (metadata) {
            allStarred.push({
              type: 'territory',
              territoryId,
              starredAt: metadata.starredAt,
            });
          }
        });

        // Add headlines
        Object.entries(starredItems.headlines).forEach(([territoryId, headlineIndices]) => {
          headlineIndices?.forEach(headlineIndex => {
            const metadata = starredMetadata.headlines[territoryId]?.[headlineIndex];
            if (metadata) {
              allStarred.push({
                type: 'headline',
                territoryId,
                headlineIndex,
                starredAt: metadata.starredAt,
              });
            }
          });
        });

        // Sort by starredAt and limit
        const recent = allStarred
          .sort((a, b) => new Date(b.starredAt).getTime() - new Date(a.starredAt).getTime())
          .slice(0, limit);

        return {
          territories: recent
            .filter(item => item.type === 'territory')
            .map(item => item.territoryId),
          headlines: recent
            .filter(item => item.type === 'headline')
            .map(item => ({ territoryId: item.territoryId, headlineIndex: item.headlineIndex! })),
        };
      },

      getStarredAnalytics: () => {
        const { starredItems, starredMetadata, collections } = get();

        const totalTerritories = starredItems.territories.length;
        const totalHeadlines = Object.values(starredItems.headlines).reduce(
          (total, headlines) => total + (headlines?.length || 0),
          0
        );

        // Get starred by month
        const starredByMonth: { [month: string]: number } = {};

        // Process territories
        Object.values(starredMetadata.territories).forEach(metadata => {
          const month = new Date(metadata.starredAt).toISOString().substring(0, 7); // YYYY-MM
          starredByMonth[month] = (starredByMonth[month] || 0) + 1;
        });

        // Process headlines
        Object.values(starredMetadata.headlines).forEach(territoryHeadlines => {
          Object.values(territoryHeadlines).forEach(metadata => {
            const month = new Date(metadata.starredAt).toISOString().substring(0, 7);
            starredByMonth[month] = (starredByMonth[month] || 0) + 1;
          });
        });

        // Get top tags
        const tagCounts: { [tag: string]: number } = {};

        // Count territory tags
        Object.values(starredMetadata.territories).forEach(metadata => {
          metadata.tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        // Count headline tags
        Object.values(starredMetadata.headlines).forEach(territoryHeadlines => {
          Object.values(territoryHeadlines).forEach(metadata => {
            metadata.tags?.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          });
        });

        const topTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return {
          totalStarred: totalTerritories + totalHeadlines,
          starredByMonth,
          topTags,
          collections: collections.length,
        };
      },

      // Export functionality
      exportStarredItems: async (format: 'json' | 'csv' | 'pdf') => {
        const { starredItems, starredMetadata } = get();

        // TODO: Implement actual export functionality
        console.log('Exporting starred items in format:', format);
        console.log('Data:', { starredItems, starredMetadata });

        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
      },

      exportCollection: async (collectionId: string, format: 'json' | 'csv' | 'pdf') => {
        const { collections } = get();
        const collection = collections.find(c => c.id === collectionId);

        if (!collection) {
          throw new Error('Collection not found');
        }

        // TODO: Implement actual export functionality
        console.log('Exporting collection in format:', format);
        console.log('Collection:', collection);

        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
      },
    }),
    {
      name: `${APP_CONFIG.storage.keys.appState}-starred`,
      partialize: state => ({
        // Persist all starred data
        starredItems: state.starredItems,
        starredMetadata: state.starredMetadata,
        collections: state.collections,
      }),
    }
  )
);
