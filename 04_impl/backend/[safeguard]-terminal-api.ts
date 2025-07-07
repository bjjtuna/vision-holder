// [safeguard] Terminal API Backend
// Based on contract: /03_contract/[clarify]-system-architecture-schema.md

import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

// Types based on contract schema
export interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  service: string;
  message: string;
  details?: any;
}

export interface CommandHistory {
  id: string;
  command: string;
  output: string;
  status: 'success' | 'error' | 'running';
  timestamp: string;
  duration?: number;
}

export interface CommandRequest {
  command: string;
}

// In-memory storage (replace with database in production)
let logEntries: LogEntry[] = [];
let commandHistory: CommandHistory[] = [];

// Initialize with sample data
const initializeSampleData = () => {
  // Sample log entries
  const sampleLogs: Omit<LogEntry, 'id'>[] = [
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'info',
      service: 'System',
      message: 'Vision Holder application started successfully'
    },
    {
      timestamp: new Date(Date.now() - 45000).toISOString(),
      level: 'info',
      service: 'API',
      message: 'Systemic Ledger API initialized on port 3001'
    },
    {
      timestamp: new Date(Date.now() - 30000).toISOString(),
      level: 'info',
      service: 'API',
      message: 'AI Orchestrator API initialized on port 3002'
    },
    {
      timestamp: new Date(Date.now() - 15000).toISOString(),
      level: 'info',
      service: 'API',
      message: 'Knowledge Base API initialized on port 3003'
    },
    {
      timestamp: new Date(Date.now() - 5000).toISOString(),
      level: 'info',
      service: 'Terminal',
      message: 'Terminal API initialized on port 3004'
    }
  ];

  sampleLogs.forEach(log => {
    logEntries.push({
      ...log,
      id: uuidv4()
    });
  });

  // Sample command history
  const sampleCommands: Omit<CommandHistory, 'id'>[] = [
    {
      command: 'ls -la',
      output: 'total 1234\ndrwxr-xr-x  15 user  staff   480 Jan 1 12:00 .\ndrwxr-xr-x   3 user  staff    96 Jan 1 12:00 ..\n-rw-r--r--   1 user  staff  1234 Jan 1 12:00 package.json\n-rw-r--r--   1 user  staff  5678 Jan 1 12:00 README.md',
      status: 'success',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      duration: 45
    },
    {
      command: 'npm run dev',
      output: '> vision-holder@1.0.0 dev\n> next dev\n\nready - started server on 0.0.0.0:3000, url: http://localhost:3000',
      status: 'success',
      timestamp: new Date(Date.now() - 20000).toISOString(),
      duration: 1200
    }
  ];

  sampleCommands.forEach(cmd => {
    commandHistory.push({
      ...cmd,
      id: uuidv4()
    });
  });
};

// Initialize sample data
initializeSampleData();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions
const getSystemMetrics = async (): Promise<SystemMetric[]> => {
  const metrics: SystemMetric[] = [];
  
  try {
    // CPU Usage
    const cpuUsage = os.loadavg()[0];
    const cpuMetric: SystemMetric = {
      name: 'CPU',
      value: Math.round(cpuUsage * 100) / 100,
      unit: 'load',
      status: cpuUsage < 1 ? 'healthy' : cpuUsage < 2 ? 'warning' : 'critical',
      trend: 'stable'
    };
    metrics.push(cpuMetric);

    // Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = (usedMem / totalMem) * 100;
    
    const memoryMetric: SystemMetric = {
      name: 'Memory',
      value: Math.round(memoryUsage),
      unit: '%',
      status: memoryUsage < 70 ? 'healthy' : memoryUsage < 90 ? 'warning' : 'critical',
      trend: 'stable'
    };
    metrics.push(memoryMetric);

    // Disk Usage (simulated)
    const diskUsage = Math.random() * 100;
    const diskMetric: SystemMetric = {
      name: 'Disk',
      value: Math.round(diskUsage),
      unit: '%',
      status: diskUsage < 80 ? 'healthy' : diskUsage < 95 ? 'warning' : 'critical',
      trend: 'stable'
    };
    metrics.push(diskMetric);

    // Network Activity (simulated)
    const networkActivity = Math.random() * 1000;
    const networkMetric: SystemMetric = {
      name: 'Network',
      value: Math.round(networkActivity),
      unit: 'KB/s',
      status: 'healthy',
      trend: 'stable'
    };
    metrics.push(networkMetric);

  } catch (error) {
    console.error('Error getting system metrics:', error);
  }

  return metrics;
};

const addLogEntry = (level: LogEntry['level'], service: string, message: string, details?: any) => {
  const logEntry: LogEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    details
  };
  
  logEntries.push(logEntry);
  
  // Keep only last 1000 log entries
  if (logEntries.length > 1000) {
    logEntries = logEntries.slice(-1000);
  }
  
  return logEntry;
};

