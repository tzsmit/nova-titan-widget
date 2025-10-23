/**
 * Enhanced Error Boundary
 * Comprehensive error handling with retry functionality and user feedback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    errorId: '',
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', {
      error,
      errorInfo,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
    });

    // Report to error tracking service (if available)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to external error tracking (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: true,
          errorId: this.state.errorId,
        },
      });
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      // Max retries reached, offer reload
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorDisplay
          error={this.state.error}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

// Error Display Component
interface ErrorDisplayProps {
  error?: Error;
  errorId: string;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReload: () => void;
  onGoHome: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorId,
  retryCount,
  maxRetries,
  onRetry,
  onReload,
  onGoHome,
}) => {
  const canRetry = retryCount < maxRetries;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-primary-900 to-secondary-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-nova-lg p-6 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-error-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-neutral-600">
            We encountered an unexpected error. Don't worry, we're on it!
          </p>
        </div>

        {error && process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-neutral-100 rounded-lg text-left">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center">
              <Bug className="w-4 h-4 mr-2" />
              Debug Info
            </h3>
            <code className="text-sm text-neutral-700 block">
              {error.message}
            </code>
            <p className="text-xs text-neutral-500 mt-2">
              Error ID: {errorId}
            </p>
          </div>
        )}

        {retryCount > 0 && (
          <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-warning-700 text-sm">
              Retry attempt {retryCount}/{maxRetries}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {canRetry ? (
            <button
              onClick={onRetry}
              className="w-full btn-base bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center space-x-2"
              aria-label="Retry loading the component"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          ) : (
            <button
              onClick={onReload}
              className="w-full btn-base bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center space-x-2"
              aria-label="Reload the page"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          )}

          <button
            onClick={onGoHome}
            className="w-full btn-base bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 flex items-center justify-center space-x-2"
            aria-label="Go back to home page"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>

        <p className="text-xs text-neutral-500 mt-4">
          If this problem persists, please contact support with error ID: <br />
          <code className="bg-neutral-100 px-2 py-1 rounded">{errorId}</code>
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundary;