import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enterprise Button Component
 * Supports primary, secondary, outline, danger, and ghost variants.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  type = 'button',
  className = '',
  onClick,
  ...rest
}) {
  const baseClass = 'erp-button';
  const variantClass = `erp-button-${variant}`;
  const sizeClass = size !== 'md' ? `erp-button-${size}` : '';
  const loadingClass = isLoading ? 'loading' : '';

  const combinedClass = [baseClass, variantClass, sizeClass, loadingClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={combinedClass}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader2 className="erp-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
        </>
      )}
    </button>
  );
}

export default Button;