const executeCommandSafely = async (command: string): Promise<{ output: string; success: boolean; duration: number }> => {
  const startTime = Date.now();
  
  // Security: Only allow safe commands
  const allowedCommands = [
    'ls', 'pwd', 'whoami', 'date', 'uptime', 'ps', 'top', 'df', 'du',
    'cat', 'head', 'tail', 'grep', 'find', 'wc', 'sort', 'uniq',
    'echo', 'printf', 'env', 'uname', 'hostname', 'id', 'groups'
  ];
  
  const commandParts = command.trim().split(' ');
  const baseCommand = commandParts[0];
  
  if (!allowedCommands.includes(baseCommand)) {
    const duration = Date.now() - startTime;
    addLogEntry('error', 'Terminal', `Command not allowed: ${command}`, { command });
    return {
      output: `Error: Command '${baseCommand}' is not allowed for security reasons.`,
      success: false,
      duration
    };
  }
  
  try {
    const { stdout, stderr } = await execAsync(command, { timeout: 30000 }); // 30 second timeout
    const duration = Date.now() - startTime;
    
    const output = stderr ? `${stdout}\n${stderr}` : stdout;
    
    addLogEntry('info', 'Terminal', `Command executed: ${command}`, { command, duration, success: true });
    
    return {
      output: output || 'Command executed successfully (no output)',
      success: true,
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error.message || 'Unknown error';
    
    addLogEntry('error', 'Terminal', `Command failed: ${command}`, { command, error: errorMessage, duration });
    
    return {
      output: `Error: ${errorMessage}`,
      success: false,
      duration
    };
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Terminal API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: os.platform(),
    arch: os.arch()
  });
});

