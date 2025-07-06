// [accelerate] AI Orchestrator API Backend
// Based on contract: /03_contract/[clarify]-system-architecture-schema.md

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from './[accelerate]-ai-service-integration';
import { setupSecurityMiddleware, rateLimits } from './[safeguard]-security-middleware';

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

// In-memory storage (replace with database in production)
let wisdomMemory: WisdomInsight[] = [];
let userPreferences: UserPreference = {
  communication_style: 'mixed',
  detail_level: 'medium',
  learning_pace: 'moderate',
  accessibility_needs: [],
  preferred_feedback: []
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

// Security middleware
setupSecurityMiddleware(app);

// Rate limiting
app.use('/onboarding', rateLimits.general);
app.use('/wisdom', rateLimits.api);
app.use('/context', rateLimits.api);

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
  _mission: LedgerEntry | null,
  _pillars: LedgerEntry[],
  _task: string,
  _builderType: string
): string => {
  let context = `Task: ${_task}
Builder Type: ${_builderType}

`;

  if (_mission) {
    context += `Mission: ${_mission.content['statement'] || _mission.seek}
`;
    context += `Mission Seek: ${_mission.seek}
`;
  }

  if (_pillars.length > 0) {
    context += `\nKey Principles:\n`;
    _pillars.forEach(pillar => {
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

  if (!mission) {
    reasons.push('No active mission to align with');
    return { aligned: false, reasons };
  }

  // Simple keyword-based alignment check
  const taskKeywords = task.toLowerCase().split(' ');
  const missionKeywords = mission.seek.toLowerCase().split(' ');

  const hasCommonKeywords = taskKeywords.some(tk => 
    missionKeywords.some(mk => mk.includes(tk) || tk.includes(mk))
  );

  if (!hasCommonKeywords) {
    reasons.push(`Task may not align with mission seek: "${mission.seek}"`);
  }

  return {
    aligned: reasons.length === 0,
    reasons
  };
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

// API Routes

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