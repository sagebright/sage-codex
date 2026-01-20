/**
 * DialProgressBar Component
 *
 * Shows progress of dial configuration (X of Y configured).
 * Fantasy-themed with gold accent fill.
 */

export interface DialProgressBarProps {
  /** Number of confirmed dials */
  confirmedCount: number;
  /** Total number of dials */
  totalCount: number;
  /** Additional CSS classes */
  className?: string;
}

export function DialProgressBar({
  confirmedCount,
  totalCount,
  className = '',
}: DialProgressBarProps) {
  const percentage = totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0;

  return (
    <div data-testid="dial-progress-bar" className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-ink-600 dark:text-parchment-300">
          {confirmedCount} of {totalCount} configured
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={confirmedCount}
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-label="Dial configuration progress"
        className="h-2 w-full bg-ink-200 dark:bg-shadow-600 rounded-full overflow-hidden"
      >
        <div
          data-testid="progress-fill"
          className="h-full bg-gradient-to-r from-gold-400 to-gold-500 dark:from-gold-500 dark:to-gold-400 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
