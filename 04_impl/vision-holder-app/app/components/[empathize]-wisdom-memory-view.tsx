'use client';

// [delight] Enhanced Wisdom Memory View Component
// Polished for neurodiverse users with delightful UX and accessibility

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Settings, 
  Star, 
  Clock, 
  TrendingUp, 
  Edit, 
  Save, 
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Target,
  Zap,
  Heart,
  Shield,
  Volume2,
  Type,
  Layers,
  Gauge
} from 'lucide-react';

interface WisdomInsight {
  id: string;
  insight: string;
  relevance_score: number;
  context_triggers: string[];
  user_preference: Record<string, any>;
  timestamp: string;
  usage_count: number;
}

interface UserPreference {
  communication_style: 'visual' | 'text' | 'voice' | 'mixed';
  detail_level: 'high' | 'medium' | 'low';
  learning_pace: 'fast' | 'moderate' | 'slow';
  accessibility_needs: string[];
  preferred_feedback: string[];
}

interface WisdomMemoryViewProps {
  className?: string;
}

// Smart defaults for neurodiverse users
const SMART_DEFAULTS = {
  communication_style: 'mixed', // Most accessible for different needs
  detail_level: 'medium', // Balanced approach
  learning_pace: 'moderate', // Safe starting point
  accessibility_needs: ['high-contrast', 'dyslexia-friendly'], // Common needs
  preferred_feedback: ['visual', 'audio'] // Multi-modal feedback
};

// Helpful tooltips for each preference
const PREFERENCE_TOOLTIPS = {
  communication_style: 'How you prefer to receive information. Mixed mode adapts to different contexts.',
  detail_level: 'Controls how much explanation you get. Medium provides good balance.',
  learning_pace: 'How quickly new concepts are introduced. You can always adjust this.',
  accessibility_needs: 'Visual and interaction preferences that help you use the app comfortably.',
  preferred_feedback: 'Types of feedback you find most helpful when completing tasks.'
};

// Suggested insights based on user behavior
const SUGGESTED_INSIGHTS = [
  {
    insight: 'I prefer step-by-step instructions with clear visual cues',
    context_triggers: ['tutorial', 'onboarding', 'help'],
    user_preference: { needs_visual_guidance: true }
  },
  {
    insight: 'Short, focused work sessions help me stay productive',
    context_triggers: ['productivity', 'focus', 'adhd'],
    user_preference: { prefers_short_sessions: true }
  },
  {
    insight: 'I learn better with examples and practical demonstrations',
    context_triggers: ['learning', 'examples', 'coding'],
    user_preference: { learns_by_example: true }
  }
];

