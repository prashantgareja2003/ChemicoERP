import React from 'react';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

/**
 * Enterprise Data Table
 * Handles columns, loading state, empty state, and responsive scrolling.
 */
export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  emptyState = null,
  onRowClick = null,
  className = '',
}) {
  if (isLoading) {
    return (
      <div className={`erp-table-container ${className}`}>
        <LoadingState message="Loading records..." minHeight="240px" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`erp-table-container ${className}`}>
        {emptyState || <EmptyState />}
      </div>
    );
  }

  return (
    <div className={`erp-table-container ${className}`}>
      <table className="erp-table">
        <thead>
          <tr>
            {columns.map((col, idx) => {
              const alignClass = col.align === 'right' ? 'erp-table-numeric' : col.align === 'center' ? 'erp-table-center' : '';
              return (
                <th
                  key={col.key || idx}
                  style={col.width ? { width: col.width } : undefined}
                  className={`${alignClass} ${col.className || ''}`}
                >
                  {col.title}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => {
            const rowKey = row[keyField] || rowIdx;
            return (
              <tr
                key={rowKey}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((col, colIdx) => {
                  const alignClass = col.align === 'right' ? 'erp-table-numeric' : col.align === 'center' ? 'erp-table-center' : '';
                  const cellValue = row[col.key];
                  return (
                    <td
                      key={col.key || colIdx}
                      className={`${alignClass} ${col.className || ''}`}
                    >
                      {col.render ? col.render(cellValue, row, rowIdx) : cellValue ?? '—'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
