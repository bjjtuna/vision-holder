// [empathize] Vision Holder Handoff API
// Seamless context transfer system for AI Vision Holder transitions
// Designed for users with dyslexia and ADHD who need continuity and control

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { setupSecurityMiddleware } from './[safeguard]-security-middleware';

// Types for handoff system
interface ContextMetrics {
  token_usage: number;
  max_tokens: number;
  conversation_length: number;
  session_duration: number;
  context_fill_percentage: number;
}

interface UserProfile {
  communication_style: 'visual' | 'text' | 'voice' | 'mixed';
  detail_level: 'high' | 'medium' | 'low';
  learning_pace: 'fast' | 'moderate' | 'slow';
  accessibility_needs: string[];
  preferred_feedback: string[];
  cognitive_patterns: {
    attention_span: 'short' | 'medium' | 'long';
    information_processing: 'sequential' | 'simultaneous' | 'mixed';
    working_memory_support: boolean;
    visual_processing_preference: boolean;
  };
}

interface ProjectContext {
  current_mission: any;
  active_pillars: any[];
  current_epics: any[];
  active_sagas: any[];
  recent_probes: any[];
  recent_decisions: any[];
  current_blockers: any[];
  technical_state: {
    api_health: Record<string, string>;
    recent_changes: any[];
    pending_tasks: any[];
  };
}

interface ConversationHistory {
  recent_messages?: any[];
  recent_summary?: string;
  current_topic?: string;
  last_user_request?: string;
  key_decisions?: any[];
  pending_questions?: string[];
  user_requests?: any[];
  ai_commitments?: any[];
  conversation_themes?: string[];
}

interface WisdomInsights {
  user_patterns: any[];
  successful_interactions: any[];
  learning_preferences: any[];
  effective_strategies: any[];
  trigger_contexts: Record<string, any>;
}

interface HandoffReport {
  id: string;
  timestamp: string;
  previous_ai_session_id: string;
  context_metrics: ContextMetrics;
  executive_summary: {
    current_phase: string;
    immediate_priorities: string[];
    urgent_items: any[];
    next_steps: string[];
  };
  user_profile: UserProfile;
  project_context: ProjectContext;
  conversation_history: ConversationHistory;
  wisdom_insights: WisdomInsights;
  technical_state: {
    system_health: Record<string, any>;
    recent_errors: any[];
    performance_metrics: any;
  };
  transition_notes: {
    handoff_reason: string;
    context_preservation_priority: string[];
    user_experience_notes: string[];
    continuation_guidance: string[];
  };
}

interface HandoffTrigger {
  trigger_type: 'context_limit' | 'session_length' | 'user_request' | 'system_optimization';
  threshold_reached: number;
  urgency: 'immediate' | 'soon' | 'planned';
  user_notification_required: boolean;
}

// Initialize Express app
const app = express();
const port = 3007;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
setupSecurityMiddleware(app);

// In-memory storage (production would use persistent storage)
let handoffReports: HandoffReport[] = [];

// Context monitoring and detection
class ContextMonitor {
  private static instance: ContextMonitor;
  private currentMetrics: ContextMetrics;
  private thresholds = {
    context_warning: 0.80,  // 80% context usage
    context_critical: 0.85, // 85% triggers handoff preparation
    context_emergency: 0.95, // 95% forces immediate handoff
    session_duration_max: 3600000, // 1 hour max session
    conversation_length_max: 100 // 100 messages
  };

  private constructor() {
    this.currentMetrics = {
      token_usage: 0,
      max_tokens: 128000, // Default for GPT-4
      conversation_length: 0,
      session_duration: 0,
      context_fill_percentage: 0
    };
  }

  static getInstance(): ContextMonitor {
    if (!ContextMonitor.instance) {
      ContextMonitor.instance = new ContextMonitor();
    }
    return ContextMonitor.instance;
  }

  updateMetrics(tokenUsage: number, conversationLength: number, sessionStart: number): ContextMetrics {
    this.currentMetrics.token_usage = tokenUsage;
    this.currentMetrics.conversation_length = conversationLength;
    this.currentMetrics.session_duration = Date.now() - sessionStart;
    this.currentMetrics.context_fill_percentage = tokenUsage / this.currentMetrics.max_tokens;

    return this.currentMetrics;
  }

