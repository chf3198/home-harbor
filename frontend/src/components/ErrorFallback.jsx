import React from 'react';
import './ErrorFallback.css';

function ErrorFallback({ error, retry, showDetails = false }) {
  return (
    <div className="error-boundary" role="alert">
      <div className="error-content">
        <h2>Oops! Something went wrong</h2>
        <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>

        <div className="error-actions">
          <button
            onClick={retry}
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

        {showDetails && error && (
          <details className="error-details">
            <summary>Error Details (for developers)</summary>
            <pre className="error-stack">
              {error.toString()}
              {error.componentStack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export default ErrorFallback;