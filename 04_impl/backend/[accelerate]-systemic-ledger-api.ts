/// <reference types="semver" />

// [accelerate] Systemic Ledger API Backend
// Based on contract: /03_contract/[clarify]-system-architecture-schema.md

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { setupSecurityMiddleware, rateLimits } from './[safeguard]-security-middleware';

// Types based on contract schema
export interface LedgerEntry {
  id: string;
  timestamp: string;
  purpose_tag: '[clarify]' | '[accelerate]' | '[safeguard]' | '[monetize]' | '[empathize]' | '[delight]';
  level: 'mission' | 'pillar' | 'epic' | 'saga' | 'probe';
  seek: string;
  why: string;
  content: Record<string, any>;
  status: 'proposed' | 'active' | 'blocked' | 'integrated' | 'archived' | 'dormant';
}

export interface LedgerFilter {
  level?: LedgerEntry['level'];
  purpose_tag?: LedgerEntry['purpose_tag'];
  status?: LedgerEntry['status'];
  startDate?: string;
  endDate?: string;
}

// In-memory storage (replace with database in production)
let ledgerEntries: LedgerEntry[] = [];

// Initialize with default mission and pillars from BUILD_JOURNAL.md
const initializeDefaultEntries = () => {
  const defaultEntries: Omit<LedgerEntry, 'id' | 'timestamp'>[] = [
    {
      purpose_tag: '[clarify]',
      level: 'mission',
      seek: 'establish',
      why: 'To create a living, vision-aligned project ecosystem that serves as the foundation for the AI Co-Vision Holder & Systemic Orchestrator (V2.0)',
      content: {
        title: 'Project Initialization',
        statement: 'Initialize the Vision Holder project according to the Build Journal Protocol (Operator\'s Manual v2.0) to establish a canonical structure that supports the development of an AI-driven project partner for visionary users with dyslexia and ADHD.'
      },
      status: 'active'
    },
    {
      purpose_tag: '[safeguard]',
      level: 'pillar',
      seek: 'safeguard',
      why: 'To maintain clear boundaries between theory, intent, contract, and implementation, preventing cross-contamination and ensuring each layer serves its distinct purpose',
      content: {
        title: 'Canon-Layer Separation'
      },
      status: 'active'
    },
    {
      purpose_tag: '[clarify]',
      level: 'pillar',
      seek: 'clarify',
      why: 'To ensure every file, commit message, and PR title begins with a valid purpose tag for clear intent communication',
      content: {
        title: 'Purpose-Tag Mandate'
      },
      status: 'active'
    },
    {
      purpose_tag: '[accelerate]',
      level: 'pillar',
      seek: 'accelerate',
      why: 'To ensure all implementation code is generated from /03_contract materials, maintaining consistency and reducing technical debt',
      content: {
        title: 'Contract-Driven Implementation'
      },
      status: 'active'
    },
    {
      purpose_tag: '[empathize]',
      level: 'pillar',
      seek: 'empathize',
      why: 'To maintain perfect alignment between the user\'s vision and the technical implementation, ensuring the AI Co-Vision Holder truly serves the user\'s needs',
      content: {
        title: 'Vision Alignment'
      },
      status: 'active'
    },
    {
      purpose_tag: '[delight]',
      level: 'pillar',
      seek: 'delight',
      why: 'To create a system where documentation evolves with the project, serving as both a record and a guide for future development',
      content: {
        title: 'Living Documentation'
      },
      status: 'active'
    }
  ];

  defaultEntries.forEach(entry => {
    ledgerEntries.push({
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    });
  });
};

// Initialize default entries
initializeDefaultEntries();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Security middleware
setupSecurityMiddleware(app);

// Rate limiting
app.use('/ledger', rateLimits.general);
app.use('/ledger/entries', rateLimits.api);

// Validation middleware
const validatePurposeTag = (purpose_tag: string): purpose_tag is LedgerEntry['purpose_tag'] => {
  return ['[clarify]', '[accelerate]', '[safeguard]', '[monetize]', '[empathize]', '[delight]'].includes(purpose_tag);
};

const validateLevel = (level: string): level is LedgerEntry['level'] => {
  return ['mission', 'pillar', 'epic', 'saga', 'probe'].includes(level);
};

const validateStatus = (status: string): status is LedgerEntry['status'] => {
  return ['proposed', 'active', 'blocked', 'integrated', 'archived', 'dormant'].includes(status);
};

