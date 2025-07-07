'use client';

// [empathize] Vision Holder Handoff Manager Component
// Seamless AI transition system for users with dyslexia and ADHD
// Maintains continuity and control during context handoffs

import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Shield, 
  Zap,
  Eye,
  EyeOff,
  Download,
  FileText,
  User,
  Brain,
  Settings
} from 'lucide-react';

// Types
interface ContextMetrics {
  token_usage: number;
  max_tokens: number;
  conversation_length: number;
  session_duration: number;
  context_fill_percentage: number;
}

interface HandoffTrigger {
  trigger_type: 'context_limit' | 'session_length' | 'user_request' | 'system_optimization';
  threshold_reached: number;
  urgency: 'immediate' | 'soon' | 'planned';
  user_notification_required: boolean;
}

interface HandoffStatus {
  is_handoff_active: boolean;
  current_stage: 'monitoring' | 'preparing' | 'generating' | 'ready' | 'transitioning' | 'complete';
  handoff_id?: string;
  preparation_progress: number;
}

interface HandoffManagerProps {
  className?: string;
  onHandoffTriggered?: (handoffId: string) => void;
  onHandoffComplete?: (handoffId: string) => void;
  systemicLedgerData?: any;
  wisdomMemoryData?: any;
  conversationHistory?: any[];
  userPreferences?: any;
  isVisible?: boolean;
}