  checkHandoffTriggers(): HandoffTrigger | null {
    const metrics = this.currentMetrics;

    // Emergency handoff (immediate)
    if (metrics.context_fill_percentage >= this.thresholds.context_emergency) {
      return {
        trigger_type: 'context_limit',
        threshold_reached: metrics.context_fill_percentage,
        urgency: 'immediate',
        user_notification_required: true
      };
    }

    // Critical handoff (should happen soon)
    if (metrics.context_fill_percentage >= this.thresholds.context_critical) {
      return {
        trigger_type: 'context_limit',
        threshold_reached: metrics.context_fill_percentage,
        urgency: 'soon',
        user_notification_required: true
      };
    }

    // Warning level (prepare for handoff)
    if (metrics.context_fill_percentage >= this.thresholds.context_warning) {
      return {
        trigger_type: 'context_limit',
        threshold_reached: metrics.context_fill_percentage,
        urgency: 'planned',
        user_notification_required: false
      };
    }

    // Session duration check
    if (metrics.session_duration >= this.thresholds.session_duration_max) {
      return {
        trigger_type: 'session_length',
        threshold_reached: metrics.session_duration / this.thresholds.session_duration_max,
        urgency: 'soon',
        user_notification_required: true
      };
    }

    // Conversation length check
    if (metrics.conversation_length >= this.thresholds.conversation_length_max) {
      return {
        trigger_type: 'session_length',
        threshold_reached: metrics.conversation_length / this.thresholds.conversation_length_max,
        urgency: 'planned',
        user_notification_required: false
      };
    }

    return null;
  }

  getMetrics(): ContextMetrics {
    return { ...this.currentMetrics };
  }
}

// Handoff report generator
class HandoffReportGenerator {
  async generateReport(
    sessionId: string,
    systemicLedgerData: any,
    wisdomMemoryData: any,
    conversationHistory: any[],
    userPreferences: any,
    technicalState: any
  ): Promise<HandoffReport> {
    const contextMonitor = ContextMonitor.getInstance();
    const currentMetrics = contextMonitor.getMetrics();
    
    const report: HandoffReport = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      previous_ai_session_id: sessionId,
      context_metrics: currentMetrics,
      
      executive_summary: {
        current_phase: this.extractCurrentPhase(systemicLedgerData),
        immediate_priorities: this.extractImmediatePriorities(systemicLedgerData),
        urgent_items: this.extractUrgentItems(systemicLedgerData),
        next_steps: this.extractNextSteps(systemicLedgerData, conversationHistory)
      },
      
      user_profile: {
        communication_style: userPreferences.communication_style || 'mixed',
        detail_level: userPreferences.detail_level || 'medium',
        learning_pace: userPreferences.learning_pace || 'moderate',
        accessibility_needs: userPreferences.accessibility_needs || [],
        preferred_feedback: userPreferences.preferred_feedback || [],
        cognitive_patterns: {
          attention_span: userPreferences.attention_span || 'medium',
          information_processing: userPreferences.information_processing || 'mixed',
          working_memory_support: userPreferences.working_memory_support || true,
          visual_processing_preference: userPreferences.visual_processing_preference || true
        }
      },
      
      project_context: {
        current_mission: systemicLedgerData.mission,
        active_pillars: systemicLedgerData.pillars || [],
        current_epics: systemicLedgerData.epics || [],
        active_sagas: systemicLedgerData.sagas?.filter((s: any) => s.status === 'active') || [],
        recent_probes: systemicLedgerData.probes?.filter((p: any) => !this.isExpired(p.expiration)) || [],
        recent_decisions: this.extractRecentDecisions(conversationHistory),
        current_blockers: this.extractBlockers(systemicLedgerData),
        technical_state: technicalState
      },
      
      conversation_history: {
        // Only store minimal recent context - full history is in knowledge base
        recent_summary: await this.generateConversationSummary(conversationHistory.slice(-10)),
        current_topic: this.extractCurrentTopic(conversationHistory.slice(-5)),
        last_user_request: this.extractLastUserRequest(conversationHistory),
        pending_questions: this.extractPendingQuestions(conversationHistory.slice(-5)),
        ai_commitments: this.extractAICommitments(conversationHistory.slice(-5)),
        conversation_themes: this.extractConversationThemes(conversationHistory.slice(-10))
      },
      
      wisdom_insights: {
        user_patterns: wisdomMemoryData.patterns || [],
        successful_interactions: wisdomMemoryData.successful_interactions || [],
        learning_preferences: wisdomMemoryData.learning_preferences || [],
        effective_strategies: wisdomMemoryData.effective_strategies || [],
        trigger_contexts: wisdomMemoryData.trigger_contexts || {}
      },
      
      technical_state: {
        system_health: technicalState.system_health || {},
        recent_errors: technicalState.recent_errors || [],
        performance_metrics: technicalState.performance_metrics || {}
      },
      
      transition_notes: {
        handoff_reason: this.determineHandoffReason(currentMetrics),
        context_preservation_priority: [
          'Current user request and context',
          'Active project priorities',
          'User communication preferences',
          'Recent decisions and commitments',
          'Accessibility accommodations'
        ],
        user_experience_notes: [
          'User has dyslexia - use clear, visual communication',
          'User has ADHD - maintain focus and minimize overwhelm',
          'Preserve sense of continuity and control',
          'Respect established communication patterns'
        ],
        continuation_guidance: this.generateContinuationGuidance(conversationHistory, userPreferences)
      }
    };

