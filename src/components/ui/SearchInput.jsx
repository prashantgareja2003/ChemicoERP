import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Enterprise Search Input with clear button
 */
export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...rest
}) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`erp-search-wrap ${className}`}>
      <Search className="erp-search-icon" size={16} />
      <input
        type="text"
        className="erp-search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...rest}
      />
      {value && (
        <button
          type="button"
          className="erp-search-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
