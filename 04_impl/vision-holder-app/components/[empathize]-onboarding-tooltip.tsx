// [empathize] OnboardingTooltip Component
// Provides contextual guidance based on current onboarding step

import React, { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  order: number;
  component: 'roadmap' | 'chat' | 'knowledge' | 'terminal';
  tooltip: string;
  cta: string;
}

interface OnboardingTooltipProps {
  children: React.ReactNode;
  component: 'roadmap' | 'chat' | 'knowledge' | 'terminal';
  userId: string;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  children,
  component,
  userId
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current onboarding step
  useEffect(() => {
    const fetchCurrentStep = async () => {
      try {
        // Get onboarding state
        const stateResponse = await fetch('http://localhost:3002/onboarding/state', {
          headers: { 'x-mock-user': userId }
        });
        const { data: stateData } = await stateResponse.json();

        // If onboarding is complete, don't show tooltips
        if (stateData.completed_at) {
          setCurrentStep(null);
          setLoading(false);
          return;
        }

        // Get all steps
        const stepsResponse = await fetch('http://localhost:3002/onboarding/steps');
        const { data: steps } = await stepsResponse.json();

        // Find current step
        const step = steps.find((s: OnboardingStep) => s.id === stateData.current_step);
        setCurrentStep(step || null);
      } catch (err) {
        console.error('Failed to fetch onboarding step:', err);
        setCurrentStep(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentStep();
  }, [userId]);

  // Don't show tooltip if loading or no current step
  if (loading || !currentStep) {
    return <>{children}</>;
  }

  // Only show tooltip if this component matches the current step
  if (currentStep.component !== component) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-sm"
          aria-label={currentStep.tooltip}
        >
          <div className="text-sm">
            <p className="font-medium mb-1">{currentStep.title}</p>
            <p className="text-gray-500 dark:text-gray-400">{currentStep.tooltip}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OnboardingTooltip; 