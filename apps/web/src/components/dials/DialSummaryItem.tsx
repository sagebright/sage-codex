/**
 * DialSummaryItem Component
 *
 * Displays a single dial's current value in the summary panel.
 * Shows edit button, confirmed state, and inline edit widget.
 * Fantasy-themed styling.
 */

import type { ReactNode } from 'react';
import type { DialId } from '@dagger-app/shared-types';

export interface DialSummaryItemProps {
  /** Dial identifier */
  dialId: DialId;
  /** Display label */
  label: string;
  /** Current dial value */
  value: unknown;
  /** Whether dial has been confirmed */
  isConfirmed: boolean;
  /** Whether dial is currently being edited */
  isEditing: boolean;
  /** Callback to start editing */
  onEdit: () => void;
  /** Callback to confirm dial value */
  onConfirm: () => void;
  /** Render function for the edit widget */
  renderEditWidget: () => ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format a dial value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'Not set';
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None selected';
    return value.join(', ');
  }
  return String(value);
}

export function DialSummaryItem({
  label,
  value,
  isConfirmed,
  isEditing,
  onEdit,
  onConfirm,
  renderEditWidget,
  className = '',
}: DialSummaryItemProps) {
  const displayValue = formatValue(value);

  return (
    <div
      data-testid="dial-summary-item"
      className={`
        flex flex-col gap-2 p-3 rounded-fantasy
        ${
          isConfirmed
            ? 'bg-parchment-50/50 dark:bg-shadow-800/50'
            : 'border-l-2 border-gold-400 bg-gold-50/30 dark:border-gold-500 dark:bg-gold-900/10'
        }
        ${className}
      `}
    >
      {/* Header row with label, value, and actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-ink-700 dark:text-parchment-200">
              {label}
            </span>
            {isConfirmed && (
              <svg
                data-testid="confirmed-checkmark"
                className="w-4 h-4 text-gold-500 dark:text-gold-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-label="Confirmed"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          {!isEditing && (
            <span
              className={`
                text-sm truncate block
                ${
                  value === null || value === undefined || (Array.isArray(value) && value.length === 0)
                    ? 'text-ink-400 dark:text-parchment-500 italic'
                    : 'text-ink-600 dark:text-parchment-300'
                }
              `}
            >
              {displayValue}
            </span>
          )}
        </div>

        {/* Edit button (only when not editing) */}
        {!isEditing && (
          <button
            type="button"
            onClick={onEdit}
            className="
              px-2 py-1 text-xs font-medium rounded-fantasy border
              bg-parchment-50 border-ink-300 text-ink-600
              hover:bg-gold-50 hover:border-gold-400 hover:text-ink-800
              dark:bg-shadow-700 dark:border-shadow-500 dark:text-parchment-300
              dark:hover:bg-gold-900/30 dark:hover:border-gold-600
              transition-all duration-200
            "
          >
            Edit
          </button>
        )}
      </div>

      {/* Edit widget (only when editing) */}
      {isEditing && (
        <div className="mt-1">
          <div className="mb-2">{renderEditWidget()}</div>
          {!isConfirmed && (
            <button
              type="button"
              onClick={onConfirm}
              className="
                px-3 py-1.5 text-xs font-medium rounded-fantasy border
                bg-gold-100 border-gold-400 text-ink-800
                hover:bg-gold-200 hover:border-gold-500
                dark:bg-gold-900/40 dark:border-gold-600 dark:text-parchment-200
                dark:hover:bg-gold-900/60
                transition-all duration-200
              "
            >
              Confirm
            </button>
          )}
        </div>
      )}
    </div>
  );
}
