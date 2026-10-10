import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Enterprise Empty State Component
 */
export function EmptyState({
  icon = <Inbox size={28} />,
  title = 'No records found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  action = null,
  className = '',
}) {
  return (
    <div className={`erp-empty-state ${className}`}>
      <div className="erp-empty-icon">{icon}</div>
      <h4 className="erp-empty-title">{title}</h4>
      {description && <p className="erp-empty-desc">{description}</p>}
      {action && <div style={{ marginTop: 'var(--space-2)' }}>{action}</div>}
    </div>
  );
}

export default EmptyState;
