import { useId } from 'react';

/**
 * Enterprise Form Select
 * Supports array of options [{value, label}] or custom children.
 */
export function Select({
  label,
  id,
  name,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error = '',
  helperText = '',
  disabled = false,
  required = false,
  children,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const selectId = id || name || generatedId;

  return (
    <div className={`erp-form-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="erp-label">
          {label}
          {required && <span className="erp-label-required">*</span>}
        </label>
      )}

      <div className="erp-input-wrapper">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`erp-select ${error ? 'has-error' : ''}`}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
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

export default Select;
