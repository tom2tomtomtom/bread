import { useState, useCallback, useEffect } from 'react';
import { StarredItems } from '../types';

export const useStarredItems = () => {
  const [starredItems, setStarredItems] = useState<StarredItems>({
    territories: [],
    headlines: {}
  });

  // Load starred items from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bread_starred_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        setStarredItems(parsed);
      }
    } catch (error) {
      console.error('Failed to load starred items:', error);
    }
  }, []);

  // Save starred items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('bread_starred_items', JSON.stringify(starredItems));
    } catch (error) {
      console.error('Failed to save starred items:', error);
    }
  }, [starredItems]);

  const toggleTerritoryStarred = useCallback((territoryId: string) => {
    setStarredItems(prev => {
      const isCurrentlyStarred = prev.territories.includes(territoryId);
      
      if (isCurrentlyStarred) {
        // Remove from starred territories
        return {
          ...prev,
          territories: prev.territories.filter(id => id !== territoryId),
          // Also remove all headlines from this territory
          headlines: Object.fromEntries(
            Object.entries(prev.headlines).filter(([key]) => key !== territoryId)
          )
        };
      } else {
        // Add to starred territories
        return {
          ...prev,
          territories: [...prev.territories, territoryId]
        };
      }
    });
  }, []);

  const toggleHeadlineStarred = useCallback((territoryId: string, headlineIndex: number) => {
    setStarredItems(prev => {
      const territoryHeadlines = prev.headlines[territoryId] || [];
      const isCurrentlyStarred = territoryHeadlines.includes(headlineIndex);
      
      if (isCurrentlyStarred) {
        // Remove headline from starred
        const updatedHeadlines = territoryHeadlines.filter(index => index !== headlineIndex);
        
        if (updatedHeadlines.length === 0) {
          // Remove territory entry if no headlines are starred
          const { [territoryId]: removed, ...remainingHeadlines } = prev.headlines;
          return {
            ...prev,
            headlines: remainingHeadlines
          };
        } else {
          return {
            ...prev,
            headlines: {
              ...prev.headlines,
              [territoryId]: updatedHeadlines
            }
          };
        }
      } else {
        // Add headline to starred
        return {
          ...prev,
          headlines: {
            ...prev.headlines,
            [territoryId]: [...territoryHeadlines, headlineIndex]
          }
        };
      }
    });
  }, []);

  const clearStarredItems = useCallback(() => {
    setStarredItems({
      territories: [],
      headlines: {}
    });
  }, []);

  const getStarredCount = useCallback(() => {
    const territoryCount = starredItems.territories.length;
    const headlineCount = Object.values(starredItems.headlines).reduce(
      (total, headlines) => total + headlines.length, 
      0
    );
    return { territories: territoryCount, headlines: headlineCount };
  }, [starredItems]);

  return {
    starredItems,
    toggleTerritoryStarred,
    toggleHeadlineStarred,
    clearStarredItems,
    getStarredCount
  };
};
