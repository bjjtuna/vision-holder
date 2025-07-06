// [empathize] Analytics Service
// Tracks user interactions and accessibility patterns for users with dyslexia/ADHD

export interface UserInteraction {
  id: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  action: string;
  component: string;
  duration?: number;
  errors?: string[];
  accessibilityFeatures: {
    voiceInput: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
    screenReader: boolean;
  };
  performance: {
    loadTime: number;
    responseTime: number;
    memoryUsage?: number;
  };
}

export interface AccessibilityEvent {
  id: string;
  timestamp: string;
  sessionId: string;
  feature: string;
  success: boolean;
  errorMessage?: string;
  timeToComplete: number;
  attempts: number;
}

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  sessionId: string;
  metric: string;
  value: number;
  unit: string;
}

class AnalyticsService {
  private sessionId: string;
  private interactions: UserInteraction[] = [];
  private accessibilityEvents: AccessibilityEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private sessionStart: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics(): void {
    // Track page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.trackPerformance('pageLoad', performance.now(), 'ms');
      });

      // Track accessibility features
      this.detectAccessibilityFeatures();

      // Track errors
      window.addEventListener('error', (event) => {
        this.trackError('javascript', event.error?.message || 'Unknown error');
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.trackError('promise', event.reason?.message || 'Unhandled promise rejection');
      });
    }
  }

  private detectAccessibilityFeatures(): void {
    const features = {
      voiceInput: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      fontSize: this.getFontSizePreference(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      screenReader: this.detectScreenReader()
    };

    // Store accessibility features for this session
    localStorage.setItem('accessibilityFeatures', JSON.stringify(features));
  }

  private getFontSizePreference(): 'small' | 'medium' | 'large' {
    const fontSize = getComputedStyle(document.documentElement).fontSize;
    const size = parseInt(fontSize);
    
    if (size < 14) return 'small';
    if (size > 18) return 'large';
    return 'medium';
  }

  private detectScreenReader(): boolean {
    // Simple screen reader detection
    const ariaLive = document.querySelector('[aria-live]');
    const screenReaderText = document.querySelector('.sr-only, .screen-reader-only');
    return !!(ariaLive || screenReaderText);
  }

  public trackInteraction(
    action: string,
    component: string,
    duration?: number,
    errors?: string[]
  ): void {
    const interaction: UserInteraction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      action,
      component,
      duration,
      errors,
      accessibilityFeatures: JSON.parse(localStorage.getItem('accessibilityFeatures') || '{}'),
      performance: {
        loadTime: performance.now(),
        responseTime: duration || 0
      }
    };

    this.interactions.push(interaction);
    this.sendToAnalytics('interaction', interaction);
  }

  public trackAccessibilityEvent(
    feature: string,
    success: boolean,
    timeToComplete: number,
    attempts: number = 1,
    errorMessage?: string
  ): void {
    const event: AccessibilityEvent = {
      id: `accessibility_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      feature,
      success,
      errorMessage,
      timeToComplete,
      attempts
    };

    this.accessibilityEvents.push(event);
    this.sendToAnalytics('accessibility', event);
  }

  public trackPerformance(metric: string, value: number, unit: string): void {
    const performanceMetric: PerformanceMetric = {
      id: `performance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metric,
      value,
      unit
    };

    this.performanceMetrics.push(performanceMetric);
    this.sendToAnalytics('performance', performanceMetric);
  }

  public trackError(type: string, message: string): void {
    this.trackInteraction('error', type, undefined, [message]);
  }

  public trackVoiceInput(success: boolean, duration: number, error?: string): void {
    this.trackAccessibilityEvent('voiceInput', success, duration, 1, error);
  }

  public trackFileUpload(success: boolean, fileSize: number, duration: number, error?: string): void {
    this.trackAccessibilityEvent('fileUpload', success, duration, 1, error);
    this.trackPerformance('fileUploadSize', fileSize, 'bytes');
    this.trackPerformance('fileUploadTime', duration, 'ms');
  }

  public trackNavigation(from: string, to: string, duration: number): void {
    this.trackInteraction('navigation', `${from}->${to}`, duration);
  }

  public trackOnboardingStep(step: number, completed: boolean, duration: number): void {
    this.trackAccessibilityEvent(`onboarding_step_${step}`, completed, duration);
  }

  public getSessionStats(): {
    sessionDuration: number;
    totalInteractions: number;
    accessibilityEvents: number;
    errors: number;
    averageResponseTime: number;
  } {
    const sessionDuration = Date.now() - this.sessionStart;
    const totalInteractions = this.interactions.length;
    const accessibilityEvents = this.accessibilityEvents.length;
    const errors = this.interactions.filter(i => i.errors && i.errors.length > 0).length;
    const averageResponseTime = this.interactions.length > 0 
      ? this.interactions.reduce((sum, i) => sum + (i.duration || 0), 0) / this.interactions.length
      : 0;

    return {
      sessionDuration,
      totalInteractions,
      accessibilityEvents,
      errors,
      averageResponseTime
    };
  }

  public getAccessibilityReport(): {
    voiceInputUsage: number;
    voiceInputSuccess: number;
    averageCompletionTime: number;
    commonErrors: string[];
  } {
    const voiceEvents = this.accessibilityEvents.filter(e => e.feature === 'voiceInput');
    const voiceInputUsage = voiceEvents.length;
    const voiceInputSuccess = voiceEvents.filter(e => e.success).length;
    const averageCompletionTime = voiceEvents.length > 0
      ? voiceEvents.reduce((sum, e) => sum + e.timeToComplete, 0) / voiceEvents.length
      : 0;
    
    const allErrors = this.interactions
      .flatMap(i => i.errors || [])
      .filter(error => error);
    
    const errorCounts = allErrors.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error]) => error);

    return {
      voiceInputUsage,
      voiceInputSuccess,
      averageCompletionTime,
      commonErrors
    };
  }

  private async sendToAnalytics(type: string, data: any): Promise<void> {
    try {
      // Send to analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Store locally if network fails
      this.storeLocally(type, data);
    }
  }

  private storeLocally(type: string, data: any): void {
    const key = `analytics_${type}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(data));
    
    // Clean up old entries (keep last 100)
    const keys = Object.keys(localStorage).filter(k => k.startsWith('analytics_'));
    if (keys.length > 100) {
      keys.slice(0, keys.length - 100).forEach(k => localStorage.removeItem(k));
    }
  }

  public exportSessionData(): {
    sessionId: string;
    interactions: UserInteraction[];
    accessibilityEvents: AccessibilityEvent[];
    performanceMetrics: PerformanceMetric[];
    stats: ReturnType<typeof this.getSessionStats>;
    accessibilityReport: ReturnType<typeof this.getAccessibilityReport>;
  } {
    return {
      sessionId: this.sessionId,
      interactions: this.interactions,
      accessibilityEvents: this.accessibilityEvents,
      performanceMetrics: this.performanceMetrics,
      stats: this.getSessionStats(),
      accessibilityReport: this.getAccessibilityReport()
    };
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Export for use in components
export default analyticsService; 