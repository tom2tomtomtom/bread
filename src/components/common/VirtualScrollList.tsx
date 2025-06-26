import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * VirtualScrollList - High-performance virtual scrolling component
 * 
 * Benefits:
 * - Only renders visible items + overscan buffer
 * - Handles thousands of items without performance issues
 * - Smooth scrolling with proper positioning
 * - Memory efficient for large datasets
 * 
 * Use cases:
 * - Large territory lists
 * - Extensive headline collections
 * - Asset galleries
 * - Search results
 */
export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Calculate total height and visible items
  const totalHeight = items.length * itemHeight;
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (items[i]) {
        result.push({
          item: items[i],
          index: i,
          offsetY: i * itemHeight,
        });
      }
    }
    return result;
  }, [items, visibleRange, itemHeight]);

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (scrollElementRef.current) {
      const targetScrollTop = index * itemHeight;
      scrollElementRef.current.scrollTop = targetScrollTop;
      setScrollTop(targetScrollTop);
    }
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    scrollToItem(0);
  }, [scrollToItem]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    scrollToItem(items.length - 1);
  }, [scrollToItem, items.length]);

  return (
    <div className={`relative ${className}`}>
      {/* Scroll Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={scrollToTop}
          className="bg-black/20 hover:bg-black/30 text-white p-1 rounded text-xs"
          title="Scroll to top"
        >
          ↑
        </button>
        <button
          onClick={scrollToBottom}
          className="bg-black/20 hover:bg-black/30 text-white p-1 rounded text-xs"
          title="Scroll to bottom"
        >
          ↓
        </button>
      </div>

      {/* Virtual Scroll Container */}
      <div
        ref={scrollElementRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Total height spacer */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible items */}
          {visibleItems.map(({ item, index, offsetY }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: offsetY,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Performance Stats (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs p-2 rounded">
          <div>Total: {items.length}</div>
          <div>Visible: {visibleItems.length}</div>
          <div>Range: {visibleRange.startIndex}-{visibleRange.endIndex}</div>
          <div>Scroll: {Math.round(scrollTop)}px</div>
        </div>
      )}
    </div>
  );
}

// Hook for managing virtual scroll state
export function useVirtualScroll<T>(items: T[], itemHeight: number = 100) {
  const [containerHeight, setContainerHeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect container height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return {
    containerRef,
    containerHeight,
    itemHeight,
    totalItems: items.length,
    shouldUseVirtualScroll: items.length > 50, // Use virtual scrolling for 50+ items
  };
}

export default VirtualScrollList;
