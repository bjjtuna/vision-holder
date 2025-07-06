// [safeguard] Error Logging System
// Comprehensive error logging and monitoring for production

import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import { Request, Response, NextFunction } from 'express';

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  context: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
    body?: any;
    params?: any;
    query?: any;
  };
  metadata: {
    environment: string;
    version: string;
    service: string;
    memoryUsage?: NodeJS.MemoryUsage;
    uptime?: number;
  };
}

export interface PerformanceLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  requestSize: number;
  responseSize: number;
  userId?: string;
  sessionId?: string;
}

class ErrorLoggingService {
  private logger: any;
  private logDir: string;
  private maxLogSize: number;
  private maxFiles: number;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.maxLogSize = 10 * 1024 * 1024; // 10MB
    this.maxFiles = 5;
    
    this.ensureLogDirectory();
    this.initializeLogger();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private initializeLogger(): void {
    const logFormat = format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json()
    );

    this.logger = createLogger({
      level: process.env['LOG_LEVEL'] || 'info',
      format: logFormat,
      transports: [
        // Console transport for development
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        }),
        
        // File transport for errors
        new transports.File({
          filename: path.join(this.logDir, 'error.log'),
          level: 'error',
          maxsize: this.maxLogSize,
          maxFiles: this.maxFiles,
          format: logFormat
        }),
        
        // File transport for all logs
        new transports.File({
          filename: path.join(this.logDir, 'combined.log'),
          maxsize: this.maxLogSize,
          maxFiles: this.maxFiles,
          format: logFormat
        }),
        
        // Performance logs
        new transports.File({
          filename: path.join(this.logDir, 'performance.log'),
          level: 'info',
          maxsize: this.maxLogSize,
          maxFiles: this.maxFiles,
          format: logFormat
        })
      ]
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logError('Uncaught Exception', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logError('Unhandled Rejection', new Error(`Promise rejected: ${reason}`));
    });
  }

  public logError(message: string, error: Error, context?: Partial<ErrorLog['context']>): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      stack: error.stack,
      context: {
        ...context,
        ...this.getDefaultContext()
      },
      metadata: this.getMetadata()
    };

    this.logger.error(errorLog);
  }

  public logWarning(message: string, context?: Partial<ErrorLog['context']>): void {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context: {
        ...context,
        ...this.getDefaultContext()
      },
      metadata: this.getMetadata()
    };

    this.logger.warn(warningLog);
  }

  public logInfo(message: string, context?: Partial<ErrorLog['context']>): void {
    const infoLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context: {
        ...context,
        ...this.getDefaultContext()
      },
      metadata: this.getMetadata()
    };

    this.logger.info(infoLog);
  }

  public logPerformance(performanceLog: PerformanceLog): void {
    this.logger.info({
      ...performanceLog,
      level: 'info',
      type: 'performance'
    });
  }

  public logSecurityEvent(event: string, details: any, context?: Partial<ErrorLog['context']>): void {
    const securityLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: `Security Event: ${event}`,
      context: {
        ...context,
        ...this.getDefaultContext(),
        securityDetails: details
      },
      metadata: this.getMetadata()
    };

    this.logger.warn(securityLog);
  }

  public logAccessibilityEvent(event: string, details: any, context?: Partial<ErrorLog['context']>): void {
    const accessibilityLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Accessibility Event: ${event}`,
      context: {
        ...context,
        ...this.getDefaultContext(),
        accessibilityDetails: details
      },
      metadata: this.getMetadata()
    };

    this.logger.info(accessibilityLog);
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultContext(): Partial<ErrorLog['context']> {
    return {
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0'
    };
  }

  private getMetadata(): ErrorLog['metadata'] {
    return {
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      service: 'vision-holder-api',
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  // Express middleware for request logging
  public requestLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const requestId = this.generateId();
      
      // Add request ID to response headers
      res.setHeader('X-Request-ID', requestId);
      
      // Log request start
      this.logInfo('Request started', {
        requestId,
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        body: this.sanitizeBody(req.body),
        params: req.params,
        query: req.query
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        const duration = Date.now() - startTime;
        const performanceLog: PerformanceLog = {
          id: requestId,
          timestamp: new Date().toISOString(),
          endpoint: req.path,
          method: req.method,
          duration,
          statusCode: res.statusCode,
          requestSize: JSON.stringify(req.body).length,
          responseSize: chunk ? chunk.length : 0
        };

        // Log performance
        this.logPerformance(performanceLog);

        // Log response
        this.logInfo('Request completed', {
          requestId,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          duration
        });

        originalEnd.call(res, chunk, encoding);
      }.bind(this);

      next();
    };
  }

  // Express middleware for error handling
  public errorHandler() {
    return (error: Error, req: Request, res: Response, next: NextFunction) => {
      this.logError('Express error handler caught error', error, {
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        body: this.sanitizeBody(req.body),
        params: req.params,
        query: req.query
      });

      // Don't expose internal errors in production
      const isProduction = process.env.NODE_ENV === 'production';
      const message = isProduction ? 'Internal server error' : error.message;
      const stack = isProduction ? undefined : error.stack;

      res.status(500).json({
        error: message,
        requestId: res.getHeader('X-Request-ID'),
        ...(stack && { stack })
      });
    };
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  // Get log statistics
  public async getLogStats(): Promise<{
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
    averageResponseTime: number;
    errorRate: number;
    recentErrors: ErrorLog[];
  }> {
    // This would typically query the log files or database
    // For now, return mock data
    return {
      totalErrors: 0,
      totalWarnings: 0,
      totalInfo: 0,
      averageResponseTime: 0,
      errorRate: 0,
      recentErrors: []
    };
  }

  // Export logs for analysis
  public async exportLogs(startDate: Date, endDate: Date, level?: string): Promise<ErrorLog[]> {
    // This would read from log files and filter by date/level
    // For now, return empty array
    return [];
  }
}

// Create singleton instance
export const errorLoggingService = new ErrorLoggingService();

// Export for use in other modules
export default errorLoggingService; 