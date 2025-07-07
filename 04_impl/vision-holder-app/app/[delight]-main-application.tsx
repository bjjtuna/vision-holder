'use client';

// [delight] Main Application Component
// Integrates roadmap and chat interfaces for complete Vision Holder experience

import React, { useState, useEffect } from 'react';
// NOTE: SystemicLedgerAPI and aiOrchestrator are backend services
// For now, we'll use the service integration layer instead
import { RoadmapView } from './components/[empathize]-roadmap-view';
import { ChatInterface } from './components/[empathize]-chat-interface';
import { WisdomMemoryView } from './components/[empathize]-wisdom-memory-view';
import { KnowledgeBaseView } from './components/[accelerate]-knowledge-base-view';
import { TerminalView } from './components/[safeguard]-terminal-view';
import { DevelopmentWorkspace } from './components/[delight]-development-workspace';
import { ProjectDashboard } from './components/[empathize]-project-dashboard';
import { 
  Map, 
  MessageCircle, 
  Brain, 
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  AlertCircle,
  Loader,
  Code,
  BarChart3
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { OnboardingWizard } from '../components/[delight]-onboarding-wizard';
import { OnboardingTooltip } from '../components/[empathize]-onboarding-tooltip';

interface MainApplicationProps {
  className?: string;
}

type ActiveTab = 'dashboard' | 'workspace' | 'roadmap' | 'chat' | 'wisdom' | 'knowledge' | 'terminal';

// Mock user ID for development
const MOCK_USER_ID = `user-${Date.now()}`;

export const MainApplication: React.FC<MainApplicationProps> = ({ className = '' }) => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ ledger: boolean; orchestrator: boolean }>({
    ledger: false,
    orchestrator: false
  });

  // Initialize API client using service integration
  // const ledgerAPI = new SystemicLedgerAPI(); // Commented out - using service integration instead

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('vision-holder-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('vision-holder-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    // Check API health on component mount
    const checkAPIHealth = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check ledger API using fetch directly
        const response = await fetch('http://localhost:3001/health');
        const ledgerHealthy = response.ok;
        setApiStatus(prev => ({ ...prev, ledger: ledgerHealthy }));
        
        // Check orchestrator API 
        const orchestratorResponse = await fetch('http://localhost:3002/health');
        const orchestratorHealthy = orchestratorResponse.ok;
        setApiStatus(prev => ({ ...prev, orchestrator: orchestratorHealthy }));
        
        if (!ledgerHealthy) {
          setError('Systemic Ledger API is not responding. Some features may be limited.');
        }
      } catch (err) {
        console.error('API health check failed:', err);
        setError('Unable to connect to backend services. Please check if the backend is running.');
        setApiStatus({ ledger: false, orchestrator: false });
      } finally {
        setIsLoading(false);
      }
    };

    checkAPIHealth();
  }, []);

  // Check if onboarding is completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const response = await fetch('http://localhost:3002/onboarding/state', {
          headers: { 'x-mock-user': MOCK_USER_ID }
        });
        const { data } = await response.json();
        setShowOnboarding(!data.completed_at);
      } catch (err) {
        console.error('Failed to check onboarding state:', err);
      }
    };
    checkOnboarding();
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Switch to component tab when onboarding step changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as ActiveTab);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewEntry = async (entry: any) => {
    try {
      // Add entry to ledger via API using fetch
      await fetch('http://localhost:3001/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      console.log('New entry created:', entry);
      // Refresh roadmap data
      setSelectedEntry(null);
    } catch (error) {
      console.error('Failed to create entry:', error);
      setError('Failed to save entry. Please try again.');
    }
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
              Connecting to Vision Holder services...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
              Connection Issue
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <ProjectDashboard className="h-full" />
        );
      case 'workspace':
        return (
          <DevelopmentWorkspace className="h-full" />
        );
      case 'roadmap':
        return (
          <OnboardingTooltip component="roadmap" userId={MOCK_USER_ID}>
            <RoadmapView 
              onEntrySelect={setSelectedEntry}
              className="h-full"
            />
          </OnboardingTooltip>
        );
      case 'chat':
        return (
          <OnboardingTooltip component="chat" userId={MOCK_USER_ID}>
            <ChatInterface 
              onNewEntry={handleNewEntry}
              className="h-full"
              systemicLedger={{
                mission: {
                  text: "Achieve product-market fit for the Alpha release",
                  seek: "validate",
                  why: "To ensure we are building something people want before scaling"
                },
                pillars: [
                  {
                    text: "User Experience",
                    seek: "empathize",
                    why: "Understand user needs deeply"
                  },
                  {
                    text: "Technical Excellence",
                    seek: "accelerate",
                    why: "Build robust, scalable solutions"
                  }
                ]
              }}
            />
          </OnboardingTooltip>
        );
      case 'wisdom':
        return (
          <WisdomMemoryView className="h-full" />
        );
      case 'knowledge':
        return (
          <OnboardingTooltip component="knowledge" userId={MOCK_USER_ID}>
            <KnowledgeBaseView className="h-full" />
          </OnboardingTooltip>
        );
      case 'terminal':
        return (
          <OnboardingTooltip component="terminal" userId={MOCK_USER_ID}>
            <TerminalView className="h-full" />
          </OnboardingTooltip>
        );
      default:
        return null;
    }
  };

  const tabConfig = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'workspace' as ActiveTab, label: 'Dev Workspace', icon: Code },
    { id: 'roadmap' as ActiveTab, label: 'Roadmap', icon: Map },
    { id: 'chat' as ActiveTab, label: 'Co-Vision Chat', icon: MessageCircle },
    { id: 'wisdom' as ActiveTab, label: 'Wisdom Memory', icon: Brain },
    { id: 'knowledge' as ActiveTab, label: 'Knowledge Base', icon: Brain },
    { id: 'terminal' as ActiveTab, label: 'Terminal Status', icon: Brain }
  ];

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Onboarding wizard */}
      {showOnboarding && (
        <OnboardingWizard
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h1 className="font-bold text-gray-900 dark:text-white text-dyslexia-friendly">
                Vision Holder
              </h1>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-dyslexia-friendly ${
                      activeTab === tab.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {isSidebarOpen && (
                      <span className="font-medium">{tab.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <span className="text-sm text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
                Settings
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">
                {tabConfig.find(tab => tab.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
                {activeTab === 'dashboard' && 'Visual project progress and performance metrics'}
                {activeTab === 'workspace' && 'Integrated development environment with AI collaboration'}
                {activeTab === 'roadmap' && 'Visual overview of your project structure'}
                {activeTab === 'chat' && 'AI-powered project management assistant'}
                {activeTab === 'wisdom' && 'User preferences and insights'}
                {activeTab === 'knowledge' && 'Project files and research'}
                {activeTab === 'terminal' && 'System status and integration'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
                {typeof window !== 'undefined' ? new Date().toLocaleDateString() : ''}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="workspace">Dev Workspace</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="chat">Co-Vision Chat</TabsTrigger>
              <TabsTrigger value="wisdom">Wisdom Memory</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              {renderTabContent()}
            </TabsContent>

            <TabsContent value="workspace">
              {renderTabContent()}
            </TabsContent>

            <TabsContent value="roadmap">
              {renderTabContent()}
            </TabsContent>

            <TabsContent value="chat">
              {renderTabContent()}
            </TabsContent>

            <TabsContent value="wisdom">
              {renderTabContent()}
            </TabsContent>

            <TabsContent value="knowledge">
              {renderTabContent()}
            </TabsContent>

            <TabsContent value="terminal">
              {renderTabContent()}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default MainApplication; 