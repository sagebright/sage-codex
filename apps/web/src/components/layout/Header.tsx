/**
 * Header — Top bar with home button, adventure name, and phase info
 *
 * Displays:
 * - Home icon button (left)
 * - Adventure name in centered gold serif text
 * - Phase indicator (right) - placeholder for phase dropdown
 *
 * During Invoking, the adventure name shows "Untitled" or is empty.
 */

// =============================================================================
// Types
// =============================================================================

export interface HeaderProps {
  /** Adventure name to display (null shows nothing per design doc) */
  adventureName?: string | null;
  /** Called when the home button is clicked */
  onHomeClick?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function Header({ adventureName, onHomeClick }: HeaderProps) {
  return (
    <header className="app-header">
      {/* Home button */}
      <button
        className="flex items-center justify-center w-8 h-8 rounded-sm bg-transparent border-none cursor-pointer flex-shrink-0 transition-colors duration-150"
        style={{ color: 'var(--text-muted)' }}
        onClick={onHomeClick}
        aria-label="Return to home"
        type="button"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>

      {/* Adventure title */}
      <span
        className="font-serif text-[16px] font-medium text-center flex-1 min-w-0 truncate"
        style={{ color: 'var(--accent-gold)' }}
      >
        {adventureName ?? ''}
      </span>

      {/* Spacer to balance the home button */}
      <div className="w-8 flex-shrink-0" />
    </header>
  );
}
