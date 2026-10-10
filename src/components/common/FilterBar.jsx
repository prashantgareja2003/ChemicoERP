import React from 'react';
import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';
import { RotateCcw } from 'lucide-react';

/**
 * Enterprise FilterBar
 * Unifies search box, custom select filters, and reset actions.
 */
export function FilterBar({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  children,
  onReset,
  totalCount = null,
  className = '',
}) {
  return (
    <div className={`erp-filter-bar ${className}`}>
      <div className="erp-filter-group">
        {onSearchChange && (
          <div style={{ minWidth: 240 }}>
            <SearchInput
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>
        )}
        {children}
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw size={14} />}
          >
            Reset
          </Button>
        )}
      </div>

      {totalCount !== null && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {totalCount} total records
        </span>
      )}
    </div>
  );
}

export default FilterBar;
