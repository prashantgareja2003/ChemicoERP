import React from 'react';

/**
 * Enterprise Card Component
 */
export function Card({
  title,
  subtitle,
  description,
  actions,
  children,
  footer,
  noPadding = false,
  interactive = false,
  className = '',
  ...rest
}) {
  const hasHeader = Boolean(title || subtitle || description || actions);

  return (
    <div
      className={`erp-card ${interactive ? 'erp-card-interactive' : ''} ${className}`}
      {...rest}
    >
      {hasHeader && (
        <div className="erp-card-header">
          <div className="erp-card-title-group">
            {title && <h3 className="erp-card-title">{title}</h3>}
            {subtitle && <span className="erp-card-subtitle">{subtitle}</span>}
            {description && <p className="erp-card-subtitle">{description}</p>}
          </div>
          {actions && <div className="erp-card-actions">{actions}</div>}
        </div>
      )}

      <div className={`erp-card-body ${noPadding ? 'erp-card-body-no-padding' : ''}`}>
        {children}
      </div>

      {footer && <div className="erp-card-footer">{footer}</div>}
    </div>
  );
}

export default Card;
