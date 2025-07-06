'use client';

// [safeguard] Terminal View Component
// Displays system status, logs, and service health

import React, { useEffect, useState } from 'react';
import { Terminal, Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useServiceMonitoring, ServiceStatus } from '../services/[accelerate]-service-integration';

interface TerminalViewProps {
  className?: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ className = '' }) => {
  const { statuses, loading, checkHealth } = useServiceMonitoring();
  const [logs, setLogs] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  // Monitor service status changes
  useEffect(() => {
    Object.entries(statuses).forEach(([serviceKey, status]) => {
      if (status.status === 'unhealthy') {
        addLog(`⚠️  ${status.name} is unhealthy: ${status.error}`);
      } else if (status.status === 'healthy') {
        addLog(`✅ ${status.name} is healthy`);
      }
    });
  }, [statuses]);

  // Auto-refresh logs
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      addLog(`🔄 Health check completed at ${new Date().toLocaleTimeString()}`);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unhealthy':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'unknown':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'unknown':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`h-full flex flex-col bg-gray-900 text-green-400 font-mono text-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          <h2 className="text-lg font-semibold">System Terminal</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={checkHealth}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Refresh'}
          </button>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-xs">Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* Service Status Grid */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-md font-semibold mb-3">Service Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(statuses).map(([serviceKey, status]) => (
            <div
              key={serviceKey}
              className={`p-3 rounded-lg border ${getStatusColor(status.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.status)}
                  <span className="font-medium">{status.name}</span>
                </div>
                <span className="text-xs">
                  {status.lastCheck.toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 text-xs opacity-75">
                {status.url}
              </div>
              {status.error && (
                <div className="mt-1 text-xs text-red-600">
                  Error: {status.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Log Output */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-semibold">System Logs</h3>
          <button
            onClick={() => setLogs([])}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear Logs
          </button>
        </div>
        <div className="h-full overflow-y-auto bg-black rounded p-3 border border-gray-700">
          {logs.length === 0 ? (
            <div className="text-gray-500 italic">
              No logs yet. System monitoring will start automatically.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <span>
            {Object.values(statuses).filter(s => s.status === 'healthy').length} / {Object.keys(statuses).length} services healthy
          </span>
        </div>
      </div>
    </div>
  );
};

export default TerminalView; 