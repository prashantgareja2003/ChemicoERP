import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enterprise Loading State
 */
export function LoadingState({
  message = 'Loading data...',
  minHeight = '200px',
  spinnerSize = 32,
  className = '',
}) {
  return (
    <div
      className={`erp-loading-state ${className}`}
      style={{ minHeight }}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="erp-spinner" style={{ width: spinnerSize, height: spinnerSize }} />
      <span style={{ fontSize: 'var(--font-size-sm)' }}>{message}</span>
    </div>
  );
}

export default LoadingState;