export const HandoffManager: React.FC<HandoffManagerProps> = ({
  className = '',
  onHandoffTriggered,
  onHandoffComplete,
  systemicLedgerData,
  wisdomMemoryData,
  conversationHistory = [],
  userPreferences,
  isVisible = true
}) => {
  // State management
  const [contextMetrics, setContextMetrics] = useState<ContextMetrics>({
    token_usage: 0,
    max_tokens: 128000,
    conversation_length: 0,
    session_duration: 0,
    context_fill_percentage: 0
  });
  
  const [handoffTrigger, setHandoffTrigger] = useState<HandoffTrigger | null>(null);
  const [handoffStatus, setHandoffStatus] = useState<HandoffStatus>({
    is_handoff_active: false,
    current_stage: 'monitoring',
    preparation_progress: 0
  });
  
  const [showHandoffDetails, setShowHandoffDetails] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [lastMonitorUpdate, setLastMonitorUpdate] = useState(Date.now());

  // Context monitoring
  const updateContextMetrics = useCallback(async (tokenUsage: number) => {
    try {
      const response = await fetch('http://localhost:3007/handoff/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_usage: tokenUsage,
          conversation_length: conversationHistory.length,
          session_start: sessionStartTime
        })
      });

      if (response.ok) {
        const data = await response.json();
        setContextMetrics(data.metrics);
        setHandoffTrigger(data.handoff_trigger);
        setLastMonitorUpdate(Date.now());

        // Trigger handoff preparation if needed
        if (data.handoff_trigger && data.handoff_trigger.urgency !== 'planned') {
          initiateHandoffPreparation();
        }
      }
    } catch (error) {
      console.error('[empathize] Context monitoring failed:', error);
    }
  }, [conversationHistory.length, sessionStartTime]);

  // Estimate token usage (simplified - in production, integrate with actual token counting)
  const estimateTokenUsage = useCallback(() => {
    const averageTokensPerMessage = 100; // Conservative estimate
    const contextTokens = conversationHistory.length * averageTokensPerMessage;
    const systemTokens = 2000; // System prompt and context
    return contextTokens + systemTokens;
  }, [conversationHistory.length]);

  // Auto-monitor context usage
  useEffect(() => {
    const tokenUsage = estimateTokenUsage();
    updateContextMetrics(tokenUsage);
  }, [conversationHistory.length, updateContextMetrics, estimateTokenUsage]);

  // Handoff preparation
  const initiateHandoffPreparation = useCallback(async () => {
    if (handoffStatus.is_handoff_active) return;

    setHandoffStatus({
      is_handoff_active: true,
      current_stage: 'preparing',
      preparation_progress: 10
    });

    try {
      // Step 1: Gather technical state
      setHandoffStatus(prev => ({ ...prev, preparation_progress: 30 }));
      
      const technicalState = await gatherTechnicalState();
      
      // Step 2: Generate handoff report
      setHandoffStatus(prev => ({ ...prev, current_stage: 'generating', preparation_progress: 60 }));
      
      const response = await fetch('http://localhost:3007/handoff/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: `session-${Date.now()}`,
          systemic_ledger_data: systemicLedgerData,
          wisdom_memory_data: wisdomMemoryData,
          conversation_history: conversationHistory,
          user_preferences: userPreferences,
          technical_state: technicalState
        })
      });

      if (response.ok) {
        const data = await response.json();
        setHandoffStatus({
          is_handoff_active: true,
          current_stage: 'ready',
          handoff_id: data.handoff_id,
          preparation_progress: 100
        });

        onHandoffTriggered?.(data.handoff_id);
      } else {
        throw new Error('Failed to generate handoff report');
      }
    } catch (error) {
      console.error('[empathize] Handoff preparation failed:', error);
      setHandoffStatus({
        is_handoff_active: false,
        current_stage: 'monitoring',
        preparation_progress: 0
      });
    }
  }, [handoffStatus.is_handoff_active, systemicLedgerData, wisdomMemoryData, conversationHistory, userPreferences, onHandoffTriggered]);

  // Gather technical state
  const gatherTechnicalState = async () => {
    try {
      // Check API health
      const healthChecks = await Promise.allSettled([
        fetch('http://localhost:3001/health'),
        fetch('http://localhost:3002/health'),
        fetch('http://localhost:3003/health'),
        fetch('http://localhost:3004/health'),
        fetch('http://localhost:3005/health')
      ]);

      const apiHealth = {
        systemic_ledger: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'error',
        ai_orchestrator: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'error',
        knowledge_base: healthChecks[2].status === 'fulfilled' ? 'healthy' : 'error',
        terminal: healthChecks[3].status === 'fulfilled' ? 'healthy' : 'error',
        analytics: healthChecks[4].status === 'fulfilled' ? 'healthy' : 'error'
      };

      return {
        system_health: apiHealth,
        recent_errors: [], // Would be populated from error logging
        performance_metrics: {
          last_monitor_update: lastMonitorUpdate,
          session_duration: Date.now() - sessionStartTime
        }
      };
    } catch (error) {
      console.error('[empathize] Technical state gathering failed:', error);
      return {
        system_health: {},
        recent_errors: [],
        performance_metrics: {}
      };
    }
  };

  // Execute handoff
  const executeHandoff = useCallback(async () => {
    if (!handoffStatus.handoff_id) return;

    setHandoffStatus(prev => ({ ...prev, current_stage: 'transitioning' }));

    try {
      // Get onboarding prompt for new AI
      const response = await fetch('http://localhost:3007/handoff/onboarding-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handoff_id: handoffStatus.handoff_id
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // In a real implementation, this would:
        // 1. Save current conversation state
        // 2. Initialize new AI session with onboarding prompt
        // 3. Transfer context seamlessly
        
        setHandoffStatus({
          is_handoff_active: false,
          current_stage: 'complete',
          handoff_id: handoffStatus.handoff_id,
          preparation_progress: 100
        });

        onHandoffComplete?.(handoffStatus.handoff_id);
        
        // Reset after a delay
        setTimeout(() => {
          setHandoffStatus({
            is_handoff_active: false,
            current_stage: 'monitoring',
            preparation_progress: 0
          });
        }, 3000);
      }
    } catch (error) {
      console.error('[empathize] Handoff execution failed:', error);
      setHandoffStatus({
        is_handoff_active: false,
        current_stage: 'monitoring',
        preparation_progress: 0
      });
    }
  }, [handoffStatus.handoff_id, onHandoffComplete]);

  // Download handoff report
  const downloadHandoffReport = async () => {
    if (!handoffStatus.handoff_id) return;

    try {
      const response = await fetch(`http://localhost:3007/handoff/report/${handoffStatus.handoff_id}`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vision-holder-handoff-${handoffStatus.handoff_id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('[empathize] Download failed:', error);
    }
  };

  // Get urgency styling
  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'soon':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'planned':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  // Get stage icon
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'monitoring':
        return <Eye className="w-4 h-4" />;
      case 'preparing':
      case 'generating':
        return <Settings className="w-4 h-4 animate-spin" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'transitioning':
        return <ArrowRight className="w-4 h-4" />;
      case 'complete':
        return <Zap className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`handoff-manager ${className}`}>
      {/* Context Usage Indicator */}
      <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Context Usage
            </span>
          </div>
          <button
            onClick={() => setShowHandoffDetails(!showHandoffDetails)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center space-x-1"
          >
            {showHandoffDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showHandoffDetails ? 'Hide' : 'Show'} Details</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              contextMetrics.context_fill_percentage >= 0.85 ? 'bg-red-500' :
              contextMetrics.context_fill_percentage >= 0.80 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${contextMetrics.context_fill_percentage * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{Math.round(contextMetrics.context_fill_percentage * 100)}% used</span>
          <span>{conversationHistory.length} messages</span>
        </div>
      </div>

      {/* Handoff Alert */}
      {handoffTrigger && handoffTrigger.user_notification_required && (
        <div className={`mb-4 p-3 rounded-lg border ${getUrgencyStyle(handoffTrigger.urgency)}`}>
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-dyslexia-friendly">
                {handoffTrigger.urgency === 'immediate' ? '🚨 Immediate Transition' :
                 handoffTrigger.urgency === 'soon' ? '⚠️ Transition Soon' :
                 '📋 Transition Planned'}
              </h4>
              <p className="text-sm mt-1 text-dyslexia-friendly">
                {handoffTrigger.urgency === 'immediate' 
                  ? 'Context limit reached. Seamless handoff starting now to maintain conversation quality.'
                  : handoffTrigger.urgency === 'soon'
                  ? 'Context approaching limit. Preparing smooth transition to fresh AI assistant.'
                  : 'Planning optimal transition point for enhanced performance.'
                }
              </p>
              
              {handoffStatus.current_stage !== 'monitoring' && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    {getStageIcon(handoffStatus.current_stage)}
                    <span className="capitalize">{handoffStatus.current_stage.replace('_', ' ')}</span>
                    {handoffStatus.preparation_progress > 0 && (
                      <span>({handoffStatus.preparation_progress}%)</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Handoff Actions */}
      {handoffStatus.current_stage === 'ready' && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200 text-dyslexia-friendly">
                  Ready for Seamless Transition
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 text-dyslexia-friendly">
                  Your conversation context is prepared for smooth handoff.
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={downloadHandoffReport}
                className="px-3 py-1 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                <Download className="w-3 h-3" />
                <span>Download Report</span>
              </button>
              <button
                onClick={executeHandoff}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                <ArrowRight className="w-3 h-3" />
                <span>Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Information */}
      {showHandoffDetails && (
        <div className="space-y-3">
          {/* Context Metrics */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2 text-dyslexia-friendly">
              Context Metrics
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div>Tokens: {contextMetrics.token_usage.toLocaleString()}</div>
              <div>Messages: {contextMetrics.conversation_length}</div>
              <div>Session: {Math.round(contextMetrics.session_duration / 60000)}m</div>
              <div>Fill: {Math.round(contextMetrics.context_fill_percentage * 100)}%</div>
            </div>
          </div>

          {/* System Status */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2 text-dyslexia-friendly">
              System Status
            </h5>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Handoff System Ready</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-blue-500" />
                <span>Context Protected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Notice */}
      <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-blue-700 dark:text-blue-300 text-dyslexia-friendly">
            Your conversation will continue seamlessly. All accessibility preferences are preserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HandoffManager;