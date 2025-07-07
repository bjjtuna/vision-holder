// [accelerate] AI Orchestrator API Backend
// Based on contract: /03_contract/[clarify]-system-architecture-schema.md

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from './[accelerate]-ai-service-integration';
import { setupSecurityMiddleware, rateLimits } from './[safeguard]-security-middleware';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Types based on contract schema
export interface WisdomInsight {
  id: string;
  insight: string;
  relevance_score: number;
  context_triggers: string[];
  user_preference: Record<string, any>;
  timestamp: string;
  usage_count: number;
}

export interface ContextPrompt {
  minimal_context: string;
  alignment_check: boolean;
  wisdom_injected: WisdomInsight[];
  builder_instructions: string;
}

export interface UserPreference {
  communication_style: 'visual' | 'text' | 'voice' | 'mixed';
  detail_level: 'high' | 'medium' | 'low';
  learning_pace: 'fast' | 'moderate' | 'slow';
  accessibility_needs: string[];
  preferred_feedback: string[];
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  purpose_tag: '[clarify]' | '[accelerate]' | '[safeguard]' | '[monetize]' | '[empathize]' | '[delight]';
  level: 'mission' | 'pillar' | 'epic' | 'saga' | 'probe';
  seek: string;
  why: string;
  content: Record<string, any>;
  status: 'proposed' | 'active' | 'blocked' | 'integrated' | 'archived' | 'dormant';
}

// Onboarding types based on onboarding.yaml contract
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  order: number;
  component: 'roadmap' | 'chat' | 'knowledge' | 'terminal';
  tooltip: string;
  cta: string;
}

export interface UserOnboardingState {
  user_id: string;
  current_step: string;
  completed_steps: string[];
  started_at: string;
  completed_at: string | null;
}

// Chat message interface for real-time communication
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: Array<{name: string; size: number; type: string}>;
  context?: {
    systemic_ledger?: any;
    wisdom_insights?: WisdomInsight[];
    user_preferences?: UserPreference;
  };
}

// In-memory storage (replace with database in production)
let wisdomMemory: WisdomInsight[] = [];
let userPreferences: UserPreference = {
  communication_style: 'mixed',
  detail_level: 'medium',
  learning_pace: 'moderate',
  accessibility_needs: [],
  preferred_feedback: []
};

// Chat history storage
let chatHistory: ChatMessage[] = [];

// Knowledge base context retrieval helper
const getRelevantContextFromKnowledgeBase = async (userMessage: string, limit: number = 3): Promise<any> => {
  try {
    // Search knowledge base for relevant chat sessions
    const searchResponse = await fetch(`http://localhost:3003/knowledge/search?q=${encodeURIComponent(userMessage)}&type=all&limit=${limit}`);
    const searchData = await searchResponse.json();
    
    if (searchData.documents && searchData.documents.length > 0) {
      return {
        relevant_sessions: searchData.documents.slice(0, limit).map((doc: any) => ({
          name: doc.name,
          summary: doc.ai_analysis?.summary || 'Chat session',
          key_points: doc.ai_analysis?.key_points?.slice(0, 3) || [],
          relevance_score: doc.ai_analysis?.relevance_score || 0,
          tags: doc.tags || []
        })),
        total_relevant_sessions: searchData.total,
        search_query: userMessage.slice(0, 100)
      };
    }
    
    return { relevant_sessions: [], total_relevant_sessions: 0, search_query: userMessage.slice(0, 100) };
  } catch (error) {
    console.error('[accelerate] Knowledge base retrieval failed:', error);
    return { relevant_sessions: [], total_relevant_sessions: 0, search_query: userMessage.slice(0, 100) };
  }
};

// Onboarding storage
let onboardingSteps: OnboardingStep[] = [];
let userOnboardingStates: UserOnboardingState[] = [];

