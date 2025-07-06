// [empathize] Analytics API
// Collects user interaction data and feedback for accessibility research

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory storage (replace with database in production)
interface AnalyticsData {
  id: string;
  timestamp: string;
  sessionId: string;
  type: 'interaction' | 'accessibility' | 'performance' | 'feedback';
  data: any;
}

interface FeedbackData {
  id: string;
  timestamp: string;
  rating: number;
  difficulty: 'easy' | 'medium' | 'hard';
  feature: string;
  feedback: string;
  voiceInput?: boolean;
  sessionDuration: number;
  errorsEncountered: number;
  accessibilityFeatures: {
    voiceInput: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
    screenReader: boolean;
  };
  sessionId?: string;
}

const analyticsData: AnalyticsData[] = [];
const feedbackData: FeedbackData[] = [];
const sessions: Map<string, { startTime: number; interactions: number; errors: number }> = new Map();

// Analytics endpoint
app.post('/api/analytics', (req, res) => {
  try {
    const { type, data, sessionId, timestamp } = req.body;
    
    const analyticsEntry: AnalyticsData = {
      id: uuidv4(),
      timestamp: timestamp || new Date().toISOString(),
      sessionId,
      type,
      data
    };

    analyticsData.push(analyticsEntry);

    // Track session statistics
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        startTime: Date.now(),
        interactions: 0,
        errors: 0
      });
    }

    const session = sessions.get(sessionId)!;
    session.interactions++;
    
    if (type === 'interaction' && data.errors && data.errors.length > 0) {
      session.errors++;
    }

    console.log(`Analytics recorded: ${type} for session ${sessionId}`);
    res.status(200).json({ success: true, id: analyticsEntry.id });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to record analytics' });
  }
});

// Feedback endpoint
app.post('/api/feedback', (req, res) => {
  try {
    const feedback: FeedbackData = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      rating: req.body.rating,
      difficulty: req.body.difficulty,
      feature: req.body.feature,
      feedback: req.body.feedback,
      voiceInput: req.body.voiceInput,
      sessionDuration: req.body.sessionDuration,
      errorsEncountered: req.body.errorsEncountered,
      accessibilityFeatures: req.body.accessibilityFeatures || {
        voiceInput: false,
        highContrast: false,
        fontSize: 'medium',
        reducedMotion: false,
        screenReader: false
      }
    };

    feedbackData.push(feedback);
    console.log(`Feedback received: ${feedback.rating}/5 stars for ${feedback.feature}`);
    res.status(200).json({ success: true, id: feedback.id });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get analytics summary
app.get('/api/analytics/summary', (req, res) => {
  try {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const last7Days = now - (7 * 24 * 60 * 60 * 1000);

    // Filter recent data
    const recentAnalytics = analyticsData.filter(
      a => new Date(a.timestamp).getTime() > last7Days
    );

    const recentFeedback = feedbackData.filter(
      f => new Date(f.timestamp).getTime() > last7Days
    );

    // Calculate statistics
    const totalSessions = sessions.size;
    const activeSessions = Array.from(sessions.values()).filter(
      s => (now - s.startTime) < (30 * 60 * 1000) // Active in last 30 minutes
    ).length;

    const totalInteractions = recentAnalytics.filter(a => a.type === 'interaction').length;
    const totalErrors = recentAnalytics
      .filter(a => a.type === 'interaction')
      .reduce((sum, a) => sum + (a.data.errors?.length || 0), 0);

    const averageRating = recentFeedback.length > 0
      ? recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length
      : 0;

    const difficultyBreakdown = recentFeedback.reduce((acc, f) => {
      acc[f.difficulty] = (acc[f.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const featureUsage = recentFeedback.reduce((acc, f) => {
      acc[f.feature] = (acc[f.feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Accessibility statistics
    const accessibilityStats = recentFeedback.reduce((acc, f) => {
      if (f.accessibilityFeatures) {
        Object.entries(f.accessibilityFeatures).forEach(([feature, enabled]) => {
          if (!acc[feature]) acc[feature] = { enabled: 0, total: 0 };
          acc[feature].total++;
          if (enabled) acc[feature].enabled++;
        });
      }
      return acc;
    }, {} as Record<string, { enabled: number; total: number }>);

    const summary = {
      period: '7 days',
      sessions: {
        total: totalSessions,
        active: activeSessions
      },
      interactions: {
        total: totalInteractions,
        errors: totalErrors,
        errorRate: totalInteractions > 0 ? (totalErrors / totalInteractions) * 100 : 0
      },
      feedback: {
        total: recentFeedback.length,
        averageRating: Math.round(averageRating * 10) / 10,
        difficultyBreakdown,
        featureUsage
      },
      accessibility: accessibilityStats,
      recentActivity: {
        last24Hours: analyticsData.filter(a => new Date(a.timestamp).getTime() > last24Hours).length,
        last7Days: recentAnalytics.length
      }
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Get session details
app.get('/api/analytics/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessionAnalytics = analyticsData.filter(a => a.sessionId === sessionId);
    const sessionFeedback = feedbackData.filter(f => f.sessionId === sessionId);
    const sessionInfo = sessions.get(sessionId);

    if (!sessionInfo) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = {
      sessionId,
      startTime: new Date(sessionInfo.startTime).toISOString(),
      duration: Date.now() - sessionInfo.startTime,
      interactions: sessionInfo.interactions,
      errors: sessionInfo.errors,
      analytics: sessionAnalytics,
      feedback: sessionFeedback
    };

    res.status(200).json(sessionData);
  } catch (error) {
    console.error('Session details error:', error);
    res.status(500).json({ error: 'Failed to get session details' });
  }
});

// Export data endpoint
app.get('/api/analytics/export', (req, res) => {
  try {
    const exportData = {
      timestamp: new Date().toISOString(),
      analytics: analyticsData,
      feedback: feedbackData,
      sessions: Object.fromEntries(sessions),
      summary: {
        totalAnalytics: analyticsData.length,
        totalFeedback: feedbackData.length,
        totalSessions: sessions.size
      }
    };

    res.status(200).json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dataPoints: analyticsData.length,
    feedbackCount: feedbackData.length,
    activeSessions: sessions.size
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Analytics API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Analytics endpoint: http://localhost:${PORT}/api/analytics`);
  console.log(`Feedback endpoint: http://localhost:${PORT}/api/feedback`);
});

export default app; 