// [accelerate] Service Integration Layer
// Connects frontend to all backend services with proper error handling

import React from 'react';

export interface ServiceStatus {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  error?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  service: string;
}

// Service configurations
const SERVICES = {
  SYSTEMIC_LEDGER: {
    name: 'Systemic Ledger API',
    url: 'http://localhost:3001',
    healthEndpoint: '/health'
  },
  AI_ORCHESTRATOR: {
    name: 'AI Orchestrator API',
    url: 'http://localhost:3002',
    healthEndpoint: '/health'
  },
  KNOWLEDGE_BASE: {
    name: 'Knowledge Base API',
    url: 'http://localhost:3003',
    healthEndpoint: '/health'
  },
  TERMINAL: {
    name: 'Terminal API',
    url: 'http://localhost:3004',
    healthEndpoint: '/health'
  }
};

// Service status tracking
let serviceStatuses: Record<string, ServiceStatus> = {};

// Health check function
export const checkServiceHealth = async (serviceKey: keyof typeof SERVICES): Promise<ServiceStatus> => {
  const service = SERVICES[serviceKey];
  const healthUrl = `${service.url}${service.healthEndpoint}`;
  
  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (response.ok) {
      const data: HealthCheckResponse = await response.json();
      const status: ServiceStatus = {
        name: service.name,
        url: service.url,
        status: 'healthy',
        lastCheck: new Date()
      };
      serviceStatuses[serviceKey] = status;
      return status;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    const status: ServiceStatus = {
      name: service.name,
      url: service.url,
      status: 'unhealthy',
      lastCheck: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    serviceStatuses[serviceKey] = status;
    return status;
  }
};

// Check all services health
export const checkAllServicesHealth = async (): Promise<Record<string, ServiceStatus>> => {
  const healthChecks = await Promise.allSettled([
    checkServiceHealth('SYSTEMIC_LEDGER'),
    checkServiceHealth('AI_ORCHESTRATOR'),
    checkServiceHealth('KNOWLEDGE_BASE'),
    checkServiceHealth('TERMINAL')
  ]);

  const results: Record<string, ServiceStatus> = {};
  const serviceKeys = Object.keys(SERVICES) as (keyof typeof SERVICES)[];

  healthChecks.forEach((result, index) => {
    const serviceKey = serviceKeys[index];
    if (result.status === 'fulfilled') {
      results[serviceKey] = result.value;
    } else {
      results[serviceKey] = {
        name: SERVICES[serviceKey].name,
        url: SERVICES[serviceKey].url,
        status: 'unknown',
        lastCheck: new Date(),
        error: result.reason?.message || 'Unknown error'
      };
    }
  });

  serviceStatuses = results;
  return results;
};

// Get current service statuses
export const getServiceStatuses = (): Record<string, ServiceStatus> => {
  return { ...serviceStatuses };
};

// API client functions with error handling and retry logic
export class APIClient {
  private baseURL: string;
  private serviceName: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor(serviceKey: keyof typeof SERVICES) {
    this.baseURL = SERVICES[serviceKey].url;
    this.serviceName = SERVICES[serviceKey].name;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
        ...options
      });

      if (!response.ok) {
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new ServiceError(
            `${this.serviceName} error: ${response.status} ${response.statusText}`,
            this.serviceName,
            response.status
          );
        }
        
        // Retry on server errors (5xx) or network issues
        if (retryCount < this.maxRetries) {
          console.warn(`Retrying ${this.serviceName} request (${retryCount + 1}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        
        throw new ServiceError(
          `${this.serviceName} error: ${response.status} ${response.statusText}`,
          this.serviceName,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      // Handle network errors and timeouts
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
        if (retryCount < this.maxRetries) {
          console.warn(`Retrying ${this.serviceName} request due to timeout (${retryCount + 1}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
          return this.request<T>(endpoint, options, retryCount + 1);
        }
      }
      
      console.error(`API request failed for ${this.serviceName}:`, error);
      
      if (error instanceof ServiceError) {
        throw error;
      }
      
      throw new ServiceError(
        `${this.serviceName} is unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.serviceName
      );
    }
  }

  // Generic GET request
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // Generic DELETE request
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Service-specific API clients
export const systemicLedgerAPI = new APIClient('SYSTEMIC_LEDGER');
export const aiOrchestratorAPI = new APIClient('AI_ORCHESTRATOR');
export const knowledgeBaseAPI = new APIClient('KNOWLEDGE_BASE');
export const terminalAPI = new APIClient('TERMINAL');

// Service monitoring hook
export const useServiceMonitoring = () => {
  const [statuses, setStatuses] = React.useState<Record<string, ServiceStatus>>({});
  const [loading, setLoading] = React.useState(true);

  const checkHealth = React.useCallback(async () => {
    setLoading(true);
    try {
      const healthStatuses = await checkAllServicesHealth();
      setStatuses(healthStatuses);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { statuses, loading, checkHealth };
};

// Error handling utilities
export class ServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export const handleServiceError = (error: unknown, serviceName: string): ServiceError => {
  if (error instanceof ServiceError) {
    return error;
  }
  
  const message = error instanceof Error ? error.message : 'Unknown service error';
  return new ServiceError(message, serviceName);
}; 