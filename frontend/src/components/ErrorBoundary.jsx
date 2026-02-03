/**
 * @fileoverview Error Boundary Component
 * Catches JavaScript errors in React component tree and displays fallback UI
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;

      // If a custom fallback component is provided, use it
      if (Fallback) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="error-boundary" role="alert">
          <div className="error-content">
            <h2>Oops! Something went wrong</h2>
            <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>

            <div className="error-actions">
              <button
                onClick={this.handleRetry}
                className="retry-button"
                aria-label="Try again"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="refresh-button"
                aria-label="Refresh page"
              >
                Refresh Page
              </button>
            </div>

            {showDetails && this.state.error && (
              <details className="error-details">
                <summary>Error Details (for developers)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 8px;
              margin: 1rem 0;
            }

            .error-content {
              text-align: center;
              max-width: 500px;
            }

            .error-content h2 {
              color: #dc3545;
              margin-bottom: 1rem;
              font-size: 1.5rem;
            }

            .error-content p {
              color: #6c757d;
              margin-bottom: 2rem;
              line-height: 1.5;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-bottom: 1rem;
            }

            .retry-button,
            .refresh-button {
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
              transition: background-color 0.2s;
            }

            .retry-button {
              background-color: #007bff;
              color: white;
            }

            .retry-button:hover {
              background-color: #0056b3;
            }

            .refresh-button {
              background-color: #6c757d;
              color: white;
            }

            .refresh-button:hover {
              background-color: #545b62;
            }

            .error-details {
              margin-top: 2rem;
              text-align: left;
            }

            .error-stack {
              background-color: #f1f3f4;
              padding: 1rem;
              border-radius: 4px;
              font-size: 0.875rem;
              overflow-x: auto;
              white-space: pre-wrap;
              color: #495057;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;