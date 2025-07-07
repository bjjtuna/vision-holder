'use client';

// [delight] Command Assistant Component
// AI-powered command generation and execution interface

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Brain, 
  Play, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  Zap,
  Code,
  Cloud,
  FileText,
  Settings,
  ChevronRight
} from 'lucide-react';

interface CommandSuggestion {
  user_intent: string;
  ai_suggestion: {
    type: string;
    action: string;
    reasoning: string;
    alternatives: string[];
  };
  command: {
    success: boolean;
    command: string;
    explanation?: string;
    error?: string;
    follow_up_commands?: string[];
  };
  can_execute: boolean;
}

interface ExecutionResult {
  executed: boolean;
  success: boolean;
  command: string;
  output?: string;
  error?: string;
  timestamp: string;
}

interface CommandAssistantProps {
  className?: string;
  currentFile?: string;
  projectPath?: string;
  onCommandExecuted?: (result: ExecutionResult) => void;
}

export const CommandAssistant: React.FC<CommandAssistantProps> = ({ 
  className = '',
  currentFile,
  projectPath = '/Users/ryanvalley/Desktop/webboruso-five-pillars-v2',
  onCommandExecuted
}) => {
  const [userIntent, setUserIntent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<CommandSuggestion | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const [selectedCommandType, setSelectedCommandType] = useState<'auto' | 'claude_code' | 'google_cli' | 'terminal'>('auto');
  const [availableTools, setAvailableTools] = useState<string[]>([]);

  // Load available tools on mount
  useEffect(() => {
    loadAvailableTools();
  }, []);

  const loadAvailableTools = async () => {
    try {
      const response = await fetch('http://localhost:3006/commands/available-tools');
      const data = await response.json();
      setAvailableTools(data.available_tools || []);
    } catch (error) {
      console.error('Failed to load available tools:', error);
    }
  };

  const getSuggestion = async () => {
    if (!userIntent.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3006/commands/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_intent: userIntent,
          context: {
            file_path: currentFile,
            project_path: projectPath,
            target_technology: 'typescript'
          }
        })
      });

      const data = await response.json();
      setSuggestion(data);
    } catch (error) {
      console.error('Failed to get command suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCommand = async (command: string, type: string = 'terminal') => {
    try {
      const response = await fetch('http://localhost:3006/commands/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, type })
      });

      const result = await response.json();
      
      setExecutionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
      onCommandExecuted?.(result);
      
      return result;
    } catch (error) {
      console.error('Failed to execute command:', error);
      return { success: false, error: 'Execution failed' };
    }
  };

  const executeSpecificCommand = async (type: 'claude_code' | 'google_cloud', action: string) => {
    try {
      const endpoint = type === 'claude_code' ? '/commands/claude-code' : '/commands/google-cloud';
      
      const response = await fetch(`http://localhost:3006${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          file_path: currentFile,
          description: userIntent,
          project_id: 'vision-holder'
        })
      });

      const result = await response.json();
      
      if (result.executed) {
        setExecutionHistory(prev => [result.executed, ...prev.slice(0, 9)]);
        onCommandExecuted?.(result.executed);
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to execute ${type} command:`, error);
      return { success: false, error: 'Execution failed' };
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCommandTypeIcon = (type: string) => {
    switch (type) {
      case 'claude_code': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'google_cli': return <Cloud className="w-4 h-4 text-blue-500" />;
      case 'terminal': return <Terminal className="w-4 h-4 text-green-500" />;
      case 'file_operation': return <FileText className="w-4 h-4 text-orange-500" />;
      default: return <Settings className="w-4 h-4 text-gray-500" />;
    }
  };

  const getQuickActions = () => {
    const actions = [
      { label: 'Review Current File', intent: 'Review the current file for improvements and suggestions', type: 'claude_code' },
      { label: 'Fix Bugs', intent: 'Find and fix any bugs in the current file', type: 'claude_code' },
      { label: 'Generate Tests', intent: 'Create comprehensive tests for the current file', type: 'claude_code' },
      { label: 'Install Dependencies', intent: 'Install all project dependencies', type: 'terminal' },
      { label: 'Run Tests', intent: 'Run the project test suite', type: 'terminal' },
      { label: 'Build Project', intent: 'Build the project for production', type: 'terminal' },
      { label: 'Deploy to Cloud', intent: 'Deploy the project to Google Cloud', type: 'google_cli' }
    ];

    return actions.filter(action => {
      if (action.type === 'claude_code') return availableTools.includes('claude');
      if (action.type === 'google_cli') return availableTools.includes('gcloud');
      return true;
    });
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">
            Command Assistant
          </h3>
        </div>
        
        {/* Intent Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && getSuggestion()}
              placeholder="What would you like to do? (e.g., 'fix bugs in current file', 'deploy to cloud')"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm text-dyslexia-friendly focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={getSuggestion}
              disabled={!userIntent.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {getQuickActions().slice(0, 4).map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  setUserIntent(action.intent);
                  // Auto-suggest after setting intent
                  setTimeout(() => getSuggestion(), 100);
                }}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Command Suggestion */}
      {suggestion && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            {/* AI Reasoning */}
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-purple-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
                  <strong>AI Suggests:</strong> {suggestion.ai_suggestion.reasoning}
                </p>
              </div>
            </div>

            {/* Generated Command */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCommandTypeIcon(suggestion.ai_suggestion.type)}
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {suggestion.ai_suggestion.type.replace('_', ' ')} Command
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(suggestion.command.command)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title="Copy command"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {suggestion.can_execute && (
                    <button
                      onClick={() => executeCommand(suggestion.command.command, suggestion.ai_suggestion.type)}
                      className="p-1 text-green-500 hover:text-green-700"
                      title="Execute command"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              
              <code className="text-sm text-gray-800 dark:text-gray-200 font-mono break-all">
                {suggestion.command.command}
              </code>
              
              {suggestion.command.explanation && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-dyslexia-friendly">
                  {suggestion.command.explanation}
                </p>
              )}

              {suggestion.command.error && (
                <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">{suggestion.command.error}</span>
                </div>
              )}
            </div>

            {/* Follow-up Commands */}
            {suggestion.command.follow_up_commands && suggestion.command.follow_up_commands.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Follow-up commands:</p>
                {suggestion.command.follow_up_commands.map((cmd, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    <code className="text-xs text-gray-600 dark:text-gray-400 font-mono">{cmd}</code>
                    <button
                      onClick={() => executeCommand(cmd)}
                      className="p-1 text-blue-500 hover:text-blue-700"
                      title="Execute follow-up"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execution History */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 text-dyslexia-friendly">
            Recent Executions
          </h4>
          
          {executionHistory.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
              No commands executed yet
            </p>
          ) : (
            <div className="space-y-3">
              {executionHistory.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <code className="text-xs text-gray-600 dark:text-gray-400 font-mono block mb-2">
                    {result.command}
                  </code>
                  
                  {result.output && (
                    <pre className="text-xs text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                      {result.output}
                    </pre>
                  )}
                  
                  {result.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Error: {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Tools Indicator */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Available tools:</span>
          {availableTools.length === 0 ? (
            <span className="text-xs text-gray-500">Loading...</span>
          ) : (
            <div className="flex gap-1">
              {availableTools.includes('claude') && (
                <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded">
                  Claude Code
                </span>
              )}
              {availableTools.includes('gcloud') && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded">
                  Google CLI
                </span>
              )}
              <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded">
                Terminal
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandAssistant;