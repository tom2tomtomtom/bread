import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: () => void;
  actionLabel?: string;
  completed?: boolean;
}

interface UserOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Welcome to BREAD, ${user?.name?.split(' ')[0] || 'there'}! 🎉`,
      description: 'BREAD is your AI-powered creative platform for generating advertising territories and headlines. Let\'s get you started with a quick tour.',
      icon: '👋',
    },
    {
      id: 'plan',
      title: 'Your Plan & Usage',
      description: `You're on the ${user?.plan?.toUpperCase()} plan. This gives you access to powerful AI tools for creative content generation.`,
      icon: '📊',
      action: () => {
        // Could open usage stats or plan details
        setCompletedSteps(prev => new Set([...prev, 'plan']));
      },
      actionLabel: 'View Usage Stats',
    },
    {
      id: 'features',
      title: 'Key Features',
      description: 'BREAD offers enhanced brief intelligence, territory evolution, and AI-powered content generation. Each feature is designed to boost your creative workflow.',
      icon: '🚀',
    },
    {
      id: 'brief-intelligence',
      title: 'Brief Intelligence',
      description: 'Get real-time analysis of your creative briefs with scoring, suggestions, and Australian market insights.',
      icon: '🧠',
      action: () => {
        // Could highlight the brief analyzer
        setCompletedSteps(prev => new Set([...prev, 'brief-intelligence']));
      },
      actionLabel: 'Try Brief Analyzer',
    },
    {
      id: 'territory-evolution',
      title: 'Territory Evolution',
      description: 'Evolve your creative territories with AI-powered suggestions and performance predictions.',
      icon: '🧬',
      action: () => {
        // Could highlight the territory evolver
        setCompletedSteps(prev => new Set([...prev, 'territory-evolution']));
      },
      actionLabel: 'Explore Evolution',
    },
    {
      id: 'ready',
      title: 'You\'re All Set!',
      description: 'You\'re ready to start creating amazing advertising content with BREAD. Remember, you can always access help and documentation from the menu.',
      icon: '✨',
    },
  ];

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepAction = () => {
    if (currentStepData.action) {
      currentStepData.action();
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  // Auto-advance welcome step after 3 seconds
  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        setCurrentStep(1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/70 text-sm">Getting Started</span>
            <span className="text-white/70 text-sm">
              {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="backdrop-blur-xl bg-yellow-400/10 border border-yellow-400/20 rounded-3xl p-8 shadow-2xl">
          {/* Step Icon */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{currentStepData.icon}</div>
            <h2 className="text-2xl font-subheading text-yellow-400 drop-shadow-lg mb-3">
              {currentStepData.title}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-lg mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Action */}
          {currentStepData.action && currentStepData.actionLabel && (
            <div className="text-center mb-6">
              <button
                onClick={handleStepAction}
                className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-white font-medium transition-all"
              >
                {currentStepData.actionLabel}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/80 hover:text-white transition-all"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              {!isLastStep && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-white/60 hover:text-white/80 transition-colors"
                >
                  Skip Tour
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-lg"
              >
                {isLastStep ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-yellow-400 scale-125'
                    : index < currentStep
                    ? 'bg-yellow-400/60'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Hook to manage onboarding state
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Show onboarding for new users
    if (isAuthenticated && user) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding-${user.id}`);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, user]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding-${user.id}`, 'completed');
    }
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding-${user.id}`, 'skipped');
    }
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    completeOnboarding,
    skipOnboarding,
    startOnboarding: () => setShowOnboarding(true),
  };
};
