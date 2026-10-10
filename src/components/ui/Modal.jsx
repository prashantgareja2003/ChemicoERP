import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Enterprise Modal Component
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="erp-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`erp-modal erp-modal-${size} ${className}`}>
        <div className="erp-modal-header">
          <div>
            {title && <h3 className="erp-modal-title">{title}</h3>}
            {description && <p className="erp-card-subtitle">{description}</p>}
          </div>
          <button
            type="button"
            className="erp-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="erp-modal-body">{children}</div>

        {footer && <div className="erp-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
