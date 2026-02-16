'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
                <p className="text-sm text-gray-600">We encountered an unexpected error</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-3 mb-4">
              <p className="text-sm text-gray-700 font-mono">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional error display component
export function ErrorDisplay({ 
  error, 
  retry, 
  context 
}: { 
  error: string; 
  retry?: () => void;
  context?: string;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-4xl mb-3">❌</div>
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        {context || "Error"}
      </h3>
      <p className="text-red-700 mb-4">{error}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  icon = "📭",
  title,
  description,
  action
}: {
  icon?: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
