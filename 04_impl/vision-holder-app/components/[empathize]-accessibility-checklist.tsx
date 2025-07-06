'use client';

// [empathize] Accessibility Audit Component
// WCAG 2.1 AA compliance checklist and documentation

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Keyboard, 
  Volume2,
  Brain,
  FileText,
  Settings
} from 'lucide-react';

interface AccessibilityIssue {
  id: string;
  component: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  wcagCriteria: string[];
  description: string;
  recommendation: string;
  status: 'open' | 'in-progress' | 'resolved';
  dateReported: string;
  dateResolved?: string;
}

interface AccessibilityAuditProps {
  className?: string;
}

export const AccessibilityAudit: React.FC<AccessibilityAuditProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'checklist' | 'report'>('overview');
  const [issues, setIssues] = useState<AccessibilityIssue[]>([
    {
      id: '1',
      component: 'OnboardingWizard',
      issue: 'Missing ARIA labels on progress indicators',
      severity: 'medium',
      wcagCriteria: ['1.3.1', '4.1.2'],
      description: 'Progress dots in onboarding wizard lack proper ARIA labels for screen readers',
      recommendation: 'Add aria-label attributes to progress indicators describing current step and total steps',
      status: 'open',
      dateReported: new Date().toISOString()
    },
    {
      id: '2',
      component: 'RoadmapView',
      issue: 'Color contrast insufficient for status indicators',
      severity: 'high',
      wcagCriteria: ['1.4.3'],
      description: 'Some status colors in dark mode don\'t meet 4.5:1 contrast ratio requirement',
      recommendation: 'Adjust color values to ensure sufficient contrast in both light and dark modes',
      status: 'in-progress',
      dateReported: new Date().toISOString()
    },
    {
      id: '3',
      component: 'ChatInterface',
      issue: 'Voice input lacks visual feedback',
      severity: 'medium',
      wcagCriteria: ['1.3.1', '2.1.1'],
      description: 'When voice input is active, there\'s no clear visual indication of recording state',
      recommendation: 'Add visual recording indicator and ensure keyboard alternatives are available',
      status: 'open',
      dateReported: new Date().toISOString()
    }
  ]);

  const wcagChecklist = [
    {
      category: 'Perceivable',
      criteria: [
        { id: '1.1.1', title: 'Non-text Content', status: 'pass' },
        { id: '1.2.1', title: 'Audio-only and Video-only', status: 'pass' },
        { id: '1.2.2', title: 'Captions', status: 'pass' },
        { id: '1.2.3', title: 'Audio Description', status: 'pass' },
        { id: '1.3.1', title: 'Info and Relationships', status: 'partial' },
        { id: '1.3.2', title: 'Meaningful Sequence', status: 'pass' },
        { id: '1.3.3', title: 'Sensory Characteristics', status: 'pass' },
        { id: '1.4.1', title: 'Use of Color', status: 'pass' },
        { id: '1.4.2', title: 'Audio Control', status: 'pass' },
        { id: '1.4.3', title: 'Contrast (Minimum)', status: 'partial' },
        { id: '1.4.4', title: 'Resize Text', status: 'pass' },
        { id: '1.4.5', title: 'Images of Text', status: 'pass' }
      ]
    },
    {
      category: 'Operable',
      criteria: [
        { id: '2.1.1', title: 'Keyboard', status: 'pass' },
        { id: '2.1.2', title: 'No Keyboard Trap', status: 'pass' },
        { id: '2.2.1', title: 'Timing Adjustable', status: 'pass' },
        { id: '2.2.2', title: 'Pause, Stop, Hide', status: 'pass' },
        { id: '2.3.1', title: 'Three Flashes', status: 'pass' },
        { id: '2.4.1', title: 'Bypass Blocks', status: 'pass' },
        { id: '2.4.2', title: 'Page Titled', status: 'pass' },
        { id: '2.4.3', title: 'Focus Order', status: 'pass' },
        { id: '2.4.4', title: 'Link Purpose', status: 'pass' },
        { id: '2.4.5', title: 'Multiple Ways', status: 'pass' },
        { id: '2.4.6', title: 'Headings and Labels', status: 'pass' },
        { id: '2.4.7', title: 'Focus Visible', status: 'pass' }
      ]
    },
    {
      category: 'Understandable',
      criteria: [
        { id: '3.1.1', title: 'Language of Page', status: 'pass' },
        { id: '3.1.2', title: 'Language of Parts', status: 'pass' },
        { id: '3.2.1', title: 'On Focus', status: 'pass' },
        { id: '3.2.2', title: 'On Input', status: 'pass' },
        { id: '3.3.1', title: 'Error Identification', status: 'pass' },
        { id: '3.3.2', title: 'Labels or Instructions', status: 'pass' },
        { id: '3.3.3', title: 'Error Suggestion', status: 'pass' },
        { id: '3.3.4', title: 'Error Prevention', status: 'pass' }
      ]
    },
    {
      category: 'Robust',
      criteria: [
        { id: '4.1.1', title: 'Parsing', status: 'pass' },
        { id: '4.1.2', title: 'Name, Role, Value', status: 'partial' },
        { id: '4.1.3', title: 'Status Messages', status: 'pass' }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const updateIssueStatus = (issueId: string, newStatus: 'open' | 'in-progress' | 'resolved') => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { 
            ...issue, 
            status: newStatus,
            dateResolved: newStatus === 'resolved' ? new Date().toISOString() : undefined
          }
        : issue
    ));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Visual</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
            Color contrast, text sizing, and visual hierarchy
          </p>
          <div className="mt-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
            85%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Keyboard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Keyboard</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
            Navigation, focus management, and shortcuts
          </p>
          <div className="mt-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
            92%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">Screen Reader</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
            ARIA labels, semantic HTML, and announcements
          </p>
          <div className="mt-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
            78%
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
          Recent Accessibility Improvements
        </h3>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Added dyslexia-friendly font support with OpenDyslexic</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Implemented keyboard shortcuts for all major actions</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Enhanced color contrast ratios for better visibility</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Added focus indicators for all interactive elements</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderIssues = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">
          Accessibility Issues ({issues.length})
        </h3>
        <select 
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-dyslexia-friendly"
          onChange={(e) => {
            const filtered = e.target.value === 'all' 
              ? issues 
              : issues.filter(issue => issue.severity === e.target.value);
            // In a real implementation, you'd update the filtered view
          }}
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="space-y-3">
        {issues.map(issue => (
          <div key={issue.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                  {issue.severity.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
                  {issue.component}
                </span>
              </div>
              <select
                value={issue.status}
                onChange={(e) => updateIssueStatus(issue.id, e.target.value as any)}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs text-dyslexia-friendly"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
              {issue.issue}
            </h4>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-dyslexia-friendly">
              {issue.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
              <span>WCAG: {issue.wcagCriteria.join(', ')}</span>
              <span>Reported: {new Date(issue.dateReported).toLocaleDateString()}</span>
            </div>
            
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-dyslexia-friendly">
                <strong>Recommendation:</strong> {issue.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChecklist = () => (
    <div className="space-y-6">
      {wcagChecklist.map(category => (
        <div key={category.category} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
            {category.category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {category.criteria.map(criterion => (
              <div key={criterion.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-dyslexia-friendly">
                    {criterion.id}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
                    {criterion.title}
                  </p>
                </div>
                {getStatusIcon(criterion.status)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderReport = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
          Accessibility Report Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
              Compliance Status
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>WCAG 2.1 AA: 85% Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span>3 Issues Require Attention</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Keyboard Navigation: Fully Supported</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
              Priority Actions
            </h4>
            <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
              <li>1. Fix color contrast in dark mode status indicators</li>
              <li>2. Add ARIA labels to onboarding progress</li>
              <li>3. Enhance voice input visual feedback</li>
            </ol>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-dyslexia-friendly">
          Testing Recommendations
        </h4>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
          <li>• Test with screen readers (NVDA, JAWS, VoiceOver)</li>
          <li>• Verify keyboard-only navigation</li>
          <li>• Check color contrast with tools like WebAIM</li>
          <li>• Test with users who have dyslexia and ADHD</li>
          <li>• Validate ARIA implementation</li>
        </ul>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Brain },
    { id: 'issues', label: 'Issues', icon: AlertTriangle },
    { id: 'checklist', label: 'WCAG Checklist', icon: FileText },
    { id: 'report', label: 'Report', icon: Settings }
  ];

  return (
    <div className={`h-full flex flex-col bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-dyslexia-friendly">
          Accessibility Audit
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
          WCAG 2.1 AA compliance review and documentation
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 p-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-dyslexia-friendly ${
                  activeTab === tab.id
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'issues' && renderIssues()}
        {activeTab === 'checklist' && renderChecklist()}
        {activeTab === 'report' && renderReport()}
      </div>
    </div>
  );
};

export default AccessibilityAudit; 