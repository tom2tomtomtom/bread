import React, { useState, useRef } from 'react';

interface BriefBlock {
  id: string;
  type:
    | 'objective'
    | 'audience'
    | 'message'
    | 'context'
    | 'tone'
    | 'channels'
    | 'kpi'
    | 'constraints';
  title: string;
  content: string;
  placeholder: string;
  icon: string;
}

interface BriefBuilderProps {
  onBriefChange: (brief: string) => void;
  initialBrief?: string;
}

const briefBlocks: BriefBlock[] = [
  {
    id: 'objective',
    type: 'objective',
    title: 'Campaign Objective',
    content: '',
    placeholder:
      'What do you want to achieve? (e.g., Drive awareness, increase sign-ups, boost engagement)',
    icon: '🎯',
  },
  {
    id: 'audience',
    type: 'audience',
    title: 'Target Audience',
    content: '',
    placeholder:
      'Who are you targeting? (e.g., Young families, budget-conscious shoppers, existing members)',
    icon: '👥',
  },
  {
    id: 'message',
    type: 'message',
    title: 'Key Message',
    content: '',
    placeholder:
      "What's the main message? (e.g., Everyday value, exclusive benefits, smart savings)",
    icon: '💬',
  },
  {
    id: 'context',
    type: 'context',
    title: 'Market Context',
    content: '',
    placeholder:
      "What's happening in the market? (e.g., Black Friday, back to school, economic pressures)",
    icon: '📊',
  },
  {
    id: 'tone',
    type: 'tone',
    title: 'Tone & Style',
    content: '',
    placeholder: 'How should it sound? (e.g., Friendly, urgent, premium, conversational)',
    icon: '🎨',
  },
  {
    id: 'channels',
    type: 'channels',
    title: 'Channels',
    content: '',
    placeholder: 'Where will this run? (e.g., Social media, email, in-store, digital display)',
    icon: '📱',
  },
  {
    id: 'kpi',
    type: 'kpi',
    title: 'Success Metrics',
    content: '',
    placeholder: 'How will you measure success? (e.g., Click-through rate, sign-ups, brand recall)',
    icon: '📈',
  },
  {
    id: 'constraints',
    type: 'constraints',
    title: 'Constraints',
    content: '',
    placeholder:
      'Any limitations or requirements? (e.g., Legal requirements, brand guidelines, budget)',
    icon: '⚠️',
  },
];

export const BriefBuilder: React.FC<BriefBuilderProps> = ({
  onBriefChange,
}) => {
  const [availableBlocks, setAvailableBlocks] = useState<BriefBlock[]>(briefBlocks);
  const [usedBlocks, setUsedBlocks] = useState<BriefBlock[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<BriefBlock | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Generate brief text from used blocks
  const generateBriefText = (blocks: BriefBlock[]) => {
    const briefParts = blocks
      .filter(block => block.content.trim())
      .map(block => `${block.title}: ${block.content}`)
      .join('\n\n');

    onBriefChange(briefParts);
  };

  const handleDragStart = (e: React.DragEvent, block: BriefBlock) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggedOver(false);

    if (draggedBlock) {
      // Add block to used blocks
      setUsedBlocks(prev => [...prev, { ...draggedBlock }]);

      // Remove from available blocks
      setAvailableBlocks(prev => prev.filter(block => block.id !== draggedBlock.id));

      setDraggedBlock(null);
    }
  };

  const handleBlockContentChange = (blockId: string, content: string) => {
    const updatedBlocks = usedBlocks.map(block =>
      block.id === blockId ? { ...block, content } : block
    );
    setUsedBlocks(updatedBlocks);
    generateBriefText(updatedBlocks);
  };

  const removeBlock = (blockId: string) => {
    const blockToRemove = usedBlocks.find(block => block.id === blockId);
    if (blockToRemove) {
      // Add back to available blocks
      setAvailableBlocks(prev => [...prev, { ...blockToRemove, content: '' }]);

      // Remove from used blocks
      const updatedBlocks = usedBlocks.filter(block => block.id !== blockId);
      setUsedBlocks(updatedBlocks);
      generateBriefText(updatedBlocks);
    }
  };

  const clearAllBlocks = () => {
    setAvailableBlocks(briefBlocks);
    setUsedBlocks([]);
    onBriefChange('');
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-lg font-subheading text-blue-400 mb-2">🏗️ BUILD YOUR BRIEF</h3>
        <p className="text-sm font-body normal-case text-gray-300">
          Drag building blocks from the palette below into the brief area. Fill in each block to
          construct your campaign brief.
        </p>
      </div>

      {/* Brief Construction Area */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`min-h-64 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
          isDraggedOver
            ? 'border-yellow-400 bg-yellow-400/20 scale-105'
            : usedBlocks.length > 0
              ? 'border-yellow-400/30'
              : 'border-gray-600'
        }`}
      >
        {usedBlocks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-subheading text-gray-400 mb-2">Drop brief blocks here</h3>
            <p className="text-sm font-body normal-case text-gray-500">
              Drag building blocks from below to start constructing your brief
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-subheading text-yellow-400">Your Brief Components</h3>
              <button
                onClick={clearAllBlocks}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 px-3 py-1 rounded-full transition-colors font-body normal-case text-red-300"
              >
                Clear All
              </button>
            </div>

            {usedBlocks.map((block, index) => (
              <div
                key={`${block.id}-${index}`}
                className="bg-white/5 border border-white/10 rounded-lg p-4 group hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{block.icon}</span>
                    <h4 className="font-subheading text-white">{block.title}</h4>
                  </div>
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-200 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={block.content}
                  onChange={e => handleBlockContentChange(block.id, e.target.value)}
                  placeholder={block.placeholder}
                  className="w-full bg-transparent border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 font-body normal-case text-sm resize-none focus:outline-none focus:border-yellow-400/50"
                  rows={2}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Building Blocks */}
      <div>
        <h3 className="text-lg font-subheading text-gray-300 mb-4">Available Building Blocks</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableBlocks.map(block => (
            <div
              key={block.id}
              draggable
              onDragStart={e => handleDragStart(e, block)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                  {block.icon}
                </div>
                <div className="text-xs font-subheading text-gray-300 group-hover:text-white transition-colors">
                  {block.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        {availableBlocks.length === 0 && (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm font-body normal-case text-gray-400">
              All building blocks are in use! Great job building your brief.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
