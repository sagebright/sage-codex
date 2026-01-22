/**
 * PoweredByIndicator Component
 *
 * Displays generation status during Claude-powered content generation.
 * Shows a spinning indicator with "Generating with Claude..." during loading,
 * or "Powered by Claude" attribution when complete.
 */

export interface PoweredByIndicatorProps {
  /** Whether content is currently being generated */
  isLoading: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Claude logo SVG icon component
 */
function ClaudeLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
    </svg>
  );
}

export function PoweredByIndicator({
  isLoading,
  className = '',
}: PoweredByIndicatorProps) {
  return (
    <div
      role="status"
      aria-label={isLoading ? 'Generating with Claude' : 'Powered by Claude'}
      className={`
        flex items-center gap-2
        text-ink-500 dark:text-parchment-500
        text-sm
        ${className}
      `.trim()}
    >
      {isLoading ? (
        <>
          <div
            data-testid="claude-spinner"
            className="w-4 h-4 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin"
          />
          <span className="text-gold-600 dark:text-gold-400">
            Generating with Claude...
          </span>
        </>
      ) : (
        <>
          <ClaudeLogo className="w-4 h-4 text-gold-600 dark:text-gold-400" />
          <span>Powered by Claude</span>
        </>
      )}
    </div>
  );
}