// Get system metrics
app.get('/terminal/metrics', async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.json({ metrics });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

// Get log entries
app.get('/terminal/logs', (req, res) => {
  try {
    const { level, service, limit = '100' } = req.query;
    
    let filteredLogs = [...logEntries];
    
    // Apply filters
    if (level && typeof level === 'string') {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (service && typeof service === 'string') {
      filteredLogs = filteredLogs.filter(log => log.service === service);
    }
    
    // Apply limit
    const limitNum = parseInt(limit as string);
    if (limitNum > 0) {
      filteredLogs = filteredLogs.slice(-limitNum);
    }
    
    res.json({ 
      logs: filteredLogs,
      total: filteredLogs.length,
      filtered: logEntries.length - filteredLogs.length
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Clear logs
app.delete('/terminal/logs', (req, res) => {
  try {
    const clearedCount = logEntries.length;
    logEntries = [];
    addLogEntry('info', 'Terminal', 'Logs cleared by user', { clearedCount });
    res.json({ message: 'Logs cleared successfully', clearedCount });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

// Export logs
app.get('/terminal/logs/export', (req, res) => {
  try {
    const exportData = {
      exported_at: new Date().toISOString(),
      total_logs: logEntries.length,
      logs: logEntries
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting logs:', error);
    res.status(500).json({ error: 'Failed to export logs' });
  }
});

// Get command history
app.get('/terminal/commands', (req, res) => {
  try {
    const { limit = '50' } = req.query;
    
    let filteredCommands = [...commandHistory];
    
    // Apply limit
    const limitNum = parseInt(limit as string);
    if (limitNum > 0) {
      filteredCommands = filteredCommands.slice(-limitNum);
    }
    
    res.json({ 
      commands: filteredCommands,
      total: filteredCommands.length
    });
  } catch (error) {
    console.error('Error fetching command history:', error);
    res.status(500).json({ error: 'Failed to fetch command history' });
  }
});

// Execute command
app.post('/terminal/execute', async (req, res) => {
  try {
    const { command } = req.body as CommandRequest;
    
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    // Add to command history
    const commandId = uuidv4();
    const newCommand: CommandHistory = {
      id: commandId,
      command,
      output: '',
      status: 'running',
      timestamp: new Date().toISOString()
    };
    
    commandHistory.push(newCommand);
    
    // Execute command
    const result = await executeCommandSafely(command);
    
    // Update command history
    const commandIndex = commandHistory.findIndex(cmd => cmd.id === commandId);
    if (commandIndex !== -1) {
      commandHistory[commandIndex] = {
        ...commandHistory[commandIndex],
        command: newCommand.command,
      output: result.output,
      status: result.success ? 'success' : 'error',
      duration: result.duration,
      id: newCommand.id,
      timestamp: newCommand.timestamp
    };
    }
    
    res.json({
      success: result.success,
      output: result.output,
      duration: result.duration,
      command_id: commandId
    });
  } catch (error) {
    console.error('Error executing command:', error);
    res.status(500).json({ error: 'Failed to execute command' });
  }
});

// Get system information
app.get('/terminal/system-info', (req, res) => {
  try {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      type: os.type(),
      release: os.release(),
      uptime: os.uptime(),
      total_memory: os.totalmem(),
      free_memory: os.freemem(),
      cpus: os.cpus().length,
      load_average: os.loadavg(),
      network_interfaces: os.networkInterfaces(),
      user_info: os.userInfo(),
      version: process.version,
      pid: process.pid,
      memory_usage: process.memoryUsage()
    };
    
    res.json({ systemInfo });
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({ error: 'Failed to fetch system information' });
  }
});

// Get process list
app.get('/terminal/processes', async (req, res) => {
  try {
    const { stdout } = await execAsync('ps aux --no-headers', { timeout: 10000 });
    const processes = stdout
      .trim()
      .split('\n')
      .map(line => {
        const parts = line.split(/\s+/);
        return {
          user: parts[0],
          pid: parts[1],
          cpu: parts[2],
          mem: parts[3],
          vsz: parts[4],
          rss: parts[5],
          tty: parts[6],
          stat: parts[7],
          start: parts[8],
          time: parts[9],
          command: parts.slice(10).join(' ')
        };
      })
      .slice(0, 50); // Limit to first 50 processes
    
    res.json({ processes });
  } catch (error) {
    console.error('Error fetching processes:', error);
    res.status(500).json({ error: 'Failed to fetch process list' });
  }
});

// Get disk usage
app.get('/terminal/disk-usage', async (req, res) => {
  try {
    const { stdout } = await execAsync('df -h', { timeout: 10000 });
    const diskUsage = stdout
      .trim()
      .split('\n')
      .slice(1) // Skip header
      .map(line => {
        const parts = line.split(/\s+/);
        return {
          filesystem: parts[0],
          size: parts[1],
          used: parts[2],
          available: parts[3],
          use_percent: parts[4],
          mounted_on: parts[5]
        };
      });
    
    res.json({ diskUsage });
  } catch (error) {
    console.error('Error fetching disk usage:', error);
    res.status(500).json({ error: 'Failed to fetch disk usage' });
  }
});

// Add log entry (for testing)
app.post('/terminal/logs', (req, res) => {
  try {
    const { level, service, message, details } = req.body;
    
    if (!level || !service || !message) {
      return res.status(400).json({ error: 'Level, service, and message are required' });
    }
    
    const logEntry = addLogEntry(level, service, message, details);
    res.status(201).json({ logEntry });
  } catch (error) {
    console.error('Error adding log entry:', error);
    res.status(500).json({ error: 'Failed to add log entry' });
  }
});

// GET /terminal/services - Check health of all Vision Holder services
app.get('/terminal/services', async (req, res) => {
  try {
    const services = [
      {
        name: 'Systemic Ledger API',
        port: 3001,
        url: 'http://localhost:3001',
        healthEndpoint: '/health'
      },
      {
        name: 'AI Orchestrator API',
        port: 3002,
        url: 'http://localhost:3002',
        healthEndpoint: '/health'
      },
      {
        name: 'Knowledge Base API',
        port: 3003,
        url: 'http://localhost:3003',
        healthEndpoint: '/health'
      },
      {
        name: 'Terminal API',
        port: 3004,
        url: 'http://localhost:3004',
        healthEndpoint: '/health'
      }
    ];

    const serviceChecks = await Promise.allSettled(
      services.map(async (service) => {
        const startTime = Date.now();
        try {
          const response = await fetch(`${service.url}${service.healthEndpoint}`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          
          const responseTime = Date.now() - startTime;
          
          return {
            name: service.name,
            port: service.port,
            status: response.ok ? 'healthy' : 'unhealthy',
            url: service.url,
            last_check: new Date().toISOString(),
            response_time: responseTime
          };
        } catch (error) {
          const responseTime = Date.now() - startTime;
          return {
            name: service.name,
            port: service.port,
            status: 'unhealthy',
            url: service.url,
            last_check: new Date().toISOString(),
            response_time: responseTime
          };
        }
      })
    );

    const serviceStatuses = serviceChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const service = services[index];
        if (!service) {
          return {
            name: 'Unknown Service',
            port: 0,
            status: 'unknown',
            url: 'unknown',
            last_check: new Date().toISOString(),
            response_time: null
          };
        }
        return {
          name: service.name,
          port: service.port,
          status: 'unknown',
          url: service.url,
          last_check: new Date().toISOString(),
          response_time: null
        };
      }
    });

    const healthyCount = serviceStatuses.filter(s => s.status === 'healthy').length;
    const overallStatus = healthyCount === serviceStatuses.length ? 'healthy' : 
                         healthyCount > 0 ? 'degraded' : 'unhealthy';

    res.json({
      services: serviceStatuses,
      overall_status: overallStatus,
      healthy_count: healthyCount,
      total_count: serviceStatuses.length
    });
  } catch (error) {
    console.error('Error checking service health:', error);
    res.status(500).json({ error: 'Failed to check service health' });
  }
});

// Error handling middleware
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Terminal API Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Terminal API running on port ${PORT}`);
  console.log(`Sample data loaded: ${logEntries.length} logs, ${commandHistory.length} commands`);
  
  // Add startup log
  addLogEntry('info', 'Terminal', `Terminal API started on port ${PORT}`);
});

export default app; 