export const WisdomMemoryView: React.FC<WisdomMemoryViewProps> = ({ className = '' }) => {
  const [wisdomInsights, setWisdomInsights] = useState<WisdomInsight[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference>(SMART_DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPreference, setEditingPreference] = useState<string | null>(null);
  const [showAddInsight, setShowAddInsight] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuggestedInsights, setShowSuggestedInsights] = useState(false);
  const [newInsight, setNewInsight] = useState({
    insight: '',
    context_triggers: '',
    user_preference: ''
  });

  useEffect(() => {
    loadWisdomData();
  }, []);

  const loadWisdomData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load wisdom insights
      const wisdomResponse = await fetch('http://localhost:3002/orchestrator/wisdom');
      if (wisdomResponse.ok) {
        const wisdomData = await wisdomResponse.json();
        setWisdomInsights(wisdomData.insights || []);
      }

      // Load user preferences
      const preferencesResponse = await fetch('http://localhost:3002/orchestrator/preferences');
      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        setUserPreferences(preferencesData.preferences || userPreferences);
      }
    } catch (err) {
      console.error('Failed to load wisdom data:', err);
      setError('Failed to load wisdom memory data. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPreference = async (key: keyof UserPreference, value: any) => {
    try {
      const updatedPreferences = { ...userPreferences, [key]: value };
      
      const response = await fetch('http://localhost:3002/orchestrator/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: updatedPreferences })
      });

      if (response.ok) {
        setUserPreferences(updatedPreferences);
        setEditingPreference(null);
        
        // Show success feedback
        setSaveSuccess(key);
        setTimeout(() => setSaveSuccess(null), 2000);
        
        // Announce to screen readers
        const announcement = `${key.replace('_', ' ')} preference saved successfully`;
        const ariaLive = document.createElement('div');
        ariaLive.setAttribute('aria-live', 'polite');
        ariaLive.setAttribute('aria-atomic', 'true');
        ariaLive.className = 'sr-only';
        ariaLive.textContent = announcement;
        document.body.appendChild(ariaLive);
        setTimeout(() => document.body.removeChild(ariaLive), 1000);
      }
    } catch (err) {
      console.error('Failed to update preference:', err);
      setError('Failed to update preference. Please try again.');
    }
  };

  // Enhanced form validation
  const validateInsightForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newInsight.insight.trim()) {
      errors.insight = 'Please describe your insight';
    } else if (newInsight.insight.trim().length < 10) {
      errors.insight = 'Please provide a more detailed insight (at least 10 characters)';
    }
    
    if (!newInsight.context_triggers.trim()) {
      errors.context_triggers = 'Please add at least one context trigger';
    }
    
    if (newInsight.user_preference.trim()) {
      try {
        JSON.parse(newInsight.user_preference);
      } catch {
        errors.user_preference = 'Please enter valid JSON format (e.g., {"key": "value"})';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addWisdomInsight = async () => {
    if (!validateInsightForm()) {
      return;
    }
    
    try {
      const insightData = {
        insight: newInsight.insight.trim(),
        context_triggers: newInsight.context_triggers.split(',').map(t => t.trim()).filter(t => t),
        user_preference: newInsight.user_preference.trim() ? JSON.parse(newInsight.user_preference) : {}
      };

      const response = await fetch('http://localhost:3002/orchestrator/wisdom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insightData)
      });

      if (response.ok) {
        const newInsightData = await response.json();
        setWisdomInsights(prev => [...prev, newInsightData.insight]);
        setShowAddInsight(false);
        setNewInsight({ insight: '', context_triggers: '', user_preference: '' });
        setValidationErrors({});
        
        // Success feedback
        setSaveSuccess('insight_added');
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to add insight:', err);
      setError('Failed to add insight. Please check the format and try again.');
    }
  };

  // Add suggested insight with confirmation
  const addSuggestedInsight = async (suggestedInsight: typeof SUGGESTED_INSIGHTS[0]) => {
    try {
      const response = await fetch('http://localhost:3002/orchestrator/wisdom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestedInsight)
      });

      if (response.ok) {
        const newInsightData = await response.json();
        setWisdomInsights(prev => [...prev, newInsightData.insight]);
        setSaveSuccess('suggested_insight_added');
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to add suggested insight:', err);
      setError('Failed to add suggested insight. Please try again.');
    }
  };

  const deleteWisdomInsight = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3002/orchestrator/wisdom/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setWisdomInsights(prev => prev.filter(w => w.id !== id));
        setShowDeleteConfirm(null);
        
        // Success feedback
        setSaveSuccess('insight_deleted');
        setTimeout(() => setSaveSuccess(null), 2000);
      }
    } catch (err) {
      console.error('Failed to delete insight:', err);
      setError('Failed to delete insight. Please try again.');
    }
  };

  // Enhanced relevance visualization
  const getRelevanceDisplay = (score: number) => {
    const percentage = Math.round(score * 100);
    let color, icon, label;
    
    if (score >= 0.8) {
      color = 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900 border-green-200 dark:border-green-800';
      icon = <Star className="w-3 h-3" />;
      label = 'Highly Relevant';
    } else if (score >= 0.6) {
      color = 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900 border-amber-200 dark:border-amber-800';
      icon = <Target className="w-3 h-3" />;
      label = 'Moderately Relevant';
    } else {
      color = 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900 border-blue-200 dark:border-blue-800';
      icon = <Eye className="w-3 h-3" />;
      label = 'Learning';
    }
    
    return {
      color: `${color} border`,
      icon,
      label,
      percentage
    };
  };

  // Get icon for communication style
  const getCommunicationIcon = (style: string) => {
    switch (style) {
      case 'visual': return <Eye className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'voice': return <Volume2 className="w-4 h-4" />;
      case 'mixed': return <Layers className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  // Get icon for detail level
  const getDetailIcon = (level: string) => {
    switch (level) {
      case 'high': return <Layers className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'low': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  // Get icon for learning pace
  const getPaceIcon = (pace: string) => {
    switch (pace) {
      case 'fast': return <Zap className="w-4 h-4" />;
      case 'moderate': return <Gauge className="w-4 h-4" />;
      case 'slow': return <Heart className="w-4 h-4" />;
      default: return <Gauge className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}
           role="status" aria-live="polite" aria-label="Loading wisdom memory">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <Brain className="w-12 h-12 text-primary-600 dark:text-primary-400 animate-pulse-soft mx-auto mb-6" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-5 h-5 text-amber-500 animate-bounce-gentle" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 text-dyslexia-friendly">
            Loading Your Wisdom Memory
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
            Gathering your preferences and insights...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}
           role="alert" aria-live="assertive">
        <div className="text-center max-w-md animate-slide-up">
          <div className="relative mb-6">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto w-fit">
              <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" aria-hidden="true" />
            </div>
            <div className="absolute -top-1 -right-8">
              <Shield className="w-6 h-6 text-gray-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly">
            Connection Issue
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly mb-6 leading-relaxed">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={loadWisdomData}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 text-dyslexia-friendly shadow-md hover:shadow-lg transform hover:scale-105 focus-ring flex items-center justify-center space-x-2"
              aria-label="Retry loading wisdom memory"
            >
              <Zap className="w-4 h-4" aria-hidden="true" />
              <span>Retry Connection</span>
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
              Check your internet connection and try again
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (showAddInsight) {
        setShowAddInsight(false);
        setNewInsight({ insight: '', context_triggers: '', user_preference: '' });
        setValidationErrors({});
      } else if (showSuggestedInsights) {
        setShowSuggestedInsights(false);
      } else if (showDeleteConfirm) {
        setShowDeleteConfirm(null);
      } else if (editingPreference) {
        setEditingPreference(null);
      }
    }
  };

  return (
    <div 
      className={`p-6 space-y-6 ${className}`}
      onKeyDown={handleKeyDown}
      role="main"
      aria-label="Wisdom Memory - User preferences and AI insights"
    >
      {/* Success/Save Feedback Banner */}
      {saveSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 animate-fade-in"
             role="status" aria-live="polite">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200 text-dyslexia-friendly">
              {saveSuccess === 'communication_style' && 'Communication style updated successfully!'}
              {saveSuccess === 'detail_level' && 'Detail level preference saved!'}
              {saveSuccess === 'learning_pace' && 'Learning pace preference updated!'}
              {saveSuccess === 'insight_added' && 'New insight added to your wisdom memory!'}
              {saveSuccess === 'suggested_insight_added' && 'Suggested insight added successfully!'}
              {saveSuccess === 'insight_deleted' && 'Insight removed from your memory!'}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-dyslexia-friendly flex items-center space-x-3">
            <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span>Wisdom Memory</span>
            <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400" />
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
            Your preferences and AI insights that help personalize your experience
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSuggestedInsights(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-all duration-200 text-dyslexia-friendly border border-amber-200 dark:border-amber-800 hover-lift focus-ring group"
            aria-label="View suggested insights based on your usage patterns"
          >
            <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
            <span>Suggestions</span>
          </button>
          <button
            onClick={() => setShowAddInsight(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 text-dyslexia-friendly shadow-md hover:shadow-lg hover-lift focus-ring group"
            aria-label="Add a new wisdom insight"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Add Insight</span>
          </button>
        </div>
      </div>

      {/* User Preferences Section */}
      <section 
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        aria-labelledby="preferences-heading"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <h3 
              id="preferences-heading"
              className="text-lg font-semibold text-gray-900 dark:text-white text-dyslexia-friendly"
            >
              User Preferences
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly mt-2">
            Configure how Vision Holder adapts to your needs
          </p>
        </div>
        
        <div className="p-6 space-y-4" role="group" aria-labelledby="preferences-heading">
          {/* Communication Style */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200">
            <div className="flex items-start space-x-3">
              {getCommunicationIcon(userPreferences.communication_style)}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-dyslexia-friendly flex items-center space-x-2">
                  <span>Communication Style</span>
                  <button
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-ring rounded"
                    title={PREFERENCE_TOOLTIPS.communication_style}
                    aria-label="Help: Communication style preference"
                    aria-describedby="communication-help"
                    tabIndex={0}
                  >
                    <HelpCircle className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <div id="communication-help" className="sr-only">
                    {PREFERENCE_TOOLTIPS.communication_style}
                  </div>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-dyslexia-friendly mt-1">
                  How you prefer to receive information
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {saveSuccess === 'communication_style' && (
                <div className="animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
              {editingPreference === 'communication_style' ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={userPreferences.communication_style}
                    onChange={(e) => updateUserPreference('communication_style', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white text-dyslexia-friendly focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Select communication style preference"
                    aria-describedby="communication-help"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.currentTarget.click();
                      }
                    }}
                  >
                    <option value="visual">🎨 Visual</option>
                    <option value="text">📝 Text</option>
                    <option value="voice">🔊 Voice</option>
                    <option value="mixed">🎯 Mixed</option>
                  </select>
                  <button
                    onClick={() => setEditingPreference(null)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Cancel editing"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium text-dyslexia-friendly">
                    {userPreferences.communication_style.charAt(0).toUpperCase() + userPreferences.communication_style.slice(1)}
                  </span>
                  <button
                    onClick={() => setEditingPreference('communication_style')}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
                    aria-label="Edit communication style preference"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Detail Level */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200">
            <div className="flex items-start space-x-3">
              {getDetailIcon(userPreferences.detail_level)}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-dyslexia-friendly flex items-center space-x-2">
                  <span>Detail Level</span>
                  <button
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title={PREFERENCE_TOOLTIPS.detail_level}
                    aria-label="Help: Detail level preference"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-dyslexia-friendly mt-1">
                  How much detail you prefer in explanations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {saveSuccess === 'detail_level' && (
                <div className="animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
              {editingPreference === 'detail_level' ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={userPreferences.detail_level}
                    onChange={(e) => updateUserPreference('detail_level', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white text-dyslexia-friendly focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Select detail level"
                    autoFocus
                  >
                    <option value="high">🔍 High Detail</option>
                    <option value="medium">⚖️ Balanced</option>
                    <option value="low">⚡ Concise</option>
                  </select>
                  <button
                    onClick={() => setEditingPreference(null)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Cancel editing"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium text-dyslexia-friendly">
                    {userPreferences.detail_level.charAt(0).toUpperCase() + userPreferences.detail_level.slice(1)}
                  </span>
                  <button
                    onClick={() => setEditingPreference('detail_level')}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
                    aria-label="Edit detail level preference"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Learning Pace */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200">
            <div className="flex items-start space-x-3">
              {getPaceIcon(userPreferences.learning_pace)}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-dyslexia-friendly flex items-center space-x-2">
                  <span>Learning Pace</span>
                  <button
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title={PREFERENCE_TOOLTIPS.learning_pace}
                    aria-label="Help: Learning pace preference"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-dyslexia-friendly mt-1">
                  How quickly you prefer to learn new concepts
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {saveSuccess === 'learning_pace' && (
                <div className="animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
              {editingPreference === 'learning_pace' ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={userPreferences.learning_pace}
                    onChange={(e) => updateUserPreference('learning_pace', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white text-dyslexia-friendly focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Select learning pace"
                    autoFocus
                  >
                    <option value="fast">⚡ Fast Pace</option>
                    <option value="moderate">🎯 Moderate</option>
                    <option value="slow">🌱 Gentle Pace</option>
                  </select>
                  <button
                    onClick={() => setEditingPreference(null)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Cancel editing"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium text-dyslexia-friendly">
                    {userPreferences.learning_pace.charAt(0).toUpperCase() + userPreferences.learning_pace.slice(1)}
                  </span>
                  <button
                    onClick={() => setEditingPreference('learning_pace')}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
                    aria-label="Edit learning pace preference"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wisdom Insights Section */}
      <section 
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        aria-labelledby="insights-heading"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <h3 
              id="insights-heading"
              className="text-lg font-semibold text-gray-900 dark:text-white text-dyslexia-friendly"
            >
              AI Insights ({wisdomInsights.length})
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly mt-2">
            Personalized insights that improve your experience over time
          </p>
        </div>
        
        <div className="p-6">
          {wisdomInsights.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative">
                <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-6 animate-pulse" />
                <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 text-dyslexia-friendly">
                Your Wisdom Journey Starts Here
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-dyslexia-friendly mb-6 max-w-md mx-auto">
                AI insights help personalize your experience. Add your first insight or try our suggestions to get started.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setShowAddInsight(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 text-dyslexia-friendly shadow-md hover:shadow-lg hover-lift focus-ring group"
                  aria-label="Add your first wisdom insight"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  <span>Add Your First Insight</span>
                </button>
                <button
                  onClick={() => setShowSuggestedInsights(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-all duration-200 text-dyslexia-friendly border border-amber-200 dark:border-amber-800 hover-lift focus-ring group"
                  aria-label="View suggested insights"
                >
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                  <span>View Suggestions</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4" role="list" aria-label="Wisdom insights">
              {wisdomInsights.map((insight, index) => {
                const relevanceData = getRelevanceDisplay(insight.relevance_score);
                return (
                  <article
                    key={insight.id}
                    className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800/50 focus-within:ring-2 focus-within:ring-primary-500"
                    role="listitem"
                    aria-labelledby={`insight-${insight.id}`}
                    aria-describedby={`insight-meta-${insight.id}`}
                    tabIndex={0}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-full font-medium ${relevanceData.color}`}
                                title={relevanceData.label}>
                            {relevanceData.icon}
                            <span>{relevanceData.percentage}% relevant</span>
                          </span>
                          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-xs font-medium">{insight.usage_count} uses</span>
                          </div>
                        </div>
                        
                        <p 
                          id={`insight-${insight.id}`}
                          className="text-gray-900 dark:text-white mb-3 text-dyslexia-friendly leading-relaxed"
                        >
                          {insight.insight}
                        </p>
                        
                        <div 
                          id={`insight-meta-${insight.id}`}
                          className="flex items-center space-x-6 text-xs text-gray-500 dark:text-gray-400"
                        >
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span>
                              <span className="sr-only">Created on </span>
                              {new Date(insight.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="w-3 h-3" aria-hidden="true" />
                            <span>
                              <span className="sr-only">Context triggers: </span>
                              {insight.context_triggers.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(insight.id)}
                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 focus-ring"
                        title="Delete insight"
                        aria-label={`Delete insight: ${insight.insight.substring(0, 50)}...`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setShowDeleteConfirm(insight.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <div>
                <h3 
                  id="delete-modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white text-dyslexia-friendly"
                >
                  Delete Insight?
                </h3>
                <p 
                  id="delete-modal-description"
                  className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly"
                >
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-dyslexia-friendly border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus-ring"
                autoFocus
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteWisdomInsight(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-dyslexia-friendly flex items-center space-x-2 focus-ring"
                aria-label="Confirm deletion"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Insights Modal */}
      {showSuggestedInsights && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowSuggestedInsights(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="suggestions-modal-title"
          aria-describedby="suggestions-modal-description"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 
                    id="suggestions-modal-title"
                    className="text-lg font-semibold text-gray-900 dark:text-white text-dyslexia-friendly"
                  >
                    Suggested Insights
                  </h3>
                  <p 
                    id="suggestions-modal-description"
                    className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly"
                  >
                    Common insights that help neurodiverse users
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuggestedInsights(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 focus-ring"
                aria-label="Close suggestions"
                autoFocus
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            <div className="space-y-4" role="list" aria-label="Suggested insights">
              {SUGGESTED_INSIGHTS.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500"
                  role="listitem"
                >
                  <p className="text-gray-900 dark:text-white mb-3 text-dyslexia-friendly">
                    {suggestion.insight}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Target className="w-3 h-3" aria-hidden="true" />
                      <span>
                        <span className="sr-only">Context triggers: </span>
                        {suggestion.context_triggers.join(', ')}
                      </span>
                    </div>
                    <button
                      onClick={() => addSuggestedInsight(suggestion)}
                      className="flex items-center space-x-2 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm text-dyslexia-friendly focus-ring"
                      aria-label={`Add suggested insight: ${suggestion.insight}`}
                    >
                      <Plus className="w-3 h-3" aria-hidden="true" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Insight Modal */}
      {showAddInsight && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddInsight(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-insight-modal-title"
          aria-describedby="add-insight-modal-description"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 
                    id="add-insight-modal-title"
                    className="text-lg font-semibold text-gray-900 dark:text-white text-dyslexia-friendly"
                  >
                    Add Wisdom Insight
                  </h3>
                  <p 
                    id="add-insight-modal-description"
                    className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly"
                  >
                    Share what you've learned or prefer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddInsight(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                aria-label="Close add insight form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-dyslexia-friendly flex items-center space-x-2">
                  <span>Your Insight</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newInsight.insight}
                  onChange={(e) => setNewInsight(prev => ({ ...prev, insight: e.target.value }))}
                  placeholder="I prefer step-by-step instructions with visual examples..."
                  className={`w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-dyslexia-friendly transition-all duration-200 ${
                    validationErrors.insight ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  rows={3}
                  aria-describedby={validationErrors.insight ? 'insight-error' : 'insight-help'}
                  autoFocus
                />
                <div id="insight-help" className="sr-only">
                  Describe what you've learned or your preferences in detail
                </div>
                {validationErrors.insight && (
                  <p 
                    id="insight-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400 text-dyslexia-friendly"
                    role="alert"
                    aria-live="polite"
                  >
                    {validationErrors.insight}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-dyslexia-friendly flex items-center space-x-2">
                  <span>Context Triggers</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newInsight.context_triggers}
                  onChange={(e) => setNewInsight(prev => ({ ...prev, context_triggers: e.target.value }))}
                  placeholder="learning, tutorial, visual, adhd"
                  className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-dyslexia-friendly transition-all duration-200 ${
                    validationErrors.context_triggers ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {validationErrors.context_triggers && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 text-dyslexia-friendly">
                    {validationErrors.context_triggers}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
                  Separate multiple triggers with commas
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-dyslexia-friendly">
                  User Preference (Optional)
                </label>
                <input
                  type="text"
                  value={newInsight.user_preference}
                  onChange={(e) => setNewInsight(prev => ({ ...prev, user_preference: e.target.value }))}
                  placeholder='{"visual_guidance": true, "step_by_step": true}'
                  className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-dyslexia-friendly font-mono text-sm transition-all duration-200 ${
                    validationErrors.user_preference ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {validationErrors.user_preference && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 text-dyslexia-friendly">
                    {validationErrors.user_preference}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-dyslexia-friendly">
                  JSON format for structured preferences (optional)
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowAddInsight(false);
                  setNewInsight({ insight: '', context_triggers: '', user_preference: '' });
                  setValidationErrors({});
                }}
                className="px-5 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-dyslexia-friendly border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addWisdomInsight}
                disabled={!newInsight.insight.trim() || !newInsight.context_triggers.trim()}
                className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 text-dyslexia-friendly disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Insight</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 