// [safeguard] Security Middleware
// Comprehensive security features for production deployment

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { errorLoggingService } from './[safeguard]-error-logging';
import path from 'path';

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // CORS configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  },
  
  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
};

// Rate limiting for different endpoints
const createRateLimit = (options: any) => {
  return rateLimit({
    ...SECURITY_CONFIG.rateLimit,
    ...options
  });
};

// Specific rate limits for different endpoints
export const rateLimits = {
  // General API rate limit
  general: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  }),
  
  // Authentication endpoints (stricter)
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later.'
  }),
  
  // File upload endpoints
  upload: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many file uploads, please try again later.'
  }),
  
  // Chat/API endpoints
  api: createRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: 'Too many API requests, please slow down.'
  })
};

// Security middleware setup
export const setupSecurityMiddleware = (app: express.Application) => {
  // Basic security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: SECURITY_CONFIG.csp.directives
    },
    crossOriginEmbedderPolicy: false, // Disable for development
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS configuration
  app.use(cors(SECURITY_CONFIG.cors));

  // Additional security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    Object.entries(SECURITY_CONFIG.headers).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
    next();
  });

  // Request size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security logging middleware
  app.use(securityLoggingMiddleware);

  // Input validation middleware
  app.use(inputValidationMiddleware);

  // SQL injection protection
  app.use(sqlInjectionProtection);

  // XSS protection
  app.use(xssProtection);

  console.log('Security middleware configured successfully');
};

// Security logging middleware
const securityLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Log suspicious requests
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /exec\s*\(/i,
    /eval\s*\(/i
  ];

  const requestString = JSON.stringify({
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  }).toLowerCase();

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));

  if (isSuspicious) {
    errorLoggingService.logSecurityEvent('Suspicious request detected', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      pattern: suspiciousPatterns.find(pattern => pattern.test(requestString))?.toString()
    }, {
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  next();
};

// Input validation middleware
const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body, query, and params
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// SQL injection protection
const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
    /(\b(and|or)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(and|or)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i,
    /(--|\/\*|\*\/)/,
    /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(union|select|insert|update|delete|drop|create|alter)\b)/i
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  const hasSqlInjection = sqlPatterns.some(pattern => pattern.test(requestData));

  if (hasSqlInjection) {
    errorLoggingService.logSecurityEvent('SQL injection attempt detected', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      pattern: sqlPatterns.find(pattern => pattern.test(requestData))?.toString()
    }, {
      endpoint: req.path,
      method: req.method,
      ip: req.ip
    });

    return res.status(403).json({
      error: 'Invalid request detected',
      requestId: res.getHeader('X-Request-ID')
    });
  }

  next();
};

// XSS protection
const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  const hasXSS = xssPatterns.some(pattern => pattern.test(requestData));

  if (hasXSS) {
    errorLoggingService.logSecurityEvent('XSS attempt detected', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      pattern: xssPatterns.find(pattern => pattern.test(requestData))?.toString()
    }, {
      endpoint: req.path,
      method: req.method,
      ip: req.ip
    });

    return res.status(403).json({
      error: 'Invalid request detected',
      requestId: res.getHeader('X-Request-ID')
    });
  }

  next();
};

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorLoggingService.logSecurityEvent('Unauthorized access attempt', {
      url: req.url,
      method: req.method,
      ip: req.ip
    }, {
      endpoint: req.path,
      method: req.method,
      ip: req.ip
    });

    return res.status(401).json({
      error: 'Authentication required',
      requestId: res.getHeader('X-Request-ID')
    });
  }

  const token = authHeader.substring(7);
  
  // Here you would validate the JWT token
  // For now, we'll just check if it exists
  if (!token) {
    return res.status(401).json({
      error: 'Invalid token',
      requestId: res.getHeader('X-Request-ID')
    });
  }

  // Add user info to request
  (req as any).user = { token }; // In real app, decode JWT here
  
  next();
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user || !user.role || !roles.includes(user.role)) {
      errorLoggingService.logSecurityEvent('Insufficient permissions', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        requiredRoles: roles,
        userRole: user?.role
      }, {
        endpoint: req.path,
        method: req.method,
        ip: req.ip
      });

      return res.status(403).json({
        error: 'Insufficient permissions',
        requestId: res.getHeader('X-Request-ID')
      });
    }
    
    next();
  };
};

// File upload security
export const validateFileUpload = (allowedTypes: string[], maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        requestId: res.getHeader('X-Request-ID')
      });
    }

    const files = Array.isArray(req.files) ? req.files : Object.values(req.files);
    
    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        errorLoggingService.logSecurityEvent('File too large', {
          fileName: file.name,
          fileSize: file.size,
          maxSize,
          ip: req.ip
        }, {
          endpoint: req.path,
          method: req.method,
          ip: req.ip
        });

        return res.status(400).json({
          error: `File ${file.name} is too large. Maximum size is ${maxSize} bytes.`,
          requestId: res.getHeader('X-Request-ID')
        });
      }

      // Check file type
      const fileType = file.mimetype;
      if (!allowedTypes.includes(fileType)) {
        errorLoggingService.logSecurityEvent('Invalid file type', {
          fileName: file.name,
          fileType,
          allowedTypes,
          ip: req.ip
        }, {
          endpoint: req.path,
          method: req.method,
          ip: req.ip
        });

        return res.status(400).json({
          error: `File type ${fileType} is not allowed.`,
          requestId: res.getHeader('X-Request-ID')
        });
      }

      // Check for malicious file extensions
      const maliciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
      const fileExtension = path.extname(file.name).toLowerCase();
      
      if (maliciousExtensions.includes(fileExtension)) {
        errorLoggingService.logSecurityEvent('Malicious file extension detected', {
          fileName: file.name,
          fileExtension,
          ip: req.ip
        }, {
          endpoint: req.path,
          method: req.method,
          ip: req.ip
        });

        return res.status(400).json({
          error: 'File type not allowed for security reasons.',
          requestId: res.getHeader('X-Request-ID')
        });
      }
    }
    
    next();
  };
};

// Health check endpoint with security
export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env['NODE_ENV'],
    version: process.env['APP_VERSION'] || '1.0.0',
    requestId: res.getHeader('X-Request-ID')
  });
};

export default {
  setupSecurityMiddleware,
  rateLimits,
  requireAuth,
  requireRole,
  validateFileUpload,
  healthCheck
}; 