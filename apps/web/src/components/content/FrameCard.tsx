/**
 * FrameCard Component
 *
 * Displays a single frame with its details.
 * Used in FramePanel for frame selection.
 * Fantasy-themed with gold accent for selected card.
 */

import type { DaggerheartFrame, SelectedFrame } from '@dagger-app/shared-types';
import { isCustomFrame } from '@dagger-app/shared-types';

export interface FrameCardProps {
  /** The frame to display */
  frame: DaggerheartFrame | SelectedFrame;
  /** Whether this frame is currently selected */
  isSelected: boolean;
  /** Callback when frame is clicked */
  onSelect: (frame: DaggerheartFrame | SelectedFrame) => void;
  /** Show expanded details */
  expanded?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function FrameCard({
  frame,
  isSelected,
  onSelect,
  expanded = false,
  className = '',
}: FrameCardProps) {
  const isCustom = isCustomFrame(frame as SelectedFrame);
  const themes = frame.themes ?? [];
  const adversaries = isCustom
    ? (frame as { typicalAdversaries?: string[] }).typicalAdversaries ?? []
    : (frame as DaggerheartFrame).typical_adversaries ?? [];

  return (
    <button
      type="button"
      onClick={() => onSelect(frame)}
      aria-pressed={isSelected}
      aria-label={`${frame.name}: ${frame.description}`}
      className={`
        flex flex-col items-start p-4 rounded-fantasy border
        w-full text-left
        transition-all duration-200
        motion-safe:hover:-translate-y-1
        motion-safe:hover:shadow-gold-glow-subtle
        focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2
        focus:ring-offset-parchment-100 dark:focus:ring-offset-shadow-900
        ${
          isSelected
            ? 'bg-gold-100 border-gold-400 shadow-gold-glow dark:bg-gold-900/40 dark:border-gold-500 motion-safe:animate-selection-glow'
            : 'bg-parchment-50 border-ink-300 hover:bg-gold-50 hover:border-gold-300 dark:bg-shadow-800 dark:border-shadow-500 dark:hover:bg-gold-900/20 dark:hover:border-gold-600'
        }
        ${className}
      `}
    >
      {/* Header with name and custom badge */}
      <div className="flex items-center gap-2 w-full">
        <h3 className="font-serif font-semibold text-lg text-ink-900 dark:text-parchment-100">
          {frame.name}
        </h3>
        {isCustom && (
          <span className="px-2 py-0.5 text-xs font-medium bg-gold-200 text-gold-800 rounded dark:bg-gold-800 dark:text-gold-200">
            Custom
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-ink-700 dark:text-parchment-300 line-clamp-2">
        {frame.description}
      </p>

      {/* Themes */}
      {themes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {themes.slice(0, expanded ? undefined : 3).map((theme, index) => (
            <span
              key={index}
              className="rounded-lg border-2 px-3 py-1 text-xs bg-ink-100 text-ink-700 border-ink-300 dark:bg-shadow-700 dark:text-parchment-300 dark:border-shadow-500"
            >
              {theme}
            </span>
          ))}
          {!expanded && themes.length > 3 && (
            <span className="rounded-lg border-2 px-3 py-1 text-xs text-ink-500 border-ink-200 dark:text-parchment-500 dark:border-shadow-600">
              +{themes.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <>
          {/* Lore */}
          {frame.lore && (
            <div className="mt-4 pt-3 border-t border-ink-200 dark:border-shadow-600 w-full">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-parchment-500 mb-1">
                Lore
              </h4>
              <p className="text-sm text-ink-600 dark:text-parchment-400 italic">
                {frame.lore}
              </p>
            </div>
          )}

          {/* Typical Adversaries */}
          {adversaries.length > 0 && (
            <div className="mt-3 w-full">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-parchment-500 mb-1">
                Typical Adversaries
              </h4>
              <div className="flex flex-wrap gap-1">
                {adversaries.map((adversary, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-blood-100 text-blood-700 rounded dark:bg-blood-900/40 dark:text-blood-300"
                  >
                    {adversary}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          {'source_book' in frame && frame.source_book && (
            <div className="mt-3 text-xs text-ink-400 dark:text-parchment-600">
              Source: {frame.source_book}
            </div>
          )}
        </>
      )}
    </button>
  );
}
