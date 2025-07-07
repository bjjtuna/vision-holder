'use client';

// [delight] Development Workspace Component
// Integrated development environment with AI collaboration

import React, { useState, useEffect, useRef } from 'react';
import { 
  Code, 
  FolderOpen, 
  Play, 
  Save, 
  Terminal, 
  Bot, 
  User,
  FileText,
  Folder,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Settings,
  GitBranch,
  Activity
} from 'lucide-react';
import { aiOrchestratorAPI } from '../services/[accelerate]-service-integration';
import { CommandAssistant } from './[delight]-command-assistant';

// Monaco Editor import (will be dynamically loaded)
declare global {
  interface Window {
    monaco: any;
  }
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
  modified?: boolean;
  size?: number;
}

interface WorkspaceTab {
  id: string;
  name: string;
  path: string;
  content: string;
  modified: boolean;
  language: string;
}

interface DevelopmentWorkspaceProps {
  className?: string;
  projectPath?: string;
}

export const DevelopmentWorkspace: React.FC<DevelopmentWorkspaceProps> = ({ 
  className = '',
  projectPath = '/Users/ryanvalley/Desktop/webboruso-five-pillars-v2'
}) => {
  // File Explorer State
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  // Editor State
  const [openTabs, setOpenTabs] = useState<WorkspaceTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  
  // AI Collaboration State
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [collaborationMode, setCollaborationMode] = useState<'observe' | 'suggest' | 'pair'>('observe');
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  // Terminal State
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [terminalHistoryIndex, setTerminalHistoryIndex] = useState(-1);
  
  // Layout State
  const [layout, setLayout] = useState({
    explorerWidth: 250,
    editorHeight: 60, // percentage
    chatWidth: 300,
    commandPanelHeight: 300
  });

  // Command Assistant State
  const [showCommandAssistant, setShowCommandAssistant] = useState(false);

  // Load Monaco Editor
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.monaco) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js';
      script.onload = () => {
        window.require.config({ 
          paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } 
        });
        window.require(['vs/editor/editor.main'], () => {
          setMonacoLoaded(true);
        });
      };
      document.head.appendChild(script);
    } else if (window.monaco) {
      setMonacoLoaded(true);
    }
  }, []);

  // Initialize file tree
  useEffect(() => {
    loadFileTree();
  }, [projectPath]);

  // Initialize Monaco editor when loaded
  useEffect(() => {
    if (monacoLoaded && activeTab && !editorRef.current) {
      initializeEditor();
    }
  }, [monacoLoaded, activeTab]);

  const loadFileTree = async () => {
    try {
      // Mock file structure for now - in production, this would read actual files
      const mockFileTree: FileNode[] = [
        {
          name: '04_impl',
          path: '04_impl',
          type: 'directory',
          children: [
            {
              name: 'vision-holder-app',
              path: '04_impl/vision-holder-app',
              type: 'directory',
              children: [
                {
                  name: 'app',
                  path: '04_impl/vision-holder-app/app',
                  type: 'directory',
                  children: [
                    {
                      name: 'page.tsx',
                      path: '04_impl/vision-holder-app/app/page.tsx',
                      type: 'file',
                      size: 1024
                    },
                    {
                      name: 'layout.tsx',
                      path: '04_impl/vision-holder-app/app/layout.tsx',
                      type: 'file',
                      size: 2048
                    }
                  ]
                },
                {
                  name: 'package.json',
                  path: '04_impl/vision-holder-app/package.json',
                  type: 'file',
                  size: 512
                }
              ]
            },
            {
              name: 'backend',
              path: '04_impl/backend',
              type: 'directory',
              children: [
                {
                  name: '[accelerate]-ai-orchestrator-api.ts',
                  path: '04_impl/backend/[accelerate]-ai-orchestrator-api.ts',
                  type: 'file',
                  size: 15360
                }
              ]
            }
          ]
        }
      ];
      
      setFileTree(mockFileTree);
      setExpandedDirs(new Set(['04_impl', '04_impl/vision-holder-app']));
    } catch (error) {
      console.error('Failed to load file tree:', error);
    }
  };

  const initializeEditor = () => {
    if (!window.monaco || !monacoLoaded) return;

    const container = document.getElementById('monaco-editor');
    if (!container) return;

    editorRef.current = window.monaco.editor.create(container, {
      value: openTabs.find(tab => tab.id === activeTab)?.content || '',
      language: getLanguageFromPath(openTabs.find(tab => tab.id === activeTab)?.path || ''),
      theme: 'vs-dark',
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      accessibilitySupport: 'on'
    });

    // Listen for content changes
    editorRef.current.onDidChangeModelContent(() => {
      const activeTabData = openTabs.find(tab => tab.id === activeTab);
      if (activeTabData) {
        const newContent = editorRef.current.getValue();
        updateTabContent(activeTab!, newContent);
        
        // AI collaboration suggestions
        if (collaborationMode === 'suggest' || collaborationMode === 'pair') {
          debounceAiSuggestions(newContent);
        }
      }
    });

    monacoRef.current = window.monaco;
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx': return 'typescript';
      case 'js':
      case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'py': return 'python';
      default: return 'plaintext';
    }
  };

  const debounceAiSuggestions = (() => {
    let timeout: NodeJS.Timeout;
    return (content: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        getAiSuggestions(content);
      }, 1000);
    };
  })();

  const getAiSuggestions = async (content: string) => {
    if (isAiTyping) return;
    
    setIsAiTyping(true);
    try {
      const response = await aiOrchestratorAPI.post('/orchestrator/chat', {
        message: `Please analyze this code and provide 3 brief suggestions for improvement:\n\n${content}`,
        context: { type: 'code_review', file: activeTab }
      });
      
      const suggestions = response.response.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
      setAiSuggestions(suggestions.slice(0, 3));
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    } finally {
      setIsAiTyping(false);
    }
  };

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const openFile = async (filePath: string) => {
    const existingTab = openTabs.find(tab => tab.path === filePath);
    
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    try {
      // In production, this would read the actual file content
      const mockContent = `// File: ${filePath}\n// This is a placeholder for actual file content\n\nexport default function Component() {\n  return (\n    <div>\n      <h1>Hello from ${filePath.split('/').pop()}</h1>\n    </div>\n  );\n}`;
      
      const newTab: WorkspaceTab = {
        id: `tab-${Date.now()}`,
        name: filePath.split('/').pop() || 'Unknown',
        path: filePath,
        content: mockContent,
        modified: false,
        language: getLanguageFromPath(filePath)
      };

      setOpenTabs(prev => [...prev, newTab]);
      setActiveTab(newTab.id);
      setSelectedFile(filePath);
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  const closeTab = (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (tab?.modified) {
      if (!confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) {
        return;
      }
    }

    setOpenTabs(prev => prev.filter(t => t.id !== tabId));
    
    if (activeTab === tabId) {
      const remainingTabs = openTabs.filter(t => t.id !== tabId);
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null);
    }
  };

  const updateTabContent = (tabId: string, content: string) => {
    setOpenTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, modified: content !== tab.content }
        : tab
    ));
  };

  const saveFile = async (tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) return;

    try {
      // In production, this would save to actual file system
      console.log(`Saving ${tab.path}:`, tab.content);
      
      setOpenTabs(prev => prev.map(t => 
        t.id === tabId ? { ...t, modified: false } : t
      ));
      
      addTerminalOutput(`✅ Saved ${tab.name}`);
    } catch (error) {
      console.error('Failed to save file:', error);
      addTerminalOutput(`❌ Failed to save ${tab.name}`);
    }
  };

  const runCode = async () => {
    const activeTabData = openTabs.find(tab => tab.id === activeTab);
    if (!activeTabData) return;

    addTerminalOutput(`🚀 Running ${activeTabData.name}...`);
    
    try {
      // Mock code execution - in production, this would run actual code
      setTimeout(() => {
        addTerminalOutput(`✅ ${activeTabData.name} executed successfully`);
        addTerminalOutput(`📝 Output: Hello World!`);
      }, 1000);
    } catch (error) {
      addTerminalOutput(`❌ Execution failed: ${error}`);
    }
  };

  const addTerminalOutput = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const executeTerminalCommand = async (command: string) => {
    if (!command.trim()) return;

    setTerminalHistory(prev => [...prev, command]);
    setTerminalHistoryIndex(-1);
    addTerminalOutput(`$ ${command}`);

    try {
      // Mock command execution - in production, this would execute real commands
      switch (command.toLowerCase()) {
        case 'ls':
          addTerminalOutput('package.json  app/  components/  services/');
          break;
        case 'pwd':
          addTerminalOutput(projectPath);
          break;
        case 'npm install':
          addTerminalOutput('Installing dependencies...');
          setTimeout(() => addTerminalOutput('✅ Dependencies installed'), 1500);
          break;
        default:
          addTerminalOutput(`Command not found: ${command}`);
      }
    } catch (error) {
      addTerminalOutput(`Error: ${error}`);
    }

    setTerminalInput('');
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.path} style={{ marginLeft: `${depth * 16}px` }}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-sm ${
            selectedFile === node.path ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          onClick={() => {
            if (node.type === 'directory') {
              toggleDirectory(node.path);
            } else {
              openFile(node.path);
            }
          }}
        >
          {node.type === 'directory' ? (
            <>
              {expandedDirs.has(node.path) ? (
                <ChevronDown className="w-3 h-3 mr-1" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1" />
              )}
              <Folder className="w-4 h-4 mr-2 text-blue-500" />
            </>
          ) : (
            <>
              <div className="w-4 mr-2" />
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
            </>
          )}
          <span className="text-dyslexia-friendly">{node.name}</span>
          {node.type === 'file' && node.size && (
            <span className="ml-auto text-xs text-gray-400">
              {(node.size / 1024).toFixed(1)}KB
            </span>
          )}
        </div>
        {node.type === 'directory' && node.children && expandedDirs.has(node.path) && (
          <div>
            {renderFileTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={`h-full flex ${className}`}>
      {/* File Explorer */}
      <div 
        className="border-r border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex flex-col"
        style={{ width: layout.explorerWidth }}
      >
        <div className="p-3 border-b border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Explorer</h3>
            <div className="flex gap-1">
              <button
                onClick={loadFileTree}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Refresh"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
              <button
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="New File"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {renderFileTree(fileTree)}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Tabs */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 min-h-[40px]">
          {openTabs.map(tab => (
            <div
              key={tab.id}
              className={`flex items-center px-4 py-2 border-r border-gray-300 dark:border-gray-600 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-sm text-dyslexia-friendly mr-2">
                {tab.name}
                {tab.modified && ' •'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-500 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Editor Toolbar */}
        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
          <div className="flex gap-2">
            <button
              onClick={() => activeTab && saveFile(activeTab)}
              disabled={!activeTab || !openTabs.find(t => t.id === activeTab)?.modified}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              onClick={runCode}
              disabled={!activeTab}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-1" />
              Run
            </button>
            <button
              onClick={() => setShowCommandAssistant(!showCommandAssistant)}
              className={`flex items-center px-3 py-1 rounded transition-colors ${
                showCommandAssistant 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Settings className="w-4 h-4 mr-1" />
              Commands
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">AI Mode:</span>
            <select
              value={collaborationMode}
              onChange={(e) => setCollaborationMode(e.target.value as any)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
            >
              <option value="observe">Observe</option>
              <option value="suggest">Suggest</option>
              <option value="pair">Pair Program</option>
            </select>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative">
          {activeTab ? (
            <div className="h-full w-full">
              <div 
                id="monaco-editor" 
                className="h-full w-full"
                style={{ height: '100%' }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
                  Select a file to start editing
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Terminal */}
        <div className="h-48 border-t border-gray-300 dark:border-gray-600 bg-black text-green-400 font-mono">
          <div className="flex items-center justify-between p-2 bg-gray-800 text-white">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span className="text-sm">Terminal</span>
            </div>
            <button
              onClick={() => setTerminalOutput([])}
              className="text-xs hover:text-gray-300"
            >
              Clear
            </button>
          </div>
          <div className="h-32 overflow-y-auto p-2 text-sm">
            {terminalOutput.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          <div className="flex items-center p-2 border-t border-gray-700">
            <span className="mr-2">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  executeTerminalCommand(terminalInput);
                } else if (e.key === 'ArrowUp') {
                  if (terminalHistory.length > 0) {
                    const newIndex = Math.min(terminalHistoryIndex + 1, terminalHistory.length - 1);
                    setTerminalHistoryIndex(newIndex);
                    setTerminalInput(terminalHistory[terminalHistory.length - 1 - newIndex]);
                  }
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-green-400"
              placeholder="Type a command..."
            />
          </div>
        </div>

        {/* Command Assistant Panel */}
        {showCommandAssistant && (
          <div 
            className="border-t border-gray-300 dark:border-gray-600"
            style={{ height: layout.commandPanelHeight }}
          >
            <CommandAssistant
              className="h-full"
              currentFile={openTabs.find(tab => tab.id === activeTab)?.path}
              projectPath="/Users/ryanvalley/Desktop/webboruso-five-pillars-v2"
              onCommandExecuted={(result) => {
                if (result.output) {
                  addTerminalOutput(`✅ Command executed: ${result.command}`);
                  addTerminalOutput(result.output);
                } else if (result.error) {
                  addTerminalOutput(`❌ Command failed: ${result.error}`);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* AI Collaboration Panel */}
      {(collaborationMode === 'suggest' || collaborationMode === 'pair') && (
        <div 
          className="border-l border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
          style={{ width: layout.chatWidth }}
        >
          <div className="p-3 border-b border-gray-300 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">
                AI Assistant
              </h3>
              {isAiTyping && (
                <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
              )}
            </div>
          </div>
          
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
              Code Suggestions:
            </h4>
            {aiSuggestions.length > 0 ? (
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900 rounded text-sm">
                    <p className="text-gray-800 dark:text-gray-200 text-dyslexia-friendly">
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-dyslexia-friendly">
                Start coding to see AI suggestions
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevelopmentWorkspace;