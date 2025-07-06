'use client';

// [delight] Main Application Component
// Integrates roadmap and chat interfaces for complete Vision Holder experience

import React, { useState, useEffect } from 'react';
import { systemicLedgerAPI } from './app/services/[accelerate]-service-integration';
import { RoadmapView } from './app/components/[empathize]-roadmap-view';
import { ChatInterface } from './app/components/[empathize]-chat-interface';
import { TerminalView } from './app/components/[safeguard]-terminal-view';
import { OnboardingWizard } from './components/[delight]-onboarding-wizard';
import { AccessibilityAudit } from './components/[empathize]-accessibility-checklist';
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
  Loader
} from 'lucide-react';

interface MainApplicationProps {
  className?: string;
}

type ActiveTab = 'roadmap' | 'chat' | 'wisdom' | 'knowledge' | 'terminal' | 'accessibility';

export const MainApplication: React.FC<MainApplicationProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('roadmap');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ ledger: boolean; orchestrator: boolean }>({
    ledger: false,
    orchestrator: false
  });
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // API client is imported from service integration

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('vision-holder-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Check if user has seen welcome message
    const hasSeenWelcome = localStorage.getItem('vision-holder-welcome-seen');
    if (hasSeenWelcome === 'true') {
      setShowWelcome(false);
      setHasSeenWelcome(true);
    }
    
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem('vision-holder-onboarding-completed');
    if (hasCompletedOnboarding !== 'true') {
      setShowOnboarding(true);
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Escape key to dismiss welcome message
      if (event.key === 'Escape' && showWelcome) {
        dismissWelcome();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showWelcome]);

  useEffect(() => {
    // Check API health on component mount
    const checkAPIHealth = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Starting API health check...');
        // Check ledger API using service integration
        const ledgerResponse = await systemicLedgerAPI.get('/health');
        console.log('Ledger API health check result:', ledgerResponse);
        setApiStatus(prev => ({ ...prev, ledger: true }));
        
        // TODO: Add orchestrator API health check when implemented
        setApiStatus(prev => ({ ...prev, orchestrator: true }));
        
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const dismissWelcome = () => {
    setShowWelcome(false);
    setHasSeenWelcome(true);
    localStorage.setItem('vision-holder-welcome-seen', 'true');
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('vision-holder-onboarding-completed', 'true');
  };

  const handleNewEntry = async (entry: any) => {
    try {
      // Add entry to ledger via API
      await systemicLedgerAPI.post('/ledger/entries', entry);
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
      case 'roadmap':
        return (
          <RoadmapView 
            onEntrySelect={setSelectedEntry}
            className="h-full"
          />
        );
      case 'chat':
        return (
          <ChatInterface 
            onNewEntry={handleNewEntry}
            className="h-full"
          />
        );
      case 'wisdom':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
                Wisdom Memory
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
                Coming soon - User preferences and insights
              </p>
            </div>
          </div>
        );
      case 'knowledge':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
                Knowledge Base
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
                Coming soon - Project files and research
              </p>
            </div>
          </div>
        );
      case 'terminal':
        return (
          <TerminalView className="h-full" />
        );
      case 'accessibility':
        return (
          <AccessibilityAudit className="h-full" />
        );
      default:
        return null;
    }
  };

  const tabConfig = [
    { id: 'roadmap' as ActiveTab, label: 'Roadmap', icon: Map },
    { id: 'chat' as ActiveTab, label: 'Co-Vision Chat', icon: MessageCircle },
    { id: 'wisdom' as ActiveTab, label: 'Wisdom Memory', icon: Brain },
    { id: 'knowledge' as ActiveTab, label: 'Knowledge Base', icon: Brain },
    { id: 'terminal' as ActiveTab, label: 'Terminal Status', icon: Brain },
    { id: 'accessibility' as ActiveTab, label: 'Accessibility', icon: Brain }
  ];

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Welcome Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl mx-4 shadow-xl">
            <div className="text-center mb-6">
              <Brain className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
                Welcome to Vision Holder
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
                Your AI-powered coding assistant for neurodiverse developers
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Roadmap View</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">Visualize your project structure with clear hierarchy and progress tracking</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-secondary-600 dark:text-secondary-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Co-Vision Chat</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">Talk to your AI assistant with voice input and file uploads</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-success-600 dark:text-success-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Terminal Status</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">Monitor system health and API connections in real-time</p>
                </div>
              </div>
            </div>
            
                    <div className="flex justify-center space-x-4">
          <button
            onClick={dismissWelcome}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-dyslexia-friendly font-medium"
          >
            Get Started
          </button>
          <button
            onClick={() => {
              dismissWelcome();
              setShowOnboarding(true);
            }}
            className="px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-dyslexia-friendly font-medium"
          >
            Take Tutorial
          </button>
        </div>
      </div>
    </div>
  )}

      {/* Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onComplete={completeOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
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
              <div className="flex flex-col space-y-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
                  Settings
                </span>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors text-dyslexia-friendly"
                >
                  Restart Tutorial
                </button>
              </div>
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
                {activeTab === 'roadmap' && 'Visual overview of your project structure'}
                {activeTab === 'chat' && 'AI-powered project management assistant'}
                {activeTab === 'wisdom' && 'User preferences and insights'}
                {activeTab === 'knowledge' && 'Project files and research'}
                {activeTab === 'terminal' && 'System status and integration'}
                {activeTab === 'accessibility' && 'WCAG 2.1 AA compliance audit'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* API Status Indicators */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${apiStatus.ledger ? 'bg-green-500' : 'bg-red-500'}`} title="Systemic Ledger API"></div>
                <div className={`w-2 h-2 rounded-full ${apiStatus.orchestrator ? 'bg-green-500' : 'bg-red-500'}`} title="AI Orchestrator API"></div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default MainApplication; 