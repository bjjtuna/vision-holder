// [delight] Command Orchestrator
// Generates and manages commands for external tools (Claude Code, Google CLI, etc.)

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface CommandRequest {
  type: 'claude_code' | 'google_cli' | 'terminal' | 'file_operation';
  action: string;
  context: {
    file_path?: string;
    project_path?: string;
    user_intent?: string;
    current_code?: string;
    target_technology?: string;
  };
  parameters?: Record<string, any>;
}

export interface CommandResponse {
  success: boolean;
  command: string;
  output?: string;
  error?: string;
  follow_up_commands?: string[];
  explanation?: string;
}

export class CommandOrchestrator {
  private workingDirectory: string;
  private availableTools: Set<string> = new Set();

  constructor(workingDirectory: string = process.cwd()) {
    this.workingDirectory = workingDirectory;
    this.initializeTools();
  }

  private async initializeTools() {
    // Check for available CLI tools
    const tools = ['claude', 'gcloud', 'npm', 'git', 'code'];
    
    for (const tool of tools) {
      try {
        await execAsync(`which ${tool}`);
        this.availableTools.add(tool);
        console.log(`✅ ${tool} CLI available`);
      } catch {
        console.log(`❌ ${tool} CLI not found`);
      }
    }
  }

  async generateCommand(request: CommandRequest): Promise<CommandResponse> {
    try {
      switch (request.type) {
        case 'claude_code':
          return await this.generateClaudeCodeCommand(request);
        case 'google_cli':
          return await this.generateGoogleCLICommand(request);
        case 'terminal':
          return await this.generateTerminalCommand(request);
        case 'file_operation':
          return await this.generateFileOperationCommand(request);
        default:
          throw new Error(`Unknown command type: ${request.type}`);
      }
    } catch (error) {
      return {
        success: false,
        command: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async generateClaudeCodeCommand(request: CommandRequest): Promise<CommandResponse> {
    if (!this.availableTools.has('claude')) {
      return {
        success: false,
        command: '',
        error: 'Claude Code CLI not available. Install with: npm install -g @anthropic/claude-code',
        explanation: 'Claude Code CLI is required for AI-assisted development commands'
      };
    }

    const { action, context } = request;
    let command = '';
    let explanation = '';

    switch (action) {
      case 'review_code':
        command = `claude code review "${context.file_path}" --context "${context.user_intent}"`;
        explanation = 'Reviewing code with Claude for improvements and suggestions';
        break;

      case 'implement_feature':
        command = `claude code implement --description "${context.user_intent}" --file "${context.file_path}"`;
        explanation = 'Using Claude to implement a new feature based on your description';
        break;

      case 'fix_bug':
        command = `claude code fix --file "${context.file_path}" --issue "${context.user_intent}"`;
        explanation = 'Having Claude analyze and fix the identified bug';
        break;

      case 'refactor':
        command = `claude code refactor "${context.file_path}" --goal "${context.user_intent}"`;
        explanation = 'Refactoring code for better structure and maintainability';
        break;

      case 'generate_tests':
        command = `claude code test --file "${context.file_path}" --framework jest`;
        explanation = 'Generating comprehensive tests for the specified file';
        break;

      case 'explain_code':
        command = `claude code explain "${context.file_path}" --detail high`;
        explanation = 'Getting detailed explanation of how the code works';
        break;

      case 'optimize_performance':
        command = `claude code optimize "${context.file_path}" --focus performance`;
        explanation = 'Analyzing and optimizing code for better performance';
        break;

      default:
        command = `claude code chat --message "${context.user_intent}" --context "${context.file_path || context.project_path}"`;
        explanation = 'Starting an interactive coding session with Claude';
    }

    return {
      success: true,
      command,
      explanation,
      follow_up_commands: [
        'claude code status',  // Check current session
        'claude code history'  // View recent commands
      ]
    };
  }

  private async generateGoogleCLICommand(request: CommandRequest): Promise<CommandResponse> {
    if (!this.availableTools.has('gcloud')) {
      return {
        success: false,
        command: '',
        error: 'Google Cloud CLI not available. Install from: https://cloud.google.com/sdk/docs/install',
        explanation: 'Google Cloud CLI is required for cloud deployment and management'
      };
    }

    const { action, context } = request;
    let command = '';
    let explanation = '';

    switch (action) {
      case 'deploy_function':
        command = `gcloud functions deploy vision-holder-function --runtime nodejs18 --trigger-http --allow-unauthenticated --source .`;
        explanation = 'Deploying Vision Holder as a Google Cloud Function';
        break;

      case 'deploy_app_engine':
        command = `gcloud app deploy --project=${context.parameters?.project_id || 'vision-holder'}`;
        explanation = 'Deploying to Google App Engine';
        break;

      case 'create_storage_bucket':
        command = `gcloud storage buckets create gs://vision-holder-storage --location=us-central1`;
        explanation = 'Creating storage bucket for project files';
        break;

      case 'setup_firestore':
        command = `gcloud firestore databases create --location=us-central1`;
        explanation = 'Setting up Firestore database for project data';
        break;

      case 'enable_apis':
        const apis = [
          'cloudfunctions.googleapis.com',
          'storage.googleapis.com',
          'firestore.googleapis.com',
          'aiplatform.googleapis.com'
        ];
        command = `gcloud services enable ${apis.join(' ')}`;
        explanation = 'Enabling required Google Cloud APIs';
        break;

      default:
        command = `gcloud auth login && gcloud config set project vision-holder`;
        explanation = 'Setting up Google Cloud authentication and project';
    }

    return {
      success: true,
      command,
      explanation,
      follow_up_commands: [
        'gcloud config list',  // Show current config
        'gcloud projects list'  // List available projects
      ]
    };
  }

  private async generateTerminalCommand(request: CommandRequest): Promise<CommandResponse> {
    const { action, context } = request;
    let command = '';
    let explanation = '';

    switch (action) {
      case 'install_dependencies':
        if (await this.fileExists('package.json')) {
          command = 'npm install';
          explanation = 'Installing Node.js dependencies';
        } else if (await this.fileExists('requirements.txt')) {
          command = 'pip install -r requirements.txt';
          explanation = 'Installing Python dependencies';
        } else {
          command = 'echo "No dependency file found (package.json or requirements.txt)"';
          explanation = 'No recognized dependency file found';
        }
        break;

      case 'start_development':
        if (await this.fileExists('package.json')) {
          command = 'npm run dev';
          explanation = 'Starting development server';
        } else {
          command = 'echo "No package.json found. Cannot start development server."';
          explanation = 'Development server setup not found';
        }
        break;

      case 'run_tests':
        command = 'npm test';
        explanation = 'Running project tests';
        break;

      case 'build_project':
        command = 'npm run build';
        explanation = 'Building project for production';
        break;

      case 'git_status':
        command = 'git status --porcelain';
        explanation = 'Checking git repository status';
        break;

      case 'git_commit':
        command = `git add . && git commit -m "${context.user_intent || 'Auto-commit from Vision Holder'}"`;
        explanation = 'Committing current changes to git';
        break;

      case 'create_folder':
        command = `mkdir -p "${context.file_path}"`;
        explanation = `Creating directory: ${context.file_path}`;
        break;

      default:
        command = context.user_intent || 'echo "No command specified"';
        explanation = 'Executing custom terminal command';
    }

    return {
      success: true,
      command,
      explanation
    };
  }

  private async generateFileOperationCommand(request: CommandRequest): Promise<CommandResponse> {
    const { action, context } = request;
    
    try {
      switch (action) {
        case 'create_file':
          await this.createFile(context.file_path!, context.current_code || '');
          return {
            success: true,
            command: `File created: ${context.file_path}`,
            explanation: 'File created successfully'
          };

        case 'read_file':
          const content = await this.readFile(context.file_path!);
          return {
            success: true,
            command: `File read: ${context.file_path}`,
            output: content,
            explanation: 'File content retrieved'
          };

        case 'update_file':
          await this.updateFile(context.file_path!, context.current_code!);
          return {
            success: true,
            command: `File updated: ${context.file_path}`,
            explanation: 'File updated successfully'
          };

        case 'delete_file':
          await this.deleteFile(context.file_path!);
          return {
            success: true,
            command: `File deleted: ${context.file_path}`,
            explanation: 'File deleted successfully'
          };

        default:
          throw new Error(`Unknown file operation: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        command: '',
        error: error instanceof Error ? error.message : 'File operation failed'
      };
    }
  }

  async executeCommand(commandResponse: CommandResponse): Promise<CommandResponse> {
    if (!commandResponse.success) {
      return commandResponse;
    }

    try {
      const { stdout, stderr } = await execAsync(commandResponse.command, {
        cwd: this.workingDirectory,
        timeout: 30000 // 30 second timeout
      });

      return {
        ...commandResponse,
        output: stdout.trim(),
        error: stderr ? stderr.trim() : undefined
      };
    } catch (error: any) {
      return {
        ...commandResponse,
        success: false,
        error: error.message || 'Command execution failed'
      };
    }
  }

  // Utility methods
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.workingDirectory, filePath));
      return true;
    } catch {
      return false;
    }
  }

  private async createFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.workingDirectory, filePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
  }

  private async readFile(filePath: string): Promise<string> {
    const fullPath = path.join(this.workingDirectory, filePath);
    return await fs.readFile(fullPath, 'utf8');
  }

  private async updateFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.workingDirectory, filePath);
    await fs.writeFile(fullPath, content, 'utf8');
  }

  private async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.workingDirectory, filePath);
    await fs.unlink(fullPath);
  }

  // Generate AI prompt for command suggestion
  generateCommandPrompt(userIntent: string, context: any): string {
    return `
User Intent: ${userIntent}
Current Context: ${JSON.stringify(context, null, 2)}
Available Tools: ${Array.from(this.availableTools).join(', ')}

Please suggest the most appropriate command type and action to accomplish the user's intent.
Consider the available tools and current project context.

Respond with a JSON object containing:
{
  "type": "claude_code" | "google_cli" | "terminal" | "file_operation",
  "action": "specific_action_name",
  "reasoning": "why this approach is recommended",
  "alternatives": ["alternative approaches if any"]
}
    `;
  }
}

export default CommandOrchestrator;