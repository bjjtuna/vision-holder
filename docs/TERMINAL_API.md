# Terminal API Documentation

## Overview
The Terminal API provides real-time system monitoring, command execution, and health management capabilities for the Vision Holder application. It enables comprehensive oversight of system performance and operational status.

**Base URL**: `http://localhost:3004`
**Version**: 1.0.0

## Authentication
Currently, the API does not require authentication (development mode).

## Endpoints

### Health Check

#### GET /health
Returns the health status of the Terminal API.

**Response:**
```json
{
  "status": "healthy",
  "service": "Terminal API",
  "uptime": "2h 15m",
  "last_check": "2025-07-06T10:30:00Z"
}
```

**Response Codes:**
- `200 OK` - Service is healthy
- `503 Service Unavailable` - Service is unhealthy

---

### System Metrics

#### GET /terminal/metrics
Retrieve real-time system performance metrics.

**Response:**
```json
{
  "metrics": [
    {
      "name": "CPU",
      "value": 1.25,
      "unit": "load",
      "status": "healthy",
      "trend": "stable"
    },
    {
      "name": "Memory",
      "value": 68,
      "unit": "%",
      "status": "healthy",
      "trend": "stable"
    },
    {
      "name": "Disk",
      "value": 45,
      "unit": "%",
      "status": "healthy",
      "trend": "stable"
    },
    {
      "name": "Network",
      "value": 156,
      "unit": "KB/s",
      "status": "healthy",
      "trend": "stable"
    }
  ],
  "timestamp": "2025-07-06T10:30:00Z"
}
```

**Response Codes:**
- `200 OK` - Metrics retrieved successfully
- `500 Internal Server Error` - Failed to collect metrics

---

### Log Management

#### GET /terminal/logs
Retrieve system log entries with optional filtering.

**Query Parameters:**
- `level` (optional): Filter by log level (info, warning, error, debug)
- `service` (optional): Filter by service name
- `limit` (optional): Number of entries to return (default: 50, max: 1000)
- `offset` (optional): Number of entries to skip (default: 0)
- `since` (optional): ISO 8601 timestamp to filter entries since

