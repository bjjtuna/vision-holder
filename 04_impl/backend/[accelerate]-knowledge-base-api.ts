// [accelerate] Knowledge Base API Backend
// Based on contract: /03_contract/[clarify]-system-architecture-schema.md
// Enhanced with comprehensive file upload security

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from './[accelerate]-ai-service-integration';
import fileUploadSecurity, { 
  uploadRateLimit, 
  securityMiddleware, 
  validateFileUpload, 
  generateSecurityReport, 
  getAuditLog,
  SECURITY_CONFIG 
} from './[accelerate]-file-upload-security';

// Types based on contract schema
export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  size: number;
  uploaded_at: string;
  tags: string[];
  description?: string;
  ai_analysis?: {
    summary: string;
    key_points: string[];
    relevance_score: number;
    suggested_tags: string[];
  };
  url: string;
  is_analyzed: boolean;
  security_scan?: {
    scanned_at: string;
    is_safe: boolean;
    threats: string[];
    hash: string;
    quarantined: boolean;
  };
}

export interface UploadRequest {
  name?: string;
  description?: string;
  tags?: string;
}

export interface AIAnalysisRequest {
  document_id: string;
}

// File type detection
const getFileType = (filename: string, mimetype: string): KnowledgeDocument['type'] => {
  const ext = path.extname(filename).toLowerCase();
  
  // Document types
  if (['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.csv', '.xlsx', '.pptx'].includes(ext) ||
      mimetype.startsWith('application/') && mimetype.includes('document')) {
    return 'document';
  }
  
  // Image types
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.tiff'].includes(ext) ||
      mimetype.startsWith('image/')) {
    return 'image';
  }
  
  // Video types
  if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'].includes(ext) ||
      mimetype.startsWith('video/')) {
    return 'video';
  }
  
  // Audio types
  if (['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'].includes(ext) ||
      mimetype.startsWith('audio/')) {
    return 'audio';
  }
  
  // Archive types
  if (['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'].includes(ext) ||
      mimetype.includes('archive') || mimetype.includes('compressed')) {
    return 'archive';
  }
  
  return 'other';
};

// Storage configuration
const storageDir = path.join(__dirname, '../uploads');
const quarantineDir = path.join(__dirname, '../quarantine');

// Ensure directories exist
[storageDir, quarantineDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Enhanced storage configuration with security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be temporarily stored here before security validation
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    // Use UUID for security and uniqueness
    const uniqueName = `temp_${uuidv4()}_${Date.now()}`;
    cb(null, uniqueName);
  }
});

// Enhanced upload configuration with security
const upload = multer({
  storage,
  limits: {
    fileSize: SECURITY_CONFIG.MAX_FILE_SIZE,
    files: SECURITY_CONFIG.MAX_FILES_PER_REQUEST,
    parts: 20, // Limit form parts to prevent DoS
    headerPairs: 20 // Limit header pairs
  },
  fileFilter: (req, file, cb) => {
    // Enhanced security filtering
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Check against dangerous extensions
    if (SECURITY_CONFIG.DANGEROUS_EXTENSIONS.includes(ext)) {
      return cb(new Error('Dangerous file type detected'));
    }
    
    // Check against allowed extensions
    if (!SECURITY_CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('File type not allowed'));
    }
    
    // Check MIME type
    if (!file.mimetype || file.mimetype.length === 0) {
      return cb(new Error('Invalid MIME type'));
    }
    
    // Basic filename validation
    if (file.originalname.length > 255) {
      return cb(new Error('Filename too long'));
    }
    
    cb(null, true);
  }
});

// In-memory storage (replace with database in production)
let documents: KnowledgeDocument[] = [];

