/**
 * ReferencePointCards Component
 *
 * Clickable cards for selecting media/tone reference points.
 * When clicked, triggers onSelect with the reference label.
 * Fantasy-themed with gold accent for selected card.
 */

export interface ReferencePoint {
  /** Unique identifier */
  id: string;
  /** Display label (e.g., "The Princess Bride") */
  label: string;
  /** Brief description (e.g., "Lighthearted adventure") */
  description: string;
  /** Optional emoji or icon */
  icon?: string;
}

export interface ReferencePointCardsProps {
  /** Available reference points */
  references: ReferencePoint[];
  /** Currently selected reference ID */
  selectedId?: string;
  /** Callback when a reference is selected (click sends chat message) */
  onSelect: (id: string, label: string) => void;
  /** Show "Custom..." option */
  allowCustom?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function ReferencePointCards({
  references,
  selectedId,
  onSelect,
  allowCustom = false,
  className = '',
}: ReferencePointCardsProps) {
  return (
    <div
      role="group"
      aria-label="Reference point selection"
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {references.map((ref) => {
        const isSelected = ref.id === selectedId;

        return (
          <button
            key={ref.id}
            type="button"
            onClick={() => onSelect(ref.id, ref.label)}
            aria-pressed={isSelected}
            aria-label={`${ref.label}: ${ref.description}`}
            className={`
              flex flex-col items-start p-3 rounded-fantasy border
              min-w-[140px] max-w-[200px] text-left
              transition-all duration-200
              ${
                isSelected
                  ? 'bg-gold-100 border-gold-400 shadow-gold-glow dark:bg-gold-900/40 dark:border-gold-500'
                  : 'bg-parchment-50 border-ink-300 hover:bg-gold-50 hover:border-gold-300 dark:bg-shadow-800 dark:border-shadow-500 dark:hover:bg-gold-900/20 dark:hover:border-gold-600'
              }
            `}
          >
            {ref.icon && (
              <span className="text-xl mb-1" aria-hidden="true">
                {ref.icon}
              </span>
            )}
            <span className="font-serif font-semibold text-ink-900 dark:text-parchment-100">
              {ref.label}
            </span>
            <span className="text-xs text-ink-500 dark:text-parchment-400 mt-1">
              {ref.description}
            </span>
          </button>
        );
      })}

      {allowCustom && (
        <button
          type="button"
          onClick={() => onSelect('custom', 'Custom')}
          aria-pressed={selectedId === 'custom'}
          aria-label="Custom: Enter your own reference"
          className={`
            flex flex-col items-center justify-center p-3 rounded-fantasy border
            min-w-[100px] min-h-[80px]
            transition-all duration-200
            ${
              selectedId === 'custom'
                ? 'bg-gold-100 border-gold-400 shadow-gold-glow dark:bg-gold-900/40 dark:border-gold-500'
                : 'bg-parchment-50 border-ink-300 border-dashed hover:bg-gold-50 hover:border-gold-300 dark:bg-shadow-800 dark:border-shadow-500 dark:hover:bg-gold-900/20 dark:hover:border-gold-600'
            }
          `}
        >
          <span className="text-xl mb-1" aria-hidden="true">
            ✨
          </span>
          <span className="font-medium text-ink-700 dark:text-parchment-200">
            Custom...
          </span>
        </button>
      )}
    </div>
  );
}
