import { useId } from 'react';

/**
 * Enterprise Form Input
 * Supports label, helper text, error state, and leading icon.
 */
export function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  helperText = '',
  disabled = false,
  required = false,
  icon = null,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const inputId = id || name || generatedId;

  return (
    <div className={`erp-form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="erp-label">
          {label}
          {required && <span className="erp-label-required">*</span>}
        </label>
      )}

      <div className="erp-input-wrapper">
        {icon && <span className="erp-input-icon">{icon}</span>}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`erp-input ${icon ? 'has-icon' : ''} ${error ? 'has-error' : ''}`}
          {...rest}
        />
      </div>

      {error ? (
        <span className="erp-form-error" role="alert">
          {error}
        </span>
      ) : helperText ? (
        <span className="erp-form-helper">{helperText}</span>
      ) : null}
    </div>
  );
}

export default Input;