// Initialize with default onboarding steps
const initializeDefaultOnboardingSteps = () => {
  onboardingSteps = [
    {
      id: 'roadmap-intro',
      title: 'Welcome to Your Vision Roadmap',
      description: 'This is where your project vision comes to life. See your mission, pillars, epics, and probes at a glance.',
      order: 1,
      component: 'roadmap',
      tooltip: 'Click on any item to see its details and progress',
      cta: 'Let\'s explore your roadmap'
    },
    {
      id: 'chat-intro',
      title: 'Meet Your AI Co-Vision Holder',
      description: 'Chat with your AI partner using text or voice. Upload files, share ideas, and get instant feedback.',
      order: 2,
      component: 'chat',
      tooltip: 'Try voice input by clicking the microphone icon',
      cta: 'Start a conversation'
    },
    {
      id: 'knowledge-intro',
      title: 'Your Knowledge Base',
      description: 'Store and organize all your project documents, research, and insights in one place.',
      order: 3,
      component: 'knowledge',
      tooltip: 'Upload files or create new documents here',
      cta: 'Add your first document'
    },
    {
      id: 'terminal-intro',
      title: 'System Terminal & Status',
      description: 'Monitor system health, view logs, and manage technical operations.',
      order: 4,
      component: 'terminal',
      tooltip: 'Check API status and system logs here',
      cta: 'View system status'
    }
  ];
};

// Initialize default onboarding steps
initializeDefaultOnboardingSteps();

// Initialize with default wisdom insights
const initializeDefaultWisdom = () => {
  const defaultInsights: Omit<WisdomInsight, 'id' | 'timestamp' | 'usage_count'>[] = [
    {
      insight: 'User prefers visual feedback over text-heavy interfaces',
      relevance_score: 0.9,
      context_triggers: ['ui', 'interface', 'design', 'visual'],
      user_preference: { visual_preference: true }
    },
    {
      insight: 'User works better with step-by-step guidance',
      relevance_score: 0.8,
      context_triggers: ['process', 'guidance', 'steps', 'workflow'],
      user_preference: { step_by_step: true }
    },
    {
      insight: 'User values clear progress indicators',
      relevance_score: 0.7,
      context_triggers: ['progress', 'status', 'tracking', 'milestone'],
      user_preference: { progress_visibility: true }
    }
  ];

  defaultInsights.forEach(insight => {
    wisdomMemory.push({
      ...insight,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      usage_count: 0
    });
  });
};

// Initialize default wisdom
initializeDefaultWisdom();

const app = express();
const PORT = process.env['PORT'] || 3002;

// CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-mock-user']
}));

// JSON parsing middleware
app.use(express.json());

// Security middleware
setupSecurityMiddleware(app);

// Rate limiting
app.use('/onboarding', rateLimits.general);
app.use('/wisdom', rateLimits.api);
app.use('/context', rateLimits.api);
app.use('/chat', rateLimits.api);

// Helper functions
const getRelevantWisdom = (task: string, builderType: string): WisdomInsight[] => {
  const taskKeywords = task.toLowerCase().split(' ');
  const builderKeywords = builderType.toLowerCase().split(' ');

  return wisdomMemory
    .filter(wisdom => {
      const triggerMatch = wisdom.context_triggers.some(trigger => 
        taskKeywords.some(keyword => 
          keyword.includes(trigger.toLowerCase()) || trigger.toLowerCase().includes(keyword)
        ) ||
        builderKeywords.some(keyword => 
          keyword.includes(trigger.toLowerCase()) || trigger.toLowerCase().includes(keyword)
        )
      );

      if (triggerMatch) {
        wisdom.usage_count++;
        return true;
      }
      return false;
    })
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 3); // Return top 3 most relevant insights
};

const buildMinimalContext = (
  mission: LedgerEntry | null,
  pillars: LedgerEntry[],
  task: string,
  builderType: string
): string => {
  let context = `Task: ${task}\nBuilder Type: ${builderType}\n`;

  if (mission) {
    context += `Mission: ${mission.seek} (${mission.why})\n`;
  }

  if (pillars.length > 0) {
    context += `Active Pillars:\n`;
    pillars.forEach(pillar => {
      context += `- ${pillar.seek}: ${pillar.why}\n`;
    });
  }

  return context;
};

const performAlignmentCheck = (
  task: string,
  mission: LedgerEntry | null,
  pillars: LedgerEntry[]
): { aligned: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  let aligned = true;

  if (!mission) {
    reasons.push('No mission defined to check alignment against');
    aligned = false;
    return { aligned, reasons };
  }

  const taskKeywords = task.toLowerCase().split(' ');
  const missionKeywords = mission.seek.toLowerCase().split(' ');

  // Check mission alignment
  const missionAlignment = taskKeywords.some(keyword =>
    missionKeywords.some(missionKeyword =>
      keyword.includes(missionKeyword) || missionKeyword.includes(keyword)
    )
  );

  if (!missionAlignment) {
    reasons.push('Task does not appear to align with current mission focus');
    aligned = false;
  }

  // Check pillar alignment
  if (pillars.length > 0) {
    const pillarAlignment = pillars.some(pillar => {
      const pillarKeywords = pillar.seek.toLowerCase().split(' ');
      return taskKeywords.some(keyword =>
        pillarKeywords.some(pillarKeyword =>
          keyword.includes(pillarKeyword) || pillarKeyword.includes(keyword)
        )
      );
    });

    if (!pillarAlignment) {
      reasons.push('Task does not align with any active pillars');
      aligned = false;
    }
  }

  return { aligned, reasons };
};

