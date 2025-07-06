'use client';

// [delight] Onboarding Wizard Component
// Step-by-step introduction to Vision Holder for new users

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Map, 
  MessageCircle, 
  Target, 
  Building, 
  BookOpen, 
  Sword, 
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  ArrowRight
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  actionText?: string;
  actionHandler?: () => void;
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onComplete,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('vision-holder-onboarding-completed');
    if (hasCompletedOnboarding === 'true') {
      onComplete();
    }
  }, [onComplete]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Vision Holder',
      description: 'Your AI-powered coding assistant for neurodiverse developers',
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Brain className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
              Welcome to Vision Holder
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
              We're here to help you build amazing projects with structure, clarity, and confidence.
            </p>
          </div>
          
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2 text-dyslexia-friendly">
              What makes Vision Holder special?
            </h3>
            <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-200 text-dyslexia-friendly">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Designed specifically for users with ADHD and dyslexia
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Clear, step-by-step project structure
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                AI assistance that adapts to your thinking style
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                You always maintain control over your projects
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'roadmap',
      title: 'Visual Roadmap',
      description: 'See your project structure at a glance',
      icon: Map,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Map className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
              Visual Roadmap
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
              Organize your project with our 5-level hierarchy system.
            </p>
          </div>
          
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Target className="w-6 h-6 text-red-500" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Mission</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">Your main goal and vision</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Building className="w-6 h-6 text-blue-500" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Pillars</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">Core principles that guide your work</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-500" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Epics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">Large-scale features or themes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Sword className="w-6 h-6 text-purple-500" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Sagas</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">Concrete projects with clear goals</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Search className="w-6 h-6 text-orange-500" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Probes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">Focused experiments and tests</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'chat',
      title: 'Co-Vision Chat',
      description: 'Talk to your AI assistant with voice and files',
      icon: MessageCircle,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
              Co-Vision Chat
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
              Your AI assistant is here to help you think through problems and plan your projects.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 text-dyslexia-friendly">
                Voice Input
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200 text-dyslexia-friendly">
                Speak naturally instead of typing. Perfect for users with dyslexia or those who think better out loud.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-dyslexia-friendly">
                File Uploads
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 text-dyslexia-friendly">
                Share documents, code, or images to get more specific help with your projects.
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 text-dyslexia-friendly">
                Context-Aware
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200 text-dyslexia-friendly">
                The AI remembers your project context and provides relevant, personalized assistance.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Ready to begin your first project?',
      icon: ArrowRight,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <ArrowRight className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
              You're All Set!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
              Let's start building something amazing together.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
              Next Steps:
            </h3>
            <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300 text-dyslexia-friendly">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Start with the Roadmap tab to create your first mission</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>Use the Chat tab to discuss your ideas with the AI assistant</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>Check the Terminal tab to monitor your system status</span>
              </li>
            </ol>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
              You can always access this tutorial again from the settings menu.
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(currentStepData.id);
      return newSet;
    });
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      localStorage.setItem('vision-holder-onboarding-completed', 'true');
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('vision-holder-onboarding-completed', 'true');
    onComplete();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white text-dyslexia-friendly">
              {currentStepData.title}
            </h1>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Skip tutorial"
            aria-label="Skip tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span className="text-dyslexia-friendly">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-dyslexia-friendly">{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label={`Onboarding progress: Step ${currentStep + 1} of ${steps.length}`}>
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-dyslexia-friendly"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep 
                    ? 'bg-primary-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly font-medium"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Get Started
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard; 