import React, { useState, useEffect } from 'react';
import { VideoTemplate, VideoContent, VideoFrame } from '../../types/videoTemplates';
import { EnhancedGeneratedOutput } from '../../types';

interface VideoFrameEditorProps {
  template: VideoTemplate;
  generatedContent?: EnhancedGeneratedOutput | null;
  onContentUpdate: (content: VideoContent) => void;
  className?: string;
}

export const VideoFrameEditor: React.FC<VideoFrameEditorProps> = ({
  template,
  generatedContent,
  onContentUpdate,
  className = '',
}) => {
  const [content, setContent] = useState<VideoContent>({
    templateId: template.templateId,
    frame1Content: {},
    frame2Content: {},
    frame3Content: {},
    brandColors: {
      primary: template.brandGuidelines?.primaryColor || '#FF6B35',
      secondary: template.brandGuidelines?.secondaryColor || '#F7931E',
      text: '#333333',
    },
  });

  const [activeFrame, setActiveFrame] = useState<1 | 2 | 3>(1);

  // Auto-populate content from generated territories and copy
  useEffect(() => {
    if (generatedContent?.territories && generatedContent.territories.length > 0) {
      const territory = generatedContent.territories[0];
      const headline = territory.headlines?.[0];

      setContent(prev => ({
        ...prev,
        frame1Content: {
          ...prev.frame1Content,
          headline: headline?.text || territory.title,
        },
        frame2Content: {
          ...prev.frame2Content,
          bodyText: headline?.followUp || territory.positioning,
        },
        frame3Content: {
          ...prev.frame3Content,
          ctaText: 'Learn More',
        },
      }));
    }
  }, [generatedContent]);

  // Notify parent of content changes
  useEffect(() => {
    onContentUpdate(content);
  }, [content, onContentUpdate]);

  const updateFrameContent = (frame: 1 | 2 | 3, key: string, value: string) => {
    const frameKey = `frame${frame}Content` as keyof VideoContent;
    setContent(prev => ({
      ...prev,
      [frameKey]: {
        ...((prev[frameKey] as any) || {}),
        [key]: value,
      },
    }));
  };

  const renderFramePreview = (frame: VideoFrame, frameNumber: 1 | 2 | 3) => {
    const frameKey = `frame${frameNumber}Content` as keyof VideoContent;
    const frameContent = content[frameKey] as any;

    return (
      <div
        className="relative w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          aspectRatio: '9/16',
          backgroundColor: frame.backgroundColor,
          maxHeight: '300px',
        }}
        onClick={() => setActiveFrame(frameNumber)}
      >
        {/* Frame Border */}
        <div
          className={`absolute inset-0 border-2 rounded-lg transition-all duration-300 ${
            activeFrame === frameNumber
              ? 'border-orange-500 shadow-lg shadow-orange-500/30'
              : 'border-white/20'
          }`}
        />

        {/* Frame Number */}
        <div className="absolute top-2 left-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center z-10">
          <span className="text-xs font-bold text-white">{frameNumber}</span>
        </div>

        {/* Frame Duration */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
          {frame.duration / 1000}s
        </div>

        {/* Content Preview */}
        <div className="absolute inset-4 flex flex-col justify-center items-center text-center">
          {Object.entries(frame.elements).map(([key, element]) => {
            const elementContent = frameContent?.[key] || '';

            if (element.slot === 'text' || element.slot === 'button') {
              return (
                <div
                  key={key}
                  className="mb-1 p-1 bg-black/20 rounded text-white text-xs truncate w-full"
                  style={{
                    fontSize: `${parseInt(element.style?.fontSize || '16px') / 8}px`,
                    color: element.style?.color || 'white',
                    backgroundColor: element.style?.backgroundColor || 'transparent',
                  }}
                >
                  {elementContent || `[${key}]`}
                </div>
              );
            }

            if (element.slot === 'image' || element.slot === 'background') {
              return (
                <div
                  key={key}
                  className="mb-1 p-2 bg-gray-700 rounded text-gray-300 text-xs flex items-center justify-center"
                  style={{ minHeight: '20px' }}
                >
                  🖼️ {key}
                </div>
              );
            }

            if (element.slot === 'logo') {
              return (
                <div key={key} className="mb-1 p-1 bg-white/10 rounded text-white text-xs">
                  🏷️ Logo
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Animation Indicator */}
        {frame.animation && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-500/80 rounded text-xs text-white">
            {frame.animation.in}
          </div>
        )}
      </div>
    );
  };

  const renderFrameEditor = () => {
    const frame = template.frames[activeFrame - 1];
    const frameKey = `frame${activeFrame}Content` as keyof VideoContent;
    const frameContent = content[frameKey] as any;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            Frame {activeFrame} -{' '}
            {activeFrame === 1 ? 'Hook' : activeFrame === 2 ? 'Value' : 'Action'}
          </h3>
          <p className="text-gray-400">
            {activeFrame === 1 && 'Grab attention with compelling visuals and headlines'}
            {activeFrame === 2 && 'Present your key value proposition and benefits'}
            {activeFrame === 3 && 'Drive action with clear call-to-action'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Content Editor */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Content Editor</h4>

            {Object.entries(frame.elements).map(([key, element]) => {
              if (element.slot === 'text' || element.slot === 'button') {
                return (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                      {element.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {element.maxLines && element.maxLines > 1 ? (
                      <textarea
                        value={frameContent?.[key] || ''}
                        onChange={e => updateFrameContent(activeFrame, key, e.target.value)}
                        placeholder={`Enter ${key}...`}
                        rows={element.maxLines}
                        maxLength={element.maxCharacters}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={frameContent?.[key] || ''}
                        onChange={e => updateFrameContent(activeFrame, key, e.target.value)}
                        placeholder={`Enter ${key}...`}
                        maxLength={element.maxCharacters}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                      />
                    )}
                    {element.maxCharacters && (
                      <div className="text-xs text-gray-500 text-right">
                        {(frameContent?.[key] || '').length} / {element.maxCharacters}
                      </div>
                    )}
                  </div>
                );
              }

              if (element.slot === 'image' || element.slot === 'background') {
                return (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                      {element.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-colors cursor-pointer">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-gray-400 text-sm">Click to upload image</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Recommended: {element.position.w}x{element.position.h}px
                      </p>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* Auto-fill buttons */}
            <div className="pt-4 border-t border-white/10">
              <h5 className="text-sm font-medium text-gray-300 mb-3">Quick Fill Options</h5>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (generatedContent?.territories?.[0]) {
                      const territory = generatedContent.territories[0];
                      if (activeFrame === 1) {
                        updateFrameContent(1, 'headline', territory.title);
                      } else if (activeFrame === 2) {
                        updateFrameContent(2, 'bodyText', territory.positioning);
                      }
                    }
                  }}
                  className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                >
                  Use Territory Content
                </button>
                <button
                  onClick={() => {
                    if (activeFrame === 3) {
                      updateFrameContent(3, 'ctaText', 'Shop Now');
                    }
                  }}
                  className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                >
                  Use Default CTA
                </button>
              </div>
            </div>
          </div>

          {/* Element Properties */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Frame Properties</h4>

            <div className="bg-white/5 rounded-xl p-4">
              <h5 className="text-sm font-medium text-gray-300 mb-3">Animation</h5>
              {frame.animation && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entrance:</span>
                    <span className="text-white">{frame.animation.in}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Exit:</span>
                    <span className="text-white">{frame.animation.out}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{frame.animation.duration}ms</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h5 className="text-sm font-medium text-gray-300 mb-3">Elements</h5>
              <div className="space-y-2">
                {Object.entries(frame.elements).map(([key, element]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-white px-2 py-1 bg-white/10 rounded text-xs">
                      {element.slot}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`video-frame-editor ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">🎬 Video Content Editor</h2>
        <p className="text-gray-300 text-lg">
          Customize your {template.name} template with content and assets
        </p>
      </div>

      {/* Frame Previews */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">Frame Overview</h3>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {template.frames.map((frame, index) => (
            <div key={frame.frameNumber} className="text-center">
              <div className="mb-2">{renderFramePreview(frame, frame.frameNumber)}</div>
              <div className="text-sm text-gray-400">
                Frame {frame.frameNumber}:{' '}
                {frame.frameNumber === 1 ? 'Hook' : frame.frameNumber === 2 ? 'Value' : 'Action'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frame Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1 inline-flex">
          {[1, 2, 3].map(frameNum => (
            <button
              key={frameNum}
              onClick={() => setActiveFrame(frameNum as 1 | 2 | 3)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeFrame === frameNum
                  ? 'bg-orange-500 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Frame {frameNum}
            </button>
          ))}
        </div>
      </div>

      {/* Active Frame Editor */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
        {renderFrameEditor()}
      </div>
    </div>
  );
};