// API Routes

// POST /ledger/entries - Add new entry
app.post('/ledger/entries', (req, res) => {
  try {
    const { purpose_tag, level, seek, why, content, status = 'proposed' } = req.body;

    // Validation
    if (!purpose_tag || !validatePurposeTag(purpose_tag)) {
      return res.status(400).json({
        error: 'Invalid purpose_tag. Must be one of: [clarify], [accelerate], [safeguard], [monetize], [empathize], [delight]'
      });
    }

    if (!level || !validateLevel(level)) {
      return res.status(400).json({
        error: 'Invalid level. Must be one of: mission, pillar, epic, saga, probe'
      });
    }

    if (!seek || typeof seek !== 'string') {
      return res.status(400).json({
        error: 'seek field is required and must be a string'
      });
    }

    if (!why || typeof why !== 'string') {
      return res.status(400).json({
        error: 'why field is required and must be a string'
      });
    }

    if (!content || typeof content !== 'object') {
      return res.status(400).json({
        error: 'content field is required and must be an object'
      });
    }

    if (!validateStatus(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: proposed, active, blocked, integrated, archived, dormant'
      });
    }

    // Create new entry
    const newEntry: LedgerEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      purpose_tag,
      level,
      seek,
      why,
      content,
      status
    };

    ledgerEntries.push(newEntry);

    res.status(201).json({
      message: 'Entry created successfully',
      entry: newEntry
    });

  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /ledger/entries - Retrieve entries with optional filtering
app.get('/ledger/entries', (req, res) => {
  try {
    const { level, purpose_tag, status, startDate, endDate } = req.query;
    
    let filtered = [...ledgerEntries];

    // Apply filters
    if (level && validateLevel(level as string)) {
      filtered = filtered.filter(entry => entry.level === level);
    }

    if (purpose_tag && validatePurposeTag(purpose_tag as string)) {
      filtered = filtered.filter(entry => entry.purpose_tag === purpose_tag);
    }

    if (status && validateStatus(status as string)) {
      filtered = filtered.filter(entry => entry.status === status);
    }

    if (startDate && typeof startDate === 'string') {
      filtered = filtered.filter(entry => entry.timestamp >= startDate);
    }

    if (endDate && typeof endDate === 'string') {
      filtered = filtered.filter(entry => entry.timestamp <= endDate);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      entries: filtered,
      total: filtered.length
    });

  } catch (error) {
    console.error('Error retrieving entries:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /ledger/entries/{id}/status - Update entry status
app.put('/ledger/entries/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !validateStatus(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: proposed, active, blocked, integrated, archived, dormant'
      });
    }

    const entryIndex = ledgerEntries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) {
      return res.status(404).json({
        error: 'Entry not found'
      });
    }

    // Update status
    const entry = ledgerEntries[entryIndex];
    if (!entry) {
      return res.status(404).json({
        error: 'Entry not found'
      });
    }
    
    entry.status = status;

    return res.json({
      message: 'Status updated successfully',
      entry: entry
    });

  } catch (error) {
    console.error('Error updating entry status:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /ledger/roadmap - Get roadmap data organized by level
app.get('/ledger/roadmap', (req, res) => {
  try {
    const roadmapData = {
      mission: ledgerEntries.filter(entry => entry.level === 'mission'),
      pillar: ledgerEntries.filter(entry => entry.level === 'pillar'),
      epic: ledgerEntries.filter(entry => entry.level === 'epic'),
      saga: ledgerEntries.filter(entry => entry.level === 'saga'),
      probe: ledgerEntries.filter(entry => entry.level === 'probe')
    };

    res.json(roadmapData);

  } catch (error) {
    console.error('Error retrieving roadmap data:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /ledger/entries/{id} - Get specific entry
app.get('/ledger/entries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const entry = ledgerEntries.find(entry => entry.id === id);
    
    if (!entry) {
      return res.status(404).json({
        error: 'Entry not found'
      });
    }

    res.json(entry);

  } catch (error) {
    console.error('Error retrieving entry:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    totalEntries: ledgerEntries.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[accelerate] Systemic Ledger API running on port ${PORT}`);
  console.log(`[clarify] Health check: http://localhost:${PORT}/health`);
  console.log(`[clarify] API documentation: http://localhost:${PORT}/ledger/entries`);
});

export default app; 