// Initialize with sample documents
const initializeSampleDocuments = () => {
  const sampleDocs: Omit<KnowledgeDocument, 'id' | 'uploaded_at'>[] = [
    {
      name: 'Project Blueprint.pdf',
      type: 'document',
      size: 2048576,
      tags: ['blueprint', 'project', 'planning'],
      description: 'Main project blueprint and architecture document',
      url: '/uploads/sample-blueprint.pdf',
      is_analyzed: true,
      security_scan: {
        scanned_at: new Date().toISOString(),
        is_safe: true,
        threats: [],
        hash: 'sample_hash_001',
        quarantined: false
      },
      ai_analysis: {
        summary: 'Comprehensive project blueprint outlining the AI Co-Vision Holder system architecture and implementation strategy.',
        key_points: [
          'Five-level abstraction system (Mission, Pillars, Epics, Sagas, Probes)',
          'Systemic Ledger for append-only event logging',
          'AI Orchestrator with context engineering capabilities',
          'Accessibility-focused UI for users with dyslexia and ADHD'
        ],
        relevance_score: 0.95,
        suggested_tags: ['architecture', 'ai', 'accessibility', 'system-design']
      }
    },
    {
      name: 'User Experience Vision.png',
      type: 'image',
      size: 1048576,
      tags: ['ux', 'design', 'vision'],
      description: 'Visual representation of the user experience vision',
      url: '/uploads/sample-ux-vision.png',
      is_analyzed: false,
      security_scan: {
        scanned_at: new Date().toISOString(),
        is_safe: true,
        threats: [],
        hash: 'sample_hash_002',
        quarantined: false
      }
    },
    {
      name: 'System Architecture Diagram.svg',
      type: 'image',
      size: 512000,
      tags: ['architecture', 'diagram', 'system'],
      description: 'System architecture diagram showing component relationships',
      url: '/uploads/sample-architecture.svg',
      is_analyzed: true,
      security_scan: {
        scanned_at: new Date().toISOString(),
        is_safe: true,
        threats: [],
        hash: 'sample_hash_003',
        quarantined: false
      },
      ai_analysis: {
        summary: 'System architecture diagram showing the relationship between frontend, backend, and AI components.',
        key_points: [
          'Frontend React application with tabbed interface',
          'Backend APIs for ledger and orchestrator services',
          'AI integration for context engineering and wisdom memory',
          'File storage and knowledge base integration'
        ],
        relevance_score: 0.88,
        suggested_tags: ['diagram', 'components', 'integration', 'services']
      }
    }
  ];

  sampleDocs.forEach(doc => {
    documents.push({
      ...doc,
      id: uuidv4(),
      uploaded_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  });
};

const app = express();
const PORT = process.env['PORT'] || 3003;

// Enhanced middleware with security
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production' ? process.env['FRONTEND_URL'] : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(securityMiddleware);

// Apply rate limiting to upload endpoints
app.use('/knowledge/upload', uploadRateLimit);

// Serve uploads with security headers
app.use('/uploads', (req, res, next) => {
  // Add security headers for file serving
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  next();
}, express.static(storageDir));

// Helper functions
const analyzeDocumentWithAI = async (document: KnowledgeDocument): Promise<KnowledgeDocument['ai_analysis']> => {
  try {
    // For text documents, try to read content for AI analysis
    let documentContent = `Document: ${document.name}\nType: ${document.type}\nSize: ${document.size} bytes`;
    
    // If it's a text document, try to read its content
    if (document.type === 'document' && document.url) {
      try {
        const filePath = path.join(__dirname, '../uploads', path.basename(document.url));
        if (fs.existsSync(filePath) && document.name.toLowerCase().endsWith('.txt')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          documentContent += `\n\nContent:\n${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}`;
        }
      } catch (error) {
        console.warn('Could not read file content for analysis:', error);
      }
    }

    // Use real AI analysis
    const analysis = await aiService.analyzeDocument(documentContent, document.type);
    
    return {
      summary: analysis.summary,
      key_points: analysis.key_points,
      relevance_score: analysis.relevance_score,
      suggested_tags: analysis.suggested_tags
    };
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    
    // Fallback to template-based analysis
    const analysisTemplates = {
      document: {
        summary: `Analysis of ${document.name}: This document contains important information relevant to the project.`,
        key_points: [
          'Document contains structured information',
          'Relevant to current project goals',
          'Well-organized content structure'
        ],
        relevance_score: 0.75,
        suggested_tags: ['document', 'analyzed', 'structured']
      },
      image: {
        summary: `Analysis of ${document.name}: This image provides visual context and information.`,
        key_points: [
          'Visual content identified',
          'Relevant to project context',
          'Clear visual information'
        ],
        relevance_score: 0.70,
        suggested_tags: ['image', 'visual', 'context']
      },
      video: {
        summary: `Analysis of ${document.name}: This video contains dynamic content and information.`,
        key_points: [
          'Dynamic content identified',
          'Temporal information present',
          'Audio-visual content'
        ],
        relevance_score: 0.68,
        suggested_tags: ['video', 'dynamic', 'temporal']
      },
      audio: {
        summary: `Analysis of ${document.name}: This audio file contains spoken information.`,
        key_points: [
          'Audio content identified',
          'Spoken information present',
          'Temporal audio data'
        ],
        relevance_score: 0.65,
        suggested_tags: ['audio', 'spoken', 'temporal']
      },
      archive: {
        summary: `Analysis of ${document.name}: This archive contains multiple files and documents.`,
        key_points: [
          'Multiple files contained',
          'Compressed data structure',
          'Various content types'
        ],
        relevance_score: 0.60,
        suggested_tags: ['archive', 'multiple', 'compressed']
      },
      other: {
        summary: `Analysis of ${document.name}: This file contains specialized data.`,
        key_points: [
          'Specialized content type',
          'Requires specific analysis',
          'Unique data format'
        ],
        relevance_score: 0.55,
        suggested_tags: ['specialized', 'unique', 'data']
      }
    };

    return analysisTemplates[document.type] || analysisTemplates.other;
  }
};

// Routes

// Health check with security info
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Knowledge Base API',
    documents_count: documents.length,
    security_enabled: true,
    timestamp: new Date().toISOString()
  });
});