const generateBuilderInstructions = async (
  task: string,
  builderType: string,
  wisdom: WisdomInsight[]
): Promise<string> => {
  try {
    // Use AI to generate contextual instructions
    const wisdomContext = wisdom.map(w => w.insight).join('. ');
    const contextualPrompt = `Task: ${task}\nBuilder Type: ${builderType}\nUser Insights: ${wisdomContext}`;
    
    const aiInstructions = await aiService.generateText(
      `Generate specific, actionable instructions for a ${builderType} builder to complete this task: ${task}`,
      contextualPrompt
    );
    
    return aiInstructions;
  } catch (error) {
    console.error('AI instruction generation failed, using fallback:', error);
    
    // Fallback to original implementation
    let instructions = `Please complete the following task: ${task}\n\n`;

    // Add wisdom-based instructions
    if (wisdom.length > 0) {
      instructions += `User Preferences & Insights:\n`;
      wisdom.forEach(w => {
        instructions += `- ${w.insight}\n`;
      });
      instructions += '\n';
    }

    // Add builder-specific instructions
    switch (builderType) {
      case 'code':
        instructions += 'Please provide clean, well-documented code with accessibility considerations.';
        break;
      case 'design':
        instructions += 'Please focus on accessibility, clarity, and progressive disclosure.';
        break;
      case 'planning':
        instructions += 'Please provide structured, step-by-step plans with clear milestones.';
        break;
      case 'analysis':
        instructions += 'Please provide clear, actionable insights with visual organization.';
        break;
    }

    return instructions;
  }
};

// Enhanced context engineering with Knowledge Base integration
const generateEnhancedContext = async (
  userMessage: string,
  systemicLedger?: any,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    // Get relevant wisdom insights
    const relevantWisdom = getRelevantWisdom(userMessage, 'chat');
    
    // Get relevant context from knowledge base instead of full conversation history
    const knowledgeBaseContext = await getRelevantContextFromKnowledgeBase(userMessage, 2);
    
    // Build context from Systemic Ledger
    let ledgerContext = '';
    if (systemicLedger) {
      if (systemicLedger.mission) {
        ledgerContext += `Current Mission: ${systemicLedger.mission.text}\n`;
        ledgerContext += `Mission Goal: ${systemicLedger.mission.seek}\n`;
        ledgerContext += `Mission Purpose: ${systemicLedger.mission.why}\n\n`;
      }
      
      if (systemicLedger.pillars && systemicLedger.pillars.length > 0) {
        ledgerContext += `Active Pillars:\n`;
        systemicLedger.pillars.forEach((pillar: any) => {
          ledgerContext += `- ${pillar.text}: ${pillar.seek} (${pillar.why})\n`;
        });
        ledgerContext += '\n';
      }
    }

    // Build minimal recent conversation context (only last 3 messages)
    const recentHistory = conversationHistory
      .slice(-3)
      .map(msg => `${msg.role}: ${msg.content.slice(0, 100)}...`)
      .join('\n');

    // Build knowledge base context
    let kbContext = '';
    if (knowledgeBaseContext.relevant_sessions.length > 0) {
      kbContext += `Relevant Previous Conversations:\n`;
      knowledgeBaseContext.relevant_sessions.forEach((session: any) => {
        kbContext += `- ${session.summary} (relevance: ${session.relevance_score})\n`;
        if (session.key_points.length > 0) {
          kbContext += `  Key points: ${session.key_points.join(', ')}\n`;
        }
      });
      kbContext += '\n';
    }

    // Generate enhanced context using AI
    const contextPrompt = `
User Message: ${userMessage}

${ledgerContext ? `Systemic Ledger Context:\n${ledgerContext}` : ''}

${kbContext ? `Knowledge Base Context:\n${kbContext}` : ''}

${recentHistory ? `Recent Conversation:\n${recentHistory}\n` : ''}

${relevantWisdom.length > 0 ? `User Insights:\n${relevantWisdom.map(w => w.insight).join('\n')}\n` : ''}

Generate a comprehensive context that helps provide the most relevant and helpful response to the user's message.`;

    const enhancedContext = await aiService.generateContext(userMessage, [contextPrompt]);
    return enhancedContext;
  } catch (error) {
    console.error('Enhanced context generation failed:', error);
    return `User is asking: ${userMessage}`;
  }
};

