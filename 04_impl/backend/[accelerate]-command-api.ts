// [accelerate] Command API
// REST API for Vision Holder command orchestration

import express from 'express';
import cors from 'cors';
import CommandOrchestrator, { CommandRequest, CommandResponse } from './[delight]-command-orchestrator';
import { aiService } from './[accelerate]-ai-service-integration';

const app = express();
const PORT = process.env['COMMAND_API_PORT'] || 3006;

// Initialize command orchestrator
const commandOrchestrator = new CommandOrchestrator('/Users/ryanvalley/Desktop/webboruso-five-pillars-v2');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3005'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Vision Holder Command API',
    timestamp: new Date().toISOString(),
    working_directory: commandOrchestrator['workingDirectory']
  });
});

// POST /commands/suggest - Get AI-suggested commands based on user intent
app.post('/commands/suggest', async (req, res) => {
  try {
    const { user_intent, context = {} } = req.body;

    if (!user_intent || typeof user_intent !== 'string') {
      return res.status(400).json({
        error: 'user_intent is required and must be a string'
      });
    }

    // Generate AI prompt for command suggestion
    const prompt = commandOrchestrator.generateCommandPrompt(user_intent, context);
    
    // Get AI suggestion
    const aiSuggestion = await aiService.generateText(
      'Suggest the best command approach for this development task',
      prompt
    );

    // Parse AI response (attempt to extract JSON)
    let suggestion;
    try {
      const jsonMatch = aiSuggestion.match(/\{[\s\S]*\}/);
      suggestion = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        type: 'terminal',
        action: 'custom',
        reasoning: 'AI suggestion could not be parsed, defaulting to terminal',
        alternatives: []
      };
    } catch {
      suggestion = {
        type: 'terminal',
        action: 'custom',
        reasoning: 'AI response parsing failed',
        alternatives: []
      };
    }

    // Generate actual command based on suggestion
    const commandRequest: CommandRequest = {
      type: suggestion.type,
      action: suggestion.action,
      context: {
        ...context,
        user_intent
      }
    };

    const commandResponse = await commandOrchestrator.generateCommand(commandRequest);

    res.json({
      user_intent,
      ai_suggestion: suggestion,
      command: commandResponse,
      can_execute: commandResponse.success
    });

  } catch (error) {
    console.error('Error suggesting commands:', error);
    res.status(500).json({
      error: 'Failed to generate command suggestion'
    });
  }
});

// POST /commands/generate - Generate specific command
app.post('/commands/generate', async (req, res) => {
  try {
    const commandRequest: CommandRequest = req.body;

    if (!commandRequest.type || !commandRequest.action) {
      return res.status(400).json({
        error: 'type and action are required fields'
      });
    }

    const commandResponse = await commandOrchestrator.generateCommand(commandRequest);
    res.json(commandResponse);

  } catch (error) {
    console.error('Error generating command:', error);
    res.status(500).json({
      error: 'Failed to generate command'
    });
  }
});

// POST /commands/execute - Execute a command
app.post('/commands/execute', async (req, res) => {
  try {
    const { command, type = 'terminal' } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        error: 'command is required and must be a string'
      });
    }

    // Create a command response object to execute
    const commandResponse: CommandResponse = {
      success: true,
      command,
      explanation: `Executing ${type} command`
    };

    const result = await commandOrchestrator.executeCommand(commandResponse);
    
    res.json({
      executed: true,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error executing command:', error);
    res.status(500).json({
      error: 'Command execution failed'
    });
  }
});

// POST /commands/claude-code - Specific Claude Code integration
app.post('/commands/claude-code', async (req, res) => {
  try {
    const { action, file_path, description, issue } = req.body;

    const commandRequest: CommandRequest = {
      type: 'claude_code',
      action,
      context: {
        file_path,
        user_intent: description || issue,
        project_path: '/Users/ryanvalley/Desktop/webboruso-five-pillars-v2'
      }
    };

    const commandResponse = await commandOrchestrator.generateCommand(commandRequest);
    
    if (commandResponse.success) {
      // Execute the command if generation was successful
      const executionResult = await commandOrchestrator.executeCommand(commandResponse);
      res.json({
        generated: commandResponse,
        executed: executionResult
      });
    } else {
      res.json({
        generated: commandResponse,
        executed: null
      });
    }

  } catch (error) {
    console.error('Error with Claude Code command:', error);
    res.status(500).json({
      error: 'Claude Code command failed'
    });
  }
});

// POST /commands/google-cloud - Google Cloud CLI integration
app.post('/commands/google-cloud', async (req, res) => {
  try {
    const { action, project_id, parameters = {} } = req.body;

    const commandRequest: CommandRequest = {
      type: 'google_cli',
      action,
      context: {
        project_path: '/Users/ryanvalley/Desktop/webboruso-five-pillars-v2'
      },
      parameters: {
        project_id,
        ...parameters
      }
    };

    const commandResponse = await commandOrchestrator.generateCommand(commandRequest);
    
    res.json({
      command: commandResponse,
      ready_to_execute: commandResponse.success,
      warning: 'Google Cloud commands require manual review before execution'
    });

  } catch (error) {
    console.error('Error with Google Cloud command:', error);
    res.status(500).json({
      error: 'Google Cloud command generation failed'
    });
  }
});

// GET /commands/available-tools - List available CLI tools
app.get('/commands/available-tools', (req, res) => {
  res.json({
    available_tools: Array.from(commandOrchestrator['availableTools']),
    working_directory: commandOrchestrator['workingDirectory'],
    supported_types: ['claude_code', 'google_cli', 'terminal', 'file_operation']
  });
});

// POST /commands/batch - Execute multiple commands in sequence
app.post('/commands/batch', async (req, res) => {
  try {
    const { commands } = req.body;

    if (!Array.isArray(commands)) {
      return res.status(400).json({
        error: 'commands must be an array'
      });
    }

    const results = [];
    
    for (const commandRequest of commands) {
      try {
        const commandResponse = await commandOrchestrator.generateCommand(commandRequest);
        
        if (commandResponse.success) {
          const executionResult = await commandOrchestrator.executeCommand(commandResponse);
          results.push({
            request: commandRequest,
            generated: commandResponse,
            executed: executionResult
          });
        } else {
          results.push({
            request: commandRequest,
            generated: commandResponse,
            executed: null
          });
        }
      } catch (error) {
        results.push({
          request: commandRequest,
          generated: null,
          executed: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      batch_results: results,
      total_commands: commands.length,
      successful: results.filter(r => r.executed?.success).length
    });

  } catch (error) {
    console.error('Error executing batch commands:', error);
    res.status(500).json({
      error: 'Batch command execution failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[accelerate] Command API running on port ${PORT}`);
  console.log(`[accelerate] Working directory: ${commandOrchestrator['workingDirectory']}`);
  console.log(`[accelerate] Available tools: ${Array.from(commandOrchestrator['availableTools']).join(', ')}`);
});

export default app;