**Request Example:**
```bash
curl "http://localhost:3004/terminal/logs?level=error&limit=20"
```

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid-1",
      "timestamp": "2025-07-06T10:30:00Z",
      "level": "info",
      "service": "System",
      "message": "Vision Holder application started successfully",
      "details": null
    },
    {
      "id": "uuid-2",
      "timestamp": "2025-07-06T10:29:45Z",
      "level": "error",
      "service": "API",
      "message": "Failed to connect to database",
      "details": {
        "error_code": "CONN_TIMEOUT",
        "retry_count": 3
      }
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

**Response Codes:**
- `200 OK` - Logs retrieved successfully
- `400 Bad Request` - Invalid query parameters

---

#### POST /terminal/logs
Add a new log entry to the system.

**Request Body:**
```json
{
  "level": "info",
  "service": "Custom Service",
  "message": "Custom log message",
  "details": {
    "additional": "context"
  }
}
```

**Response:**
```json
{
  "id": "uuid-new",
  "timestamp": "2025-07-06T10:30:00Z",
  "level": "info",
  "service": "Custom Service",
  "message": "Custom log message",
  "details": {
    "additional": "context"
  }
}
```

**Response Codes:**
- `201 Created` - Log entry created successfully
- `400 Bad Request` - Invalid request body

---

### Command Execution

#### POST /terminal/execute
Execute a system command safely.

**Request Body:**
```json
{
  "command": "ls -la"
}
```

**Response:**
```json
{
  "id": "uuid-command",
  "command": "ls -la",
  "output": "total 1234\ndrwxr-xr-x  15 user  staff   480 Jan 1 12:00 .\n-rw-r--r--   1 user  staff  1234 Jan 1 12:00 package.json",
  "status": "success",
  "timestamp": "2025-07-06T10:30:00Z",
  "duration": 45
}
```

**Response Codes:**
- `200 OK` - Command executed successfully
- `400 Bad Request` - Invalid command
- `403 Forbidden` - Command not allowed
- `500 Internal Server Error` - Command execution failed

---

#### GET /terminal/commands
Retrieve command execution history.

**Query Parameters:**
- `limit` (optional): Number of entries to return (default: 20, max: 100)
- `offset` (optional): Number of entries to skip (default: 0)
- `status` (optional): Filter by command status (success, error, running)

**Response:**
```json
{
  "commands": [
    {
      "id": "uuid-1",
      "command": "ls -la",
      "output": "total 1234\ndrwxr-xr-x  15 user  staff   480 Jan 1 12:00 .",
      "status": "success",
      "timestamp": "2025-07-06T10:30:00Z",
      "duration": 45
    },
    {
      "id": "uuid-2",
      "command": "npm run dev",
      "output": "> vision-holder@1.0.0 dev\n> next dev\n\nready - started server on 0.0.0.0:3000",
      "status": "success",
      "timestamp": "2025-07-06T10:29:00Z",
      "duration": 1200
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

**Response Codes:**
- `200 OK` - Command history retrieved successfully
- `400 Bad Request` - Invalid query parameters

---

### Service Health

#### GET /terminal/services
Check the health status of all Vision Holder services.

**Response:**
```json
{
  "services": [
    {
      "name": "Systemic Ledger API",
      "port": 3001,
      "status": "healthy",
      "url": "http://localhost:3001",
      "last_check": "2025-07-06T10:30:00Z",
      "response_time": 25
    },
    {
      "name": "AI Orchestrator API",
      "port": 3002,
      "status": "healthy",
      "url": "http://localhost:3002",
      "last_check": "2025-07-06T10:30:00Z",
      "response_time": 30
    },
    {
      "name": "Knowledge Base API",
      "port": 3003,
      "status": "healthy",
      "url": "http://localhost:3003",
      "last_check": "2025-07-06T10:30:00Z",
      "response_time": 18
    },
    {
      "name": "Terminal API",
      "port": 3004,
      "status": "healthy",
      "url": "http://localhost:3004",
      "last_check": "2025-07-06T10:30:00Z",
      "response_time": 12
    }
  ],
  "overall_status": "healthy",
  "healthy_count": 4,
  "total_count": 4
}
```

**Response Codes:**
- `200 OK` - Service status retrieved successfully
- `500 Internal Server Error` - Failed to check service health

---

## Data Models

### SystemMetric
```typescript
interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}
```

### LogEntry
```typescript
interface LogEntry {
  id: string;
  timestamp: string; // ISO 8601 datetime
  level: 'info' | 'warning' | 'error' | 'debug';
  service: string;
  message: string;
  details?: any;
}
```

### CommandHistory
```typescript
interface CommandHistory {
  id: string;
  command: string;
  output: string;
  status: 'success' | 'error' | 'running';
  timestamp: string; // ISO 8601 datetime
  duration?: number; // milliseconds
}
```

### ServiceStatus
```typescript
interface ServiceStatus {
  name: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'unknown';
  url: string;
  last_check: string; // ISO 8601 datetime
  response_time?: number; // milliseconds
}
```

## Security Features

### Command Validation
The Terminal API implements strict command validation to prevent security risks:

**Allowed Commands:**
- Basic file operations: `ls`, `pwd`, `cat`, `head`, `tail`
- System information: `ps`, `top`, `df`, `free`
- Network utilities: `ping`, `curl` (limited)
- Development tools: `npm`, `node`, `git` (limited)

**Blocked Commands:**
- File system modification: `rm`, `mv`, `cp`, `chmod`, `chown`
- System administration: `sudo`, `su`, `kill`, `killall`
- Network access: `ssh`, `scp`, `wget`
- Package management: `apt`, `yum`, `brew` (system-level)

### Input Sanitization
- Command injection prevention
- Path traversal protection
- Output sanitization
- Error message filtering

### Access Control
- Rate limiting for command execution
- Session-based command history
- Audit logging for all operations

## System Monitoring

### Metric Collection
The Terminal API collects the following system metrics:

**CPU Metrics:**
- Load average (1, 5, 15 minutes)
- CPU usage percentage
- Process count

**Memory Metrics:**
- Total memory
- Used memory
- Available memory
- Memory usage percentage

**Disk Metrics:**
- Disk usage percentage
- Available disk space
- I/O statistics

**Network Metrics:**
- Network throughput
- Connection count
- Packet statistics

### Health Thresholds
```typescript
const HEALTH_THRESHOLDS = {
  cpu: {
    healthy: 0 - 70,
    warning: 70 - 90,
    critical: 90 - 100
  },
  memory: {
    healthy: 0 - 70,
    warning: 70 - 90,
    critical: 90 - 100
  },
  disk: {
    healthy: 0 - 80,
    warning: 80 - 95,
    critical: 95 - 100
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error context"
  }
}
```

### Common Error Codes
- `COMMAND_NOT_ALLOWED` - Command is blocked for security
- `COMMAND_FAILED` - Command execution failed
- `METRICS_UNAVAILABLE` - Unable to collect system metrics
- `SERVICE_UNREACHABLE` - Service health check failed
- `INVALID_LOG_LEVEL` - Invalid log level specified

## WebSocket Support
Real-time updates for system metrics and logs are not currently implemented but planned for future versions.

## Examples

### Monitor System Health
```bash
# Get current system metrics
curl http://localhost:3004/terminal/metrics

# Check all service health
curl http://localhost:3004/terminal/services

# Get recent error logs
curl "http://localhost:3004/terminal/logs?level=error&limit=10"
```

### Execute Commands
```bash
# List directory contents
curl -X POST http://localhost:3004/terminal/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "ls -la"}'

# Check system processes
curl -X POST http://localhost:3004/terminal/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "ps aux"}'

# Get command history
curl http://localhost:3004/terminal/commands
```

### Log Management
```bash
# Add custom log entry
curl -X POST http://localhost:3004/terminal/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "service": "Custom",
    "message": "Custom operation completed",
    "details": {"operation": "data_sync"}
  }'

# Get logs from specific service
curl "http://localhost:3004/terminal/logs?service=API&limit=20"
```

---

**Last Updated**: 2025-07-06
**API Version**: 1.0.0
**Service**: Terminal API (Port 3004) 