    return report;
  }

  private extractCurrentPhase(systemicLedgerData: any): string {
    if (systemicLedgerData.mission) {
      return `Mission: ${systemicLedgerData.mission.content || 'Active operational phase'}`;
    }
    return 'Project initialization phase';
  }

  private extractImmediatePriorities(systemicLedgerData: any): string[] {
    const priorities: string[] = [];
    
    // Active sagas with high priority
    const activeSagas = systemicLedgerData.sagas?.filter((s: any) => 
      s.status === 'active' && s.priority === 'high'
    ) || [];
    
    activeSagas.forEach((saga: any) => {
      priorities.push(`SAGA: ${saga.content}`);
    });

    // Blocked items that need attention
    const blockedItems = systemicLedgerData.entries?.filter((e: any) => 
      e.status === 'blocked'
    ) || [];
    
    blockedItems.forEach((item: any) => {
      priorities.push(`BLOCKED: ${item.content}`);
    });

    return priorities;
  }

  private extractUrgentItems(systemicLedgerData: any): any[] {
    return systemicLedgerData.entries?.filter((entry: any) => 
      entry.priority === 'critical' || 
      (entry.priority === 'high' && entry.status === 'blocked')
    ) || [];
  }

  private extractNextSteps(systemicLedgerData: any, conversationHistory: any[]): string[] {
    const nextSteps: string[] = [];
    
    // From recent conversation
    const recentMessages = conversationHistory.slice(-5);
    recentMessages.forEach(msg => {
      if (msg.type === 'user' && msg.content.toLowerCase().includes('next')) {
        nextSteps.push(`User requested: ${msg.content}`);
      }
    });

    // From active sagas
    const activeSagas = systemicLedgerData.sagas?.filter((s: any) => s.status === 'active') || [];
    activeSagas.slice(0, 3).forEach((saga: any) => {
      nextSteps.push(`Continue: ${saga.content}`);
    });

    return nextSteps;
  }

  private extractRecentDecisions(conversationHistory: any[]): any[] {
    return conversationHistory
      .filter(msg => 
        msg.type === 'ai' && 
        (msg.content.includes('decision') || msg.content.includes('decided') || msg.content.includes('chosen'))
      )
      .slice(-5);
  }

  private extractBlockers(systemicLedgerData: any): any[] {
    return systemicLedgerData.entries?.filter((entry: any) => 
      entry.status === 'blocked' || entry.content.toLowerCase().includes('blocker')
    ) || [];
  }


  private extractAICommitments(conversationHistory: any[]): any[] {
    return conversationHistory
      .filter(msg => 
        msg.type === 'ai' && 
        (msg.content.toLowerCase().includes('i will') || 
         msg.content.toLowerCase().includes('i\'ll') ||
         msg.content.toLowerCase().includes('next, i'))
      )
      .slice(-10);
  }

  private extractConversationThemes(conversationHistory: any[]): string[] {
    const themes = new Set<string>();
    conversationHistory.slice(-20).forEach(msg => {
      // Simple keyword extraction for themes
      const keywords = ['accessibility', 'dyslexia', 'adhd', 'vision holder', 'systemic', 'handoff', 'ai', 'user interface', 'backend', 'frontend'];
      keywords.forEach(keyword => {
        if (msg.content.toLowerCase().includes(keyword)) {
          themes.add(keyword);
        }
      });
    });
    return Array.from(themes);
  }

  private isExpired(expiration: string): boolean {
    return new Date(expiration) < new Date();
  }

  private determineHandoffReason(metrics: ContextMetrics): string {
    if (metrics.context_fill_percentage >= 0.95) {
      return 'Emergency context limit reached - immediate handoff required';
    } else if (metrics.context_fill_percentage >= 0.85) {
      return 'Context limit approaching - planned handoff for optimal performance';
    } else if (metrics.session_duration >= 3600000) {
      return 'Session duration limit reached - fresh context recommended';
    } else {
      return 'Proactive handoff for optimal user experience';
    }
  }

  // NEW: Generate conversation summary instead of full history
  private async generateConversationSummary(recentMessages: any[]): Promise<string> {
    try {
      const messages = recentMessages.slice(-10); // Last 10 messages only
      const userMessages = messages.filter(m => m.type === 'user').map(m => m.content).join(' | ');
      const aiMessages = messages.filter(m => m.type === 'ai').map(m => m.content.slice(0, 50)).join(' | ');
      
      return `Recent conversation: User topics: ${userMessages.slice(0, 200)}... AI responses: ${aiMessages.slice(0, 200)}...`;
    } catch (error) {
      return 'Unable to generate conversation summary';
    }
  }

  // NEW: Extract current topic from recent messages
  private extractCurrentTopic(recentMessages: any[]): string {
    const lastUserMessage = recentMessages.filter(m => m.type === 'user').slice(-1)[0];
    if (lastUserMessage) {
      return `User is currently discussing: ${lastUserMessage.content.slice(0, 100)}...`;
    }
    return 'General conversation';
  }

  // NEW: Get last user request specifically
  private extractLastUserRequest(conversationHistory: any[]): string {
    const lastUserMessage = conversationHistory.filter(m => m.type === 'user').slice(-1)[0];
    return lastUserMessage ? lastUserMessage.content.slice(0, 200) : 'No recent request';
  }

  // NEW: Context retrieval from knowledge base
  private async getRelevantContextFromKnowledgeBase(userMessage: string): Promise<any> {
    try {
      // Search knowledge base for relevant chat sessions
      const searchResponse = await fetch(`http://localhost:3003/knowledge/search?q=${encodeURIComponent(userMessage)}&type=all&limit=3`);
      const searchData = await searchResponse.json();
      
      if (searchData.documents && searchData.documents.length > 0) {
        return {
          relevant_sessions: searchData.documents.slice(0, 3).map((doc: any) => ({
            summary: doc.ai_analysis?.summary || 'Chat session',
            key_points: doc.ai_analysis?.key_points?.slice(0, 3) || [],
            relevance_score: doc.ai_analysis?.relevance_score || 0
          })),
          total_relevant_sessions: searchData.total
        };
      }
      
      return { relevant_sessions: [], total_relevant_sessions: 0 };
    } catch (error) {
      console.error('[empathize] Knowledge base retrieval failed:', error);
      return { relevant_sessions: [], total_relevant_sessions: 0 };
    }
  }

  private generateContinuationGuidance(conversationHistory: any[], userPreferences: any): string[] {
    const guidance: string[] = [];
    
    // User communication style guidance
    if (userPreferences.communication_style === 'visual') {
      guidance.push('Use visual descriptions and structure responses clearly');
    }
    if (userPreferences.detail_level === 'low') {
      guidance.push('Keep responses concise and focused');
    }
    if (userPreferences.learning_pace === 'slow') {
      guidance.push('Allow time for processing and confirmation');
    }

    // Recent conversation context
    const lastUserMessage = conversationHistory.filter(m => m.type === 'user').slice(-1)[0];
    if (lastUserMessage) {
      guidance.push(`Continue from user's last request: "${lastUserMessage.content.slice(0, 100)}"`);
    }

    guidance.push('Maintain the same helpful, empathetic tone');
    guidance.push('Acknowledge the seamless transition to build trust');
    guidance.push('Use knowledge base to retrieve relevant conversation history when needed');
    
    return guidance;
  }
}

