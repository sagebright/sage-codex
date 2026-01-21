/**
 * DialSummaryItem Component
 *
 * Displays a single dial with its selector inline.
 * Options are always visible for immediate selection.
 * Includes ConfirmCheckmark in header for confirmation.
 * Fantasy-themed styling.
 */

import type { ReactNode } from 'react';
import type { DialId } from '@dagger-app/shared-types';
import { ConfirmCheckmark } from './ConfirmCheckmark';

export interface DialSummaryItemProps {
  /** Dial identifier */
  dialId: DialId;
  /** Display label */
  label: string;
  /** Whether dial has been confirmed */
  isConfirmed: boolean;
  /** Callback to toggle confirmation state */
  onConfirmToggle: () => void;
  /** Render function for the selector component (always visible) */
  renderSelector: () => ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function DialSummaryItem({
  label,
  isConfirmed,
  onConfirmToggle,
  renderSelector,
  className = '',
}: DialSummaryItemProps) {
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
      {/* Header row with label and ConfirmCheckmark */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink-700 dark:text-parchment-200">
          {label}
        </span>
        <ConfirmCheckmark
          confirmed={isConfirmed}
          onToggle={onConfirmToggle}
          label={isConfirmed ? `Unconfirm ${label}` : `Confirm ${label}`}
        />
      </div>

      {/* Selector component - always visible */}
      <div className="mt-1">
        {renderSelector()}
      </div>
    </div>
  );
}