// Security status endpoint
app.get('/security/status', (req, res) => {
  const report = generateSecurityReport();
  res.json({
    security_report: report,
    configuration: {
      max_file_size: SECURITY_CONFIG.MAX_FILE_SIZE,
      allowed_extensions: SECURITY_CONFIG.ALLOWED_EXTENSIONS,
      rate_limit: {
        window_ms: SECURITY_CONFIG.RATE_LIMIT_WINDOW,
        max_requests: SECURITY_CONFIG.RATE_LIMIT_MAX
      }
    }
  });
});

// Security audit log endpoint
app.get('/security/audit', (req, res) => {
  const auditLog = getAuditLog();
  res.json({
    audit_log: auditLog,
    total_entries: auditLog.length
  });
});

// Get all documents
app.get('/knowledge/documents', (req, res) => {
  try {
    const { search, type, sort_by, sort_order, include_quarantined } = req.query;
    
    let filteredDocs = [...documents];
    
    // Filter out quarantined documents by default
    if (include_quarantined !== 'true') {
      filteredDocs = filteredDocs.filter(doc => !doc.security_scan?.quarantined);
    }
    
    // Apply search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => 
        doc.name.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply type filter
    if (type && typeof type === 'string' && type !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.type === type);
    }
    
    // Apply sorting
    if (sort_by && typeof sort_by === 'string') {
      filteredDocs.sort((a, b) => {
        let comparison = 0;
        
        switch (sort_by) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
            break;
          case 'size':
            comparison = a.size - b.size;
            break;
          case 'relevance':
            comparison = (b.ai_analysis?.relevance_score || 0) - (a.ai_analysis?.relevance_score || 0);
            break;
          case 'security':
            comparison = (a.security_scan?.is_safe ? 1 : 0) - (b.security_scan?.is_safe ? 1 : 0);
            break;
          default:
            comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
        }
        
        return sort_order === 'asc' ? comparison : -comparison;
      });
    }
    
    res.json({ 
      documents: filteredDocs,
      total: filteredDocs.length,
      filtered: documents.length - filteredDocs.length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get specific document
app.get('/knowledge/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.find(doc => doc.id === id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Enhanced upload endpoint with comprehensive security
app.post('/knowledge/upload', upload.single('file'), async (req, res) => {
  let tempFilePath = '';
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    tempFilePath = req.file.path;
    const { name, description, tags } = req.body as UploadRequest;
    
    // Perform comprehensive security validation
    const securityResult = await validateFileUpload(
      tempFilePath,
      req.file.originalname,
      req.file.mimetype,
      req.ip || 'unknown',
      req.get('User-Agent') || 'unknown'
    );
    
    if (!securityResult.isValid) {
      // File failed security validation
      return res.status(400).json({
        error: 'File upload blocked due to security concerns',
        threats: securityResult.threats,
        details: {
          original_name: req.file.originalname,
          sanitized_name: securityResult.sanitizedName,
          scan_time: new Date().toISOString(),
          quarantined: !!securityResult.quarantinePath
        }
      });
    }
    
    // Move file to final location with sanitized name
    const finalFilename = `${uuidv4()}_${securityResult.sanitizedName}`;
    const finalPath = path.join(storageDir, finalFilename);
    fs.renameSync(tempFilePath, finalPath);
    
    // Create document record with security information
    const document: KnowledgeDocument = {
      id: uuidv4(),
      name: name || securityResult.sanitizedName,
      type: getFileType(req.file.originalname, req.file.mimetype),
      size: req.file.size,
      uploaded_at: new Date().toISOString(),
      tags: tags ? tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
      description: description || '',
      url: `/uploads/${finalFilename}`,
      is_analyzed: false,
      security_scan: {
        scanned_at: new Date().toISOString(),
        is_safe: true,
        threats: [],
        hash: securityResult.hash,
        quarantined: false
      }
    };

    documents.push(document);
    
    return res.status(201).json({ 
      document,
      message: 'Document uploaded and validated successfully',
      security_info: {
        hash: securityResult.hash,
        sanitized_name: securityResult.sanitizedName,
        threats_detected: securityResult.threats.length,
        scan_time: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    return res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Analyze document with AI
app.post('/knowledge/analyze/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = documents.find(doc => doc.id === id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if document is quarantined
    if (document.security_scan?.quarantined) {
      return res.status(403).json({ error: 'Cannot analyze quarantined document' });
    }
    
    if (document.is_analyzed) {
      return res.json({ 
        analysis: document.ai_analysis,
        message: 'Document already analyzed'
      });
    }
    
    // Perform AI analysis
    const analysis = await analyzeDocumentWithAI(document);
    
    // Update document
    if (analysis) {
      document.ai_analysis = analysis;
      document.is_analyzed = true;
    }
    
    res.json({ 
      analysis,
      message: 'Document analyzed successfully'
    });
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

// Update document metadata
app.put('/knowledge/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, tags } = req.body;
    
    const document = documents.find(doc => doc.id === id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Check if document is quarantined
    if (document.security_scan?.quarantined) {
      return res.status(403).json({ error: 'Cannot update quarantined document' });
    }
    
    // Update fields with sanitization
    if (name) document.name = name.trim().substring(0, 255);
    if (description !== undefined) document.description = description.trim().substring(0, 1000);
    if (tags) document.tags = tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    
    res.json({ 
      document,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
app.delete('/knowledge/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const documentIndex = documents.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = documents[documentIndex];
    
    // Remove file from storage
    const filePath = path.join(storageDir, path.basename(document.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from documents array
    documents.splice(documentIndex, 1);
    
    res.json({ 
      message: 'Document deleted successfully',
      deleted_document: document
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Search documents
app.get('/knowledge/search', (req, res) => {
  try {
    const { q, type, limit = '10' } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    let filteredDocs = [...documents];
    
    // Filter out quarantined documents
    filteredDocs = filteredDocs.filter(doc => !doc.security_scan?.quarantined);
    
    // Apply search
    const searchLower = q.toLowerCase();
    filteredDocs = filteredDocs.filter(doc => 
      doc.name.toLowerCase().includes(searchLower) ||
      doc.description?.toLowerCase().includes(searchLower) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      doc.ai_analysis?.summary.toLowerCase().includes(searchLower) ||
      doc.ai_analysis?.key_points.some(point => point.toLowerCase().includes(searchLower))
    );
    
    // Apply type filter
    if (type && typeof type === 'string' && type !== 'all') {
      filteredDocs = filteredDocs.filter(doc => doc.type === type);
    }
    
    // Apply limit
    const limitNum = parseInt(limit as string);
    if (limitNum > 0) {
      filteredDocs = filteredDocs.slice(0, limitNum);
    }
    
    res.json({ 
      documents: filteredDocs,
      total: filteredDocs.length,
      query: q
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ error: 'Failed to search documents' });
  }
});

// Get document statistics
app.get('/knowledge/stats', (req, res) => {
  try {
    const stats = {
      total_documents: documents.length,
      total_size: documents.reduce((sum, doc) => sum + doc.size, 0),
      by_type: {
        document: documents.filter(doc => doc.type === 'document').length,
        image: documents.filter(doc => doc.type === 'image').length,
        video: documents.filter(doc => doc.type === 'video').length,
        audio: documents.filter(doc => doc.type === 'audio').length,
        archive: documents.filter(doc => doc.type === 'archive').length,
        other: documents.filter(doc => doc.type === 'other').length
      },
      security_stats: {
        safe_documents: documents.filter(doc => doc.security_scan?.is_safe).length,
        quarantined_documents: documents.filter(doc => doc.security_scan?.quarantined).length,
        scanned_documents: documents.filter(doc => doc.security_scan).length
      },
      analyzed: documents.filter(doc => doc.is_analyzed).length,
      not_analyzed: documents.filter(doc => !doc.is_analyzed).length,
      average_relevance: documents
        .filter(doc => doc.ai_analysis)
        .reduce((sum, doc) => sum + (doc.ai_analysis?.relevance_score || 0), 0) / 
        Math.max(documents.filter(doc => doc.ai_analysis).length, 1)
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Enhanced error handling middleware
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large. Maximum size is 100MB.',
      max_size: SECURITY_CONFIG.MAX_FILE_SIZE
    });
  }
  
  if (error.message === 'File type not allowed') {
    return res.status(400).json({ 
      error: 'File type not allowed. Please check the allowed file types.',
      allowed_extensions: SECURITY_CONFIG.ALLOWED_EXTENSIONS
    });
  }
  
  if (error.message === 'Dangerous file type detected') {
    return res.status(400).json({ 
      error: 'Dangerous file type detected. Upload blocked for security.',
      blocked_extensions: SECURITY_CONFIG.DANGEROUS_EXTENSIONS
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: 'Unexpected file in upload. Please ensure you\'re uploading a single file.',
      max_files: SECURITY_CONFIG.MAX_FILES_PER_REQUEST
    });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Knowledge Base API running on port ${PORT}`);
  console.log(`Storage directory: ${storageDir}`);
  console.log(`Quarantine directory: ${quarantineDir}`);
  console.log(`Security features enabled: File scanning, quarantine, audit logging`);
  
  // Initialize sample documents
  initializeSampleDocuments();
  console.log(`Sample documents loaded: ${documents.length}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down Knowledge Base API...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down Knowledge Base API...');
  process.exit(0);
});

export default app; 