// API Routes

// Monitor context usage
app.post('/handoff/monitor', async (req, res) => {
  try {
    const { token_usage, conversation_length, session_start } = req.body;
    
    const contextMonitor = ContextMonitor.getInstance();
    const metrics = contextMonitor.updateMetrics(token_usage, conversation_length, session_start);
    const trigger = contextMonitor.checkHandoffTriggers();
    
    res.json({
      success: true,
      metrics,
      handoff_trigger: trigger,
      recommendations: trigger ? generateRecommendations(trigger) : null
    });
  } catch (error) {
    console.error('[empathize] Context monitoring error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to monitor context',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate handoff report
app.post('/handoff/generate-report', async (req, res) => {
  try {
    const {
      session_id,
      systemic_ledger_data,
      wisdom_memory_data,
      conversation_history,
      user_preferences,
      technical_state
    } = req.body;

    const generator = new HandoffReportGenerator();
    const report = await generator.generateReport(
      session_id,
      systemic_ledger_data,
      wisdom_memory_data,
      conversation_history,
      user_preferences,
      technical_state
    );

    // Store report
    handoffReports.push(report);

    res.json({
      success: true,
      report,
      handoff_id: report.id
    });
  } catch (error) {
    console.error('[empathize] Handoff report generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate handoff report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get handoff report
app.get('/handoff/report/:handoff_id', async (req, res) => {
  try {
    const { handoff_id } = req.params;
    const report = handoffReports.find(r => r.id === handoff_id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Handoff report not found'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('[empathize] Get handoff report error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve handoff report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate onboarding prompt for new AI
app.post('/handoff/onboarding-prompt', async (req, res) => {
  try {
    const { handoff_id } = req.body;
    const report = handoffReports.find(r => r.id === handoff_id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Handoff report not found'
      });
    }

    const onboardingPrompt = generateOnboardingPrompt(report);

    res.json({
      success: true,
      onboarding_prompt: onboardingPrompt,
      context_summary: {
        user_profile: report.user_profile,
        immediate_priorities: report.executive_summary.immediate_priorities,
        continuation_guidance: report.transition_notes.continuation_guidance
      }
    });
  } catch (error) {
    console.error('[empathize] Onboarding prompt generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate onboarding prompt',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// List recent handoffs
app.get('/handoff/recent', async (req, res) => {
  try {
    const recentReports = handoffReports
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(report => ({
        id: report.id,
        timestamp: report.timestamp,
        handoff_reason: report.transition_notes.handoff_reason,
        context_fill_percentage: report.context_metrics.context_fill_percentage,
        immediate_priorities: report.executive_summary.immediate_priorities.slice(0, 3)
      }));

    res.json({
      success: true,
      recent_handoffs: recentReports
    });
  } catch (error) {
    console.error('[empathize] Recent handoffs error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve recent handoffs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  const contextMonitor = ContextMonitor.getInstance();
  const currentMetrics = contextMonitor.getMetrics();
  
  res.json({
    status: 'healthy',
    service: 'Vision Holder Handoff API',
    current_context_usage: `${(currentMetrics.context_fill_percentage * 100).toFixed(1)}%`,
    handoff_reports_stored: handoffReports.length,
    system_ready_for_handoff: true
  });
});

// Helper functions
function generateRecommendations(trigger: HandoffTrigger): string[] {
  const recommendations: string[] = [];
  
  switch (trigger.urgency) {
    case 'immediate':
      recommendations.push('🚨 Immediate handoff required - context limit critically reached');
      recommendations.push('Prepare handoff report now to maintain conversation continuity');
      recommendations.push('Notify user of seamless transition in progress');
      break;
    case 'soon':
      recommendations.push('⚠️ Handoff should happen soon - prepare transition');
      recommendations.push('Begin generating comprehensive handoff report');
      recommendations.push('Consider natural conversation breakpoint for handoff');
      break;
    case 'planned':
      recommendations.push('📋 Plan handoff for optimal user experience');
      recommendations.push('Monitor for natural transition opportunity');
      recommendations.push('Begin light preparation for context transfer');
      break;
  }
  
  return recommendations;
}

function generateOnboardingPrompt(report: HandoffReport): string {
  return `
# Vision Holder AI Handoff - Seamless Context Transfer (Knowledge Base Enhanced)

## CRITICAL: You are continuing an ongoing conversation with a user who has dyslexia and ADHD

### Executive Summary
- **Current Phase**: ${report.executive_summary.current_phase}
- **Handoff Reason**: ${report.transition_notes.handoff_reason}
- **Context Fill**: ${(report.context_metrics.context_fill_percentage * 100).toFixed(1)}%

### User Profile (ESSENTIAL for accessibility)
- **Communication Style**: ${report.user_profile.communication_style}
- **Detail Level**: ${report.user_profile.detail_level}
- **Learning Pace**: ${report.user_profile.learning_pace}
- **Accessibility Needs**: ${report.user_profile.accessibility_needs.join(', ')}
- **Cognitive Patterns**: 
  - Attention span: ${report.user_profile.cognitive_patterns.attention_span}
  - Processing: ${report.user_profile.cognitive_patterns.information_processing}
  - Visual preference: ${report.user_profile.cognitive_patterns.visual_processing_preference}

### Immediate Priorities
${report.executive_summary.immediate_priorities.map(p => `- ${p}`).join('\n')}

### Recent Conversation Context (MINIMAL - Full History in Knowledge Base)
**Current Topic**: ${report.conversation_history.current_topic || 'General discussion'}
**Last User Request**: ${report.conversation_history.last_user_request || 'None'}
**Recent Summary**: ${report.conversation_history.recent_summary || 'No recent conversation'}
**Pending Questions**: ${report.conversation_history.pending_questions?.slice(-2).join('; ') || 'None'}
**AI Commitments**: ${report.conversation_history.ai_commitments?.slice(-2).map((c: any) => c.content || c).join('; ') || 'None'}

### Project State
- **Mission**: ${report.project_context.current_mission?.content || 'Operational phase'}
- **Active Sagas**: ${report.project_context.active_sagas.length} in progress
- **Current Blockers**: ${report.project_context.current_blockers.length} items blocked

### Knowledge Base Access Instructions
**IMPORTANT**: Full conversation history is stored in the knowledge base at http://localhost:3003/knowledge/search
- Use knowledge base search when you need more context about previous conversations
- Search for relevant topics, decisions, or user requests using semantic search
- Only retrieve what's immediately relevant to avoid context overload
- Focus on continuing the conversation naturally with minimal context

### Continuation Guidance
${report.transition_notes.continuation_guidance.map(g => `- ${g}`).join('\n')}

### User Experience Notes
${report.transition_notes.user_experience_notes.map(n => `- ${n}`).join('\n')}

## HANDOFF INSTRUCTIONS
1. **Acknowledge continuity**: Briefly mention you're continuing the conversation seamlessly
2. **Maintain communication style**: Follow the user's established preferences
3. **Address immediate priorities**: Focus on what the user was working on
4. **Respect accessibility needs**: Use clear, visual communication as appropriate
5. **Use knowledge base intelligently**: Only search for additional context when needed
6. **Keep responses focused**: Don't overwhelm with unnecessary historical context

**Start your first response by acknowledging the seamless transition and immediately addressing the user's most recent context.**
  `.trim();
}

// Start server
app.listen(port, () => {
  console.log(`[empathize] Vision Holder Handoff API running on port ${port}`);
  console.log(`[empathize] Context monitoring: http://localhost:${port}/handoff/monitor`);
  console.log(`[empathize] Generate report: http://localhost:${port}/handoff/generate-report`);
  console.log(`[empathize] Health check: http://localhost:${port}/health`);
});

export default app;