// API Routes

// GET /health - Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Orchestrator API',
    timestamp: new Date().toISOString(),
    ai_service: aiService ? 'configured' : 'not configured',
    wisdom_memory_count: wisdomMemory.length,
    user_preferences: userPreferences
  });
});

// POST /orchestrator/context - Generate minimal context prompt
app.post('/orchestrator/context', async (req, res) => {
  try {
    const { task, builderType, mission, pillars } = req.body;

    if (!task || typeof task !== 'string') {
      return res.status(400).json({
        error: 'task field is required and must be a string'
      });
    }

    if (!builderType || !['code', 'design', 'planning', 'analysis'].includes(builderType)) {
      return res.status(400).json({
        error: 'builderType must be one of: code, design, planning, analysis'
      });
    }

    const relevantWisdom = getRelevantWisdom(task, builderType);
    const context = buildMinimalContext(mission, pillars || [], task, builderType);
    const alignmentCheck = performAlignmentCheck(task, mission, pillars || []);
    const builderInstructions = await generateBuilderInstructions(task, builderType, relevantWisdom);

    const contextPrompt: ContextPrompt = {
      minimal_context: context,
      alignment_check: alignmentCheck.aligned,
      wisdom_injected: relevantWisdom,
      builder_instructions: builderInstructions
    };

    res.json(contextPrompt);

  } catch (error) {
    console.error('Error generating context:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /orchestrator/chat - Real AI chat with attachment support
app.post('/orchestrator/chat', async (req, res) => {
  try {
    console.log('=== CHAT REQUEST DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Length:', req.headers['content-length']);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw body type:', typeof req.body);
    console.log('Raw body:', req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    console.log('Received chat request body:', JSON.stringify(req.body, null, 2));
    
    const { message, systemicLedger, attachments = [] } = req.body;

    console.log('Extracted fields:', { 
      message, 
      messageType: typeof message, 
      messageValue: message,
      messageLength: message?.length,
      messageExists: 'message' in (req.body || {}),
      systemicLedger: !!systemicLedger,
      attachments: attachments?.length || 0
    });

    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.log('Invalid message field:', { message, type: typeof message, empty: message === '', whitespace: message?.trim() === '' });
      return res.status(400).json({
        error: 'message field is required and must be a non-empty string'
      });
    }

    // Validate attachments if provided
    if (attachments && !Array.isArray(attachments)) {
      return res.status(400).json({
        error: 'attachments must be an array'
      });
    }

    // Process attachment context
    let attachmentContext = '';
    if (attachments && attachments.length > 0) {
      attachmentContext = `\nUser uploaded ${attachments.length} file(s):\n` +
        attachments.map((att: any) => `- ${att.name} (${att.type}, ${att.size} bytes)`).join('\n');
    }

    // Store user message with attachments
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      attachments: attachments,
      context: { systemic_ledger: systemicLedger }
    };
    chatHistory.push(userMessage);

    // Generate enhanced context with attachment info
    const enhancedContext = await generateEnhancedContext(
      message + attachmentContext, 
      systemicLedger, 
      chatHistory
    );

    // Get relevant wisdom insights
    const relevantWisdom = getRelevantWisdom(message, 'chat');

    // Generate AI response
    const aiResponse = await aiService.generateText(message, enhancedContext);

    // Store AI response
    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      context: {
        systemic_ledger: systemicLedger,
        wisdom_insights: relevantWisdom,
        user_preferences: userPreferences
      }
    };
    chatHistory.push(assistantMessage);

    // Extract new insights from the conversation
    const conversationText = `${message}\n${aiResponse}`;
    const newInsights = await aiService.extractInsights(conversationText);
    
    // Store new insights in wisdom memory
    newInsights.forEach(insight => {
      const wisdomInsight: WisdomInsight = {
        id: uuidv4(),
        insight: insight.insight,
        relevance_score: insight.relevance_score,
        context_triggers: [insight.context_trigger],
        user_preference: { category: insight.category },
        timestamp: new Date().toISOString(),
        usage_count: 0
      };
      wisdomMemory.push(wisdomInsight);
    });

    res.json({
      response: aiResponse,
      context: enhancedContext,
      wisdom_insights: relevantWisdom,
      new_insights_count: newInsights.length
    });

  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate AI response'
    });
  }
});

// GET /orchestrator/chat/history - Get chat history
app.get('/orchestrator/chat/history', (req, res) => {
  const { limit = '50' } = req.query;
  const limitNum = parseInt(limit as string) || 50;
  
  const recentHistory = chatHistory
    .slice(-limitNum)
    .map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));

  res.json({
    messages: recentHistory,
    total: chatHistory.length
  });
});

// POST /orchestrator/wisdom - Store new wisdom insight
app.post('/orchestrator/wisdom', (req, res) => {
  try {
    const { insight, context_triggers, user_preference } = req.body;

    if (!insight || typeof insight !== 'string') {
      return res.status(400).json({
        error: 'insight field is required and must be a string'
      });
    }

    if (!context_triggers || !Array.isArray(context_triggers)) {
      return res.status(400).json({
        error: 'context_triggers field is required and must be an array'
      });
    }

    if (!user_preference || typeof user_preference !== 'object') {
      return res.status(400).json({
        error: 'user_preference field is required and must be an object'
      });
    }

    const newInsight: WisdomInsight = {
      id: uuidv4(),
      insight,
      relevance_score: 1.0,
      context_triggers,
      user_preference,
      timestamp: new Date().toISOString(),
      usage_count: 0
    };

    wisdomMemory.push(newInsight);

    res.status(201).json({
      message: 'Wisdom insight stored successfully',
      insight: newInsight
    });

  } catch (error) {
    console.error('Error storing wisdom insight:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /orchestrator/preferences - Update user preferences
app.put('/orchestrator/preferences', (req, res) => {
  try {
    const updates = req.body;

    // Validate updates
    if (updates.communication_style && !['visual', 'text', 'voice', 'mixed'].includes(updates.communication_style)) {
      return res.status(400).json({
        error: 'communication_style must be one of: visual, text, voice, mixed'
      });
    }

    if (updates.detail_level && !['high', 'medium', 'low'].includes(updates.detail_level)) {
      return res.status(400).json({
        error: 'detail_level must be one of: high, medium, low'
      });
    }

    if (updates.learning_pace && !['fast', 'moderate', 'slow'].includes(updates.learning_pace)) {
      return res.status(400).json({
        error: 'learning_pace must be one of: fast, moderate, slow'
      });
    }

    // Update preferences
    userPreferences = { ...userPreferences, ...updates };

    res.json({
      message: 'User preferences updated successfully',
      preferences: userPreferences
    });

  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /orchestrator/preferences - Get user preferences
app.get('/orchestrator/preferences', (req, res) => {
  res.json(userPreferences);
});

// GET /orchestrator/wisdom - Get wisdom insights
app.get('/orchestrator/wisdom', (req, res) => {
  const { limit = '10', sort = 'usage' } = req.query;
  
  let sortedWisdom = [...wisdomMemory];
  
  if (sort === 'usage') {
    sortedWisdom.sort((a, b) => b.usage_count - a.usage_count);
  } else if (sort === 'relevance') {
    sortedWisdom.sort((a, b) => b.relevance_score - a.relevance_score);
  } else if (sort === 'timestamp') {
    sortedWisdom.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  const limitNum = parseInt(limit as string) || 10;
  const limitedWisdom = sortedWisdom.slice(0, limitNum);

    return res.json({
      insights: limitedWisdom,
      total: wisdomMemory.length
    });
});

// POST /orchestrator/alignment - Perform live alignment check
app.post('/orchestrator/alignment', (req, res) => {
  try {
    const { entry, mission, pillars } = req.body;

    if (!entry) {
      return res.status(400).json({
        error: 'entry field is required'
      });
    }

    const alignmentCheck = performAlignmentCheck(entry.seek || '', mission, pillars || []);
    const suggestions: string[] = [];

    if (!alignmentCheck.aligned) {
      // Generate suggestions based on wisdom memory
      const relevantWisdom = wisdomMemory.filter(w => 
        w.context_triggers.some(trigger => 
          (entry.seek || '').toLowerCase().includes(trigger.toLowerCase()) ||
          (entry.why || '').toLowerCase().includes(trigger.toLowerCase())
        )
      );

      suggestions.push(...relevantWisdom.map(w => w.insight));
    }

    res.json({
      aligned: alignmentCheck.aligned,
      reasons: alignmentCheck.reasons,
      suggestions
    });

  } catch (error) {
    console.error('Error performing alignment check:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /orchestrator/summary - Generate summary report
app.get('/orchestrator/summary', (req, res) => {
  try {
    const topWisdom = wisdomMemory
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5);

    const summary = {
      user_preferences: userPreferences,
      top_wisdom_insights: topWisdom,
      total_insights: wisdomMemory.length,
      generated_at: new Date().toISOString()
    };

    res.json(summary);

  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    wisdom_insights_count: wisdomMemory.length,
    user_preferences_configured: Object.keys(userPreferences).length > 0
  });
});

// Onboarding API Routes

// GET /onboarding/steps - List onboarding steps
app.get('/onboarding/steps', (_req, res) => {
  try {
    res.json({
      data: onboardingSteps.sort((a, b) => a.order - b.order)
    });
  } catch (error) {
    console.error('Error fetching onboarding steps:', error);
    res.status(500).json({
      error: 'Internal server error while fetching onboarding steps'
    });
  }
});

// GET /onboarding/state - Get current onboarding state for user
app.get('/onboarding/state', (req, res) => {
  try {
    const userId = req.headers['x-mock-user'] as string;
    if (!userId) {
      return res.status(400).json({
        error: 'x-mock-user header is required'
      });
    }

    let state = userOnboardingStates.find(s => s.user_id === userId);
    
    if (!state) {
      // Initialize new state for first-time user
      const firstStep = onboardingSteps[0];
      if (!firstStep) {
        return res.status(500).json({
          error: 'No onboarding steps defined'
        });
      }

      state = {
        user_id: userId,
        current_step: firstStep.id,
        completed_steps: [],
        started_at: new Date().toISOString(),
        completed_at: null
      };
      userOnboardingStates.push(state);
    }

    res.json({ data: state });
  } catch (error) {
    console.error('Error fetching onboarding state:', error);
    res.status(500).json({
      error: 'Internal server error while fetching onboarding state'
    });
  }
});

// POST /onboarding/state - Update onboarding state for user
app.post('/onboarding/state', (req, res) => {
  try {
    const userId = req.headers['x-mock-user'] as string;
    if (!userId) {
      return res.status(400).json({
        error: 'x-mock-user header is required'
      });
    }

    const newState = req.body as UserOnboardingState;
    if (!newState || !newState.current_step || !Array.isArray(newState.completed_steps)) {
      return res.status(400).json({
        error: 'Invalid onboarding state data'
      });
    }

    // Validate current_step exists
    if (!onboardingSteps.some(s => s.id === newState.current_step)) {
      return res.status(400).json({
        error: 'Invalid current_step'
      });
    }

    // Validate completed_steps exist
    for (const stepId of newState.completed_steps) {
      if (!onboardingSteps.some(s => s.id === stepId)) {
        return res.status(400).json({
          error: `Invalid completed step: ${stepId}`
        });
      }
    }

    const existingStateIndex = userOnboardingStates.findIndex(s => s.user_id === userId);
    if (existingStateIndex >= 0) {
      // Update existing state
      const existingState = userOnboardingStates[existingStateIndex];
      if (!existingState) {
        return res.status(500).json({
          error: 'Failed to update onboarding state'
        });
      }
      
      userOnboardingStates[existingStateIndex] = {
        ...newState,
        user_id: userId,
        started_at: existingState.started_at
      };
      res.json({ data: userOnboardingStates[existingStateIndex] });
    } else {
      // Create new state
      const state: UserOnboardingState = {
        ...newState,
        user_id: userId,
        started_at: new Date().toISOString()
      };
      userOnboardingStates.push(state);
      res.status(201).json({ data: state });
    }
  } catch (error) {
    console.error('Error updating onboarding state:', error);
    res.status(500).json({
      error: 'Internal server error while updating onboarding state'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[accelerate] AI Orchestrator API running on port ${PORT}`);
  console.log(`[clarify] Health check: http://localhost:${PORT}/health`);
  console.log(`[clarify] Context generation: http://localhost:${PORT}/orchestrator/context`);
});

export default app; 