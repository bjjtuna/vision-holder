'use client';

// [empathize] User Feedback Component
// Provides user-friendly error messages and retry options

import React, { useState } from 'react';
import { 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Server, 
  Clock, 
  CheckCircle,
  X,
  Info,
  HelpCircle
} from 'lucide-react';

export interface ErrorDetails {
  message: string;
  service?: string;
  statusCode?: number;
  retryable?: boolean;
  timestamp: Date;
  userAction?: string;
}

interface UserFeedbackProps {
  error?: ErrorDetails | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

interface SuccessMessage {
  message: string;
  timestamp: Date;
  autoHide?: boolean;
}

export const UserFeedback: React.FC<UserFeedbackProps> = ({
  error,
  onRetry,
  onDismiss,
  className = ''
}) => {
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);

  const getErrorIcon = (error: ErrorDetails) => {
    if (error.statusCode === 404) return <HelpCircle className="w-5 h-5" />;
    if (error.statusCode && error.statusCode >= 500) return <Server className="w-5 h-5" />;
    if (error.message.includes('timeout') || error.message.includes('network')) return <WifiOff className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getErrorColor = (error: ErrorDetails) => {
    if (error.statusCode === 404) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (error.statusCode && error.statusCode >= 500) return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (error.message.includes('timeout') || error.message.includes('network')) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getErrorMessage = (error: ErrorDetails) => {
    // User-friendly error messages
    if (error.statusCode === 404) {
      return "We couldn't find what you're looking for. Please check your request and try again.";
    }
    if (error.statusCode && error.statusCode >= 500) {
      return "Our servers are having trouble right now. We're working on it and will be back soon.";
    }
    if (error.message.includes('timeout')) {
      return "The request is taking longer than expected. This might be due to high traffic.";
    }
    if (error.message.includes('network') || error.message.includes('unavailable')) {
      return "We can't connect to our services right now. Please check your internet connection.";
    }
    return error.message;
  };

  const getRetryMessage = (error: ErrorDetails) => {
    if (error.statusCode === 404) {
      return "Try a different search or check your spelling.";
    }
    if (error.statusCode && error.statusCode >= 500) {
      return "Try again in a few moments when our servers are back online.";
    }
    if (error.message.includes('timeout')) {
      return "Try again - the connection should be faster now.";
    }
    if (error.message.includes('network')) {
      return "Check your internet connection and try again.";
    }
    return "Try again in a moment.";
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      // Show success message if retry is successful
      setSuccessMessage({
        message: "Retrying your request...",
        timestamp: new Date(),
        autoHide: true
      });
    }
  };

  // Auto-hide success messages
  React.useEffect(() => {
    if (successMessage?.autoHide) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (successMessage) {
    return (
      <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-green-800 dark:text-green-200 text-dyslexia-friendly">
                {successMessage.message}
              </p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!error) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <div className={`border rounded-lg p-4 shadow-lg ${getErrorColor(error)}`}>
        <div className="flex items-start gap-3">
          {getErrorIcon(error)}
          <div className="flex-1">
            <h3 className="font-medium text-dyslexia-friendly mb-1">
              {error.service ? `${error.service} Error` : 'Something went wrong'}
            </h3>
            <p className="text-sm text-dyslexia-friendly mb-3">
              {getErrorMessage(error)}
            </p>
            
            {error.retryable !== false && onRetry && (
              <div className="space-y-2">
                <p className="text-xs opacity-75 text-dyslexia-friendly">
                  {getRetryMessage(error)}
                </p>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 text-sm rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-dyslexia-friendly"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            )}
            
            <div className="mt-3 text-xs opacity-60 text-dyslexia-friendly">
              {error.timestamp.toLocaleTimeString()}
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Connection status indicator
interface ConnectionStatusProps {
  isOnline: boolean;
  lastCheck: Date;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isOnline,
  lastCheck,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-500" />
      )}
      <span className="text-dyslexia-friendly">
        {isOnline ? 'Connected' : 'Offline'}
      </span>
      <span className="text-xs opacity-60 text-dyslexia-friendly">
        {lastCheck.toLocaleTimeString()}
      </span>
    </div>
  );
};

// Loading indicator with timeout
interface LoadingIndicatorProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  timeout = 10000,
  onTimeout,
  className = ''
}) => {
  const [showTimeout, setShowTimeout] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <RefreshCw className="w-6 h-6 text-primary-600 dark:text-primary-400 animate-spin" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-dyslexia-friendly">
          {message}
        </p>
        {showTimeout && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 text-dyslexia-friendly">
            This is taking longer than usual...
          </p>
        )}
      </div>
    </div>
  );
};

// Info message component
interface InfoMessageProps {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success';
  onDismiss?: () => void;
  className?: string;
}

export const InfoMessage: React.FC<InfoMessageProps> = ({
  title,
  message,
  type = 'info',
  onDismiss,
  className = ''
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'success':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getTypeStyles()} ${className}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h3 className="font-medium text-dyslexia-friendly mb-1">
            {title}
          </h3>
          <p className="text-sm text-dyslexia-friendly">
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UserFeedback; 