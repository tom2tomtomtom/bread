import React, { useState, useRef, useEffect } from 'react';
import { LayoutVariation, ImagePlacement, TextPlacement } from '../../types';
import { useAssetStore } from '../../stores/assetStore';

interface LayoutPreviewProps {
  layout: LayoutVariation;
  width?: number;
  height?: number;
  interactive?: boolean;
  showControls?: boolean;
  onLayoutUpdate?: (updates: Partial<LayoutVariation>) => void;
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  layout,
  width = 400,
  height = 400,
  interactive = false,
  showControls = false,
  onLayoutUpdate,
}) => {
  const { assets } = useAssetStore();
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  // Calculate scale factor to fit the layout in preview
  const targetFormat = layout.channelOptimization[0];
  const originalWidth = getFormatWidth(targetFormat);
  const originalHeight = getFormatHeight(targetFormat);
  const scale = Math.min(width / originalWidth, height / originalHeight);

  const scaledWidth = originalWidth * scale;
  const scaledHeight = originalHeight * scale;

  function getFormatWidth(format: string): number {
    // Simplified format dimensions (in production, use CHANNEL_SPECIFICATIONS)
    const dimensions: Record<string, { width: number; height: number }> = {
      instagram_post: { width: 1080, height: 1080 },
      instagram_story: { width: 1080, height: 1920 },
      facebook_post: { width: 1200, height: 630 },
      linkedin_post: { width: 1200, height: 627 },
      print_a4: { width: 2480, height: 3508 },
      banner_leaderboard: { width: 728, height: 90 },
    };
    return dimensions[format]?.width || 1080;
  }

  function getFormatHeight(format: string): number {
    const dimensions: Record<string, { width: number; height: number }> = {
      instagram_post: { width: 1080, height: 1080 },
      instagram_story: { width: 1080, height: 1920 },
      facebook_post: { width: 1200, height: 630 },
      linkedin_post: { width: 1200, height: 627 },
      print_a4: { width: 2480, height: 3508 },
      banner_leaderboard: { width: 728, height: 90 },
    };
    return dimensions[format]?.height || 1080;
  }

  const handleElementClick = (elementId: string) => {
    if (interactive) {
      setSelectedElement(elementId);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (!interactive) return;

    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);

    const rect = previewRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !interactive) return;

    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - dragOffset.x) / scale;
    const y = (e.clientY - rect.top - dragOffset.y) / scale;

    // Update element position
    const isImage = layout.imageComposition.some(img => img.assetId === selectedElement);
    const isText = layout.textPlacement.some(text => text.id === selectedElement);

    if (isImage && onLayoutUpdate) {
      const updatedImages = layout.imageComposition.map(img =>
        img.assetId === selectedElement ? { ...img, x, y } : img
      );
      onLayoutUpdate({ imageComposition: updatedImages });
    } else if (isText && onLayoutUpdate) {
      const updatedTexts = layout.textPlacement.map(text =>
        text.id === selectedElement ? { ...text, x, y } : text
      );
      onLayoutUpdate({ textPlacement: updatedTexts });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return;
  }, [isDragging, selectedElement]);

  const renderImageElement = (image: ImagePlacement) => {
    const asset = assets.find(a => a.id === image.assetId);
    const isSelected = selectedElement === image.assetId;

    return (
      <div
        key={image.assetId}
        className={`absolute cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500 ring-opacity-75' : ''
        } ${interactive ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
        style={{
          left: image.x * scale,
          top: image.y * scale,
          width: image.width * scale,
          height: image.height * scale,
          transform: `rotate(${image.rotation}deg)`,
          opacity: image.opacity,
          zIndex: image.zIndex,
        }}
        onClick={() => handleElementClick(image.assetId)}
        onMouseDown={e => handleMouseDown(e, image.assetId)}
      >
        {asset ? (
          <img
            src={asset.url}
            alt={asset.filename}
            className="w-full h-full object-cover rounded"
            style={{
              filter: `brightness(${image.filters.brightness}%) contrast(${image.filters.contrast}%) saturate(${image.filters.saturation}%) blur(${image.filters.blur}px)`,
            }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500 text-xs">Missing Asset</span>
          </div>
        )}

        {isSelected && interactive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
        )}
      </div>
    );
  };

  const renderTextElement = (text: TextPlacement) => {
    const isSelected = selectedElement === text.id;

    return (
      <div
        key={text.id}
        className={`absolute cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500 ring-opacity-75' : ''
        } ${interactive ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
        style={{
          left: text.x * scale,
          top: text.y * scale,
          width: text.width * scale,
          height: text.height * scale,
          transform: `rotate(${text.rotation}deg)`,
          opacity: text.opacity,
          zIndex: text.zIndex,
        }}
        onClick={() => handleElementClick(text.id)}
        onMouseDown={e => handleMouseDown(e, text.id)}
      >
        <div
          className="w-full h-full flex items-center"
          style={{
            fontSize: text.fontSize * scale,
            fontFamily: text.fontFamily,
            fontWeight: text.fontWeight,
            color: text.color,
            textAlign: text.textAlign,
            lineHeight: text.lineHeight,
            letterSpacing: text.letterSpacing,
            textTransform: text.textTransform,
            textShadow: text.effects.shadow
              ? `${text.effects.shadowOffset.x}px ${text.effects.shadowOffset.y}px ${text.effects.shadowBlur}px ${text.effects.shadowColor}`
              : 'none',
            WebkitTextStroke: text.effects.stroke
              ? `${text.effects.strokeWidth}px ${text.effects.strokeColor}`
              : 'none',
          }}
        >
          <span className="w-full">{text.content}</span>
        </div>

        {isSelected && interactive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
        )}
      </div>
    );
  };

  // Handle case where no channel optimization is available
  if (!targetFormat) {
    return <div className="text-red-500">No channel optimization available</div>;
  }

  return (
    <div className="space-y-4">
      {/* Layout Info */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{layout.name}</h4>
          <p className="text-sm text-gray-600">{layout.description}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">{layout.performancePrediction}%</div>
          <div className="text-xs text-gray-500">Performance Score</div>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="relative">
        <div
          ref={previewRef}
          className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mx-auto"
          style={{
            width: scaledWidth,
            height: scaledHeight,
            backgroundColor: layout.colorScheme.background,
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Render Images */}
          {layout.imageComposition.map(renderImageElement)}

          {/* Render Text */}
          {layout.textPlacement.map(renderTextElement)}

          {/* Grid Overlay (when interactive) */}
          {interactive && (
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}
        </div>

        {/* Format Label */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {targetFormat.replace('_', ' ').toUpperCase()}
        </div>

        {/* Dimensions Label */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {originalWidth} × {originalHeight}
        </div>
      </div>

      {/* Element Controls */}
      {showControls && selectedElement && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Element Properties</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-700 mb-1">Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full"
                // Add value and onChange handlers here
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Rotation</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                className="w-full"
                // Add value and onChange handlers here
              />
            </div>
          </div>
        </div>
      )}

      {/* Layout Metadata */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Elements:</span>
            <span className="ml-2 text-gray-600">
              {layout.imageComposition.length} images, {layout.textPlacement.length} text
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Style:</span>
            <span className="ml-2 text-gray-600">
              {layout.templateId.split('_')[1] || 'Custom'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Compliance:</span>
            <span className="ml-2 text-gray-600">{layout.brandCompliance.overall}%</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Created:</span>
            <span className="ml-2 text-gray-600">
              {new Date(layout.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      {layout.aiReasoning && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">🤖 AI Reasoning</h5>
          <p className="text-blue-800 text-sm">{layout.aiReasoning}</p>
        </div>
      )}
    </div>
  );
};
