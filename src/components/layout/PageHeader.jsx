import React from 'react';

/**
 * Enterprise PageHeader
 * Displays page title, description, badge, and primary/secondary actions.
 */
export function PageHeader({
  title,
  description,
  badge = null,
  actions = null,
  secondaryActions = null,
  className = '',
}) {
  return (
    <div className={`erp-page-header ${className}`}>
      <div className="erp-page-header-info">
        <div className="erp-page-title-row">
          <h1 className="erp-page-title">{title}</h1>
          {badge}
        </div>
        {description && <p className="erp-page-description">{description}</p>}
      </div>

      {(actions || secondaryActions) && (
        <div className="erp-page-actions">
          {secondaryActions}
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
