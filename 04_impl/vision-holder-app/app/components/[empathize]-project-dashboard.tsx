'use client';

// [empathize] Project Progress Dashboard
// Visual tracking and analytics for project development

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  GitCommit,
  Code,
  FileText,
  Users,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Brain,
  Trophy
} from 'lucide-react';

interface ProjectMetrics {
  completion: number;
  filesModified: number;
  linesOfCode: number;
  commits: number;
  aiInteractions: number;
  timeSpent: number; // minutes
  goals: {
    completed: number;
    total: number;
  };
  velocity: {
    thisWeek: number;
    lastWeek: number;
  };
}

interface ProgressItem {
  id: string;
  title: string;
  category: 'frontend' | 'backend' | 'integration' | 'testing' | 'documentation';
  progress: number;
  status: 'completed' | 'in_progress' | 'blocked' | 'pending';
  timeEstimate: string;
  priority: 'high' | 'medium' | 'low';
  assignee: 'user' | 'ai' | 'both';
}

interface ProjectDashboardProps {
  className?: string;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    completion: 67,
    filesModified: 45,
    linesOfCode: 8432,
    commits: 23,
    aiInteractions: 156,
    timeSpent: 1240,
    goals: { completed: 8, total: 12 },
    velocity: { thisWeek: 15, lastWeek: 12 }
  });

  const [progressItems, setProgressItems] = useState<ProgressItem[]>([
    {
      id: '1',
      title: 'Development Workspace Integration',
      category: 'frontend',
      progress: 100,
      status: 'completed',
      timeEstimate: '4h',
      priority: 'high',
      assignee: 'ai'
    },
    {
      id: '2',
      title: 'AI Chat Interface Enhancement',
      category: 'integration',
      progress: 85,
      status: 'in_progress',
      timeEstimate: '2h',
      priority: 'high',
      assignee: 'both'
    },
    {
      id: '3',
      title: 'File Upload Security',
      category: 'backend',
      progress: 90,
      status: 'in_progress',
      timeEstimate: '1h',
      priority: 'medium',
      assignee: 'ai'
    },
    {
      id: '4',
      title: 'Visual Progress Dashboard',
      category: 'frontend',
      progress: 95,
      status: 'in_progress',
      timeEstimate: '30m',
      priority: 'high',
      assignee: 'ai'
    },
    {
      id: '5',
      title: 'Terminal Integration Testing',
      category: 'testing',
      progress: 20,
      status: 'pending',
      timeEstimate: '3h',
      priority: 'medium',
      assignee: 'user'
    },
    {
      id: '6',
      title: 'API Documentation Update',
      category: 'documentation',
      progress: 45,
      status: 'in_progress',
      timeEstimate: '2h',
      priority: 'low',
      assignee: 'ai'
    }
  ]);

  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'timeline'>('overview');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'bg-blue-500';
      case 'backend': return 'bg-green-500';
      case 'integration': return 'bg-purple-500';
      case 'testing': return 'bg-yellow-500';
      case 'documentation': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'blocked': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'pending': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getAssigneeIcon = (assignee: string) => {
    switch (assignee) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'ai': return <Brain className="w-4 h-4" />;
      case 'both': return <Zap className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const velocityChange = ((metrics.velocity.thisWeek - metrics.velocity.lastWeek) / metrics.velocity.lastWeek * 100).toFixed(1);

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-dyslexia-friendly">
            Project Dashboard
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeView === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('detailed')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeView === 'detailed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeView === 'timeline' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Project Progress</p>
                <p className="text-2xl font-bold">{metrics.completion}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Goals Complete</p>
                <p className="text-2xl font-bold">{metrics.goals.completed}/{metrics.goals.total}</p>
              </div>
              <Trophy className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">AI Interactions</p>
                <p className="text-2xl font-bold">{metrics.aiInteractions}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Time Spent</p>
                <p className="text-2xl font-bold">{formatTime(metrics.timeSpent)}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Overview */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
                Progress Overview
              </h3>
              <div className="space-y-4">
                {progressItems.slice(0, 4).map(item => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(item.category)}`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white text-dyslexia-friendly">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getCategoryColor(item.category)}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Velocity Chart */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
                Development Velocity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(metrics.velocity.thisWeek / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {metrics.velocity.thisWeek}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Week</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gray-400 h-2 rounded-full"
                        style={{ width: `${(metrics.velocity.lastWeek / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {metrics.velocity.lastWeek}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <TrendingUp className={`w-4 h-4 ${parseFloat(velocityChange) > 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm font-medium ${parseFloat(velocityChange) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(velocityChange) > 0 ? '+' : ''}{velocityChange}% from last week
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.filesModified}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Files Modified</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Code className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.linesOfCode.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lines of Code</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <GitCommit className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.commits}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Commits</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-6 h-6 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(metrics.timeSpent / 60)}h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Time</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white text-dyslexia-friendly">
                      Development Workspace Integration completed
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white text-dyslexia-friendly">
                      AI provided 15 code suggestions
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Code className="w-4 h-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white text-dyslexia-friendly">
                      Modified 3 files in workspace component
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">8 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GitCommit className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white text-dyslexia-friendly">
                      Committed changes to main branch
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">12 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'detailed' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
                All Tasks
              </h3>
              <div className="space-y-4">
                {progressItems.map(item => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getCategoryColor(item.category)}`} />
                        <h4 className="font-medium text-gray-900 dark:text-white text-dyslexia-friendly">
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        <span className={`text-sm ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {getAssigneeIcon(item.assignee)}
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {item.assignee}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.timeEstimate}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.progress}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getCategoryColor(item.category)}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'timeline' && (
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
              Project Timeline
            </h3>
            <div className="space-y-6">
              {progressItems
                .sort((a, b) => b.progress - a.progress)
                .map((item, index) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 border-white ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'in_progress' ? 'bg-blue-500' :
                        item.status === 'blocked' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      {index < progressItems.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-300 dark:bg-gray-600 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-dyslexia-friendly">
                          {item.title}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.progress}% complete
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span className="capitalize">{item.assignee}</span>
                        <span>•</span>
                        <span>{item.timeEstimate}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;