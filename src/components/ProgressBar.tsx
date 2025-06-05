import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  isVisible: boolean;
  duration?: number; // in milliseconds
}

const creativeWords = [
  'Cogitating',
  'Ruminating', 
  'Imagining',
  'Inventing',
  'Creating',
  'Conceptualizing',
  'Brainstorming',
  'Ideating',
  'Formulating',
  'Crafting',
  'Dreaming',
  'Innovating',
  'Composing',
  'Designing',
  'Orchestrating',
  'Weaving',
  'Sculpting',
  'Architecting',
  'Manifesting',
  'Synthesizing'
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  isVisible, 
  duration = 15000 // Default 15 seconds
}) => {
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState(creativeWords[0]);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setWordIndex(0);
      setCurrentWord(creativeWords[0]);
      return;
    }

    // Progress animation - slower and more realistic
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) return 85; // Stop at 85% until actual completion
        // Slower increment: reaches 85% over the duration
        return prev + (85 / (duration / 200)); // Update every 200ms, slower progression
      });
    }, 200);

    // Word changing animation
    const wordInterval = setInterval(() => {
      setWordIndex(prev => {
        const newIndex = (prev + 1) % creativeWords.length;
        setCurrentWord(creativeWords[newIndex]);
        return newIndex;
      });
    }, 1500); // Change word every 1.5 seconds

    return () => {
      clearInterval(progressInterval);
      clearInterval(wordInterval);
    };
  }, [isVisible, duration]);

  // Complete the progress when not visible (completion)
  useEffect(() => {
    if (!isVisible && progress > 0) {
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
      }, 500);
    }
  }, [isVisible, progress]);

  if (!isVisible && progress === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-purple-900/90 backdrop-blur-xl border border-purple-400/30 rounded-3xl p-8 shadow-2xl shadow-purple-500/20 max-w-lg w-full mx-4">
        
        {/* Creative Word Display */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🍞🧠</div>
          <h3 className="text-2xl font-headline text-white mb-2">
            BREAD IS THINKING
          </h3>
          <div className="text-xl font-subheading text-purple-300 transition-all duration-500 ease-in-out">
            {currentWord}...
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-purple-800/30 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          {/* Progress Text */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-purple-300 font-body normal-case">
              Generating creative territories...
            </span>
            <span className="text-purple-200 font-body">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Fun Details */}
        <div className="mt-6 text-center">
          <div className="text-xs text-purple-400 font-body normal-case">
            Powered by OpenAI • Creating something amazing
          </div>
        </div>
      </div>
    </div>
  );
};