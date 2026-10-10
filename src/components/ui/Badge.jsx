import React from 'react';

/**
 * Enterprise Badge Component
 */
export function Badge({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
  ...rest
}) {
  return (
    <span className={`erp-badge erp-badge-${variant} ${className}`} {...rest}>
      {dot && <span className="erp-badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export default Badge;
