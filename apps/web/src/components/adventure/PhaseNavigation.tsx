/**
 * PhaseNavigation Component
 *
 * Footer navigation for moving between phases.
 * Shows back button and continue/confirm button based on current phase.
 * Fantasy-themed styling consistent with other components.
 */

import type { Phase } from '@dagger-app/shared-types';

// =============================================================================
// Props
// =============================================================================

export interface PhaseNavigationProps {
  /** Current phase */
  currentPhase: Phase;
  /** Whether the back button should be enabled */
  canGoBack: boolean;
  /** Whether the continue button should be enabled */
  canContinue: boolean;
  /** Callback when back button is clicked */
  onBack: () => void;
  /** Callback when continue button is clicked */
  onContinue: () => void;
  /** Custom label for continue button (default: "Continue") */
  continueLabel?: string;
  /** Whether navigation is loading/disabled */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Phase-specific button labels
// =============================================================================

function getDefaultContinueLabel(phase: Phase): string {
  switch (phase) {
    case 'setup':
      return 'Start Adventure';
    case 'dial-tuning':
      return 'Continue to Frame';
    case 'frame':
      return 'Continue to Outline';
    case 'outline':
      return 'Continue to Scenes';
    case 'scenes':
      return 'Continue to NPCs';
    case 'npcs':
      return 'Continue to Adversaries';
    case 'adversaries':
      return 'Continue to Items';
    case 'items':
      return 'Continue to Echoes';
    case 'echoes':
      return 'Complete Adventure';
    case 'complete':
      return 'Export Adventure';
    default:
      return 'Continue';
  }
}

// =============================================================================
// Component
// =============================================================================

export function PhaseNavigation({
  currentPhase,
  canGoBack,
  canContinue,
  onBack,
  onContinue,
  continueLabel,
  isLoading = false,
  className = '',
}: PhaseNavigationProps) {
  const buttonLabel = continueLabel ?? getDefaultContinueLabel(currentPhase);
  const isBackDisabled = !canGoBack || isLoading;
  const isContinueDisabled = !canContinue || isLoading;

  return (
    <div
      className={`
        flex items-center justify-between
        p-4 bg-parchment-100 dark:bg-shadow-800
        border-t border-ink-200 dark:border-shadow-600
        ${className}
      `}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isBackDisabled}
        aria-label="Go back to previous phase"
        className={`
          flex items-center gap-2 px-4 py-2 rounded-fantasy border
          font-medium text-sm transition-all
          ${
            isBackDisabled
              ? 'opacity-50 cursor-not-allowed bg-ink-100 dark:bg-shadow-700 border-ink-200 dark:border-shadow-600 text-ink-400 dark:text-parchment-600'
              : 'bg-parchment-50 dark:bg-shadow-700 border-ink-300 dark:border-shadow-500 text-ink-700 dark:text-parchment-300 hover:bg-gold-50 hover:border-gold-400 dark:hover:bg-gold-900/20 dark:hover:border-gold-600'
          }
        `}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        disabled={isContinueDisabled}
        className={`
          flex items-center gap-2 px-6 py-3 rounded-fantasy border-2
          font-serif font-semibold transition-all
          ${
            isContinueDisabled
              ? 'opacity-50 cursor-not-allowed bg-ink-200 dark:bg-shadow-600 border-ink-300 dark:border-shadow-500 text-ink-500 dark:text-parchment-600'
              : 'bg-gold-500 border-gold-600 text-ink-900 hover:bg-gold-400 hover:border-gold-500 dark:bg-gold-600 dark:border-gold-500 dark:hover:bg-gold-500 dark:hover:border-gold-400 shadow-gold-glow'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-ink-400 border-t-ink-900 rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {buttonLabel}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
