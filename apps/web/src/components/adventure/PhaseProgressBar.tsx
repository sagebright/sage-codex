/**
 * PhaseProgressBar Component
 *
 * Displays progress through adventure creation phases.
 * Shows current phase, completion percentage, and phase name.
 * Fantasy-themed styling consistent with other components.
 */

import type { Phase } from '@dagger-app/shared-types';
import { PHASES } from '@dagger-app/shared-types';

// =============================================================================
// Props
// =============================================================================

export interface PhaseProgressBarProps {
  /** Current phase */
  currentPhase: Phase;
  /** Adventure name to display */
  adventureName?: string;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function PhaseProgressBar({
  currentPhase,
  adventureName,
  className = '',
}: PhaseProgressBarProps) {
  // Find current phase info
  const currentPhaseInfo = PHASES.find((p) => p.id === currentPhase);
  const currentIndex = currentPhaseInfo?.order ?? 0;

  // Calculate progress (10 phases total, 0-9)
  const totalPhases = PHASES.length;
  const progressPercent = Math.round((currentIndex / (totalPhases - 1)) * 100);

  return (
    <div className={`bg-parchment-100 dark:bg-shadow-800 border-b border-ink-200 dark:border-shadow-600 ${className}`}>
      {/* Header with title and phase name */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          {adventureName && (
            <h2 className="font-serif font-bold text-ink-800 dark:text-parchment-100 truncate max-w-[200px]">
              {adventureName}
            </h2>
          )}
          <span className="text-sm text-ink-500 dark:text-parchment-500">
            {adventureName && '|'}
          </span>
          <span className="text-sm font-medium text-gold-700 dark:text-gold-400">
            {currentPhaseInfo?.label ?? 'Unknown Phase'}
          </span>
        </div>
        <span className="text-sm text-ink-500 dark:text-parchment-500">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Adventure progress: ${progressPercent}% - ${currentPhaseInfo?.label}`}
          className="h-2 bg-ink-200 dark:bg-shadow-600 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 dark:from-gold-600 dark:to-gold-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Phase dots */}
        <div className="flex justify-between mt-2">
          {PHASES.map((phase, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={phase.id}
                className="flex flex-col items-center"
                title={phase.label}
              >
                <div
                  className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${
                      isCompleted
                        ? 'bg-gold-500 dark:bg-gold-400'
                        : isCurrent
                          ? 'bg-gold-500 dark:bg-gold-400 ring-2 ring-gold-300 dark:ring-gold-600 ring-offset-1 ring-offset-parchment-100 dark:ring-offset-shadow-800'
                          : 'bg-ink-300 dark:bg-shadow-500'
                    }
                  `}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
