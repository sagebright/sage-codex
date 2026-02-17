/**
 * StreamingText — Renders assistant text with a gold streaming cursor
 *
 * When `isStreaming` is true, appends a blinking gold cursor (via CSS class).
 * When streaming is complete, renders plain text.
 *
 * Handles paragraph splitting: double newlines become separate <p> elements.
 * Shared across all stages — no stage-specific logic.
 */

// =============================================================================
// Types
// =============================================================================

export interface StreamingTextProps {
  /** The text content to display */
  content: string;
  /** Whether the text is still being streamed */
  isStreaming: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Split text into paragraphs on double newlines.
 * Single newlines are preserved within paragraphs.
 */
function splitParagraphs(text: string): string[] {
  return text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
}

// =============================================================================
// Component
// =============================================================================

export function StreamingText({ content, isStreaming }: StreamingTextProps) {
  const paragraphs = splitParagraphs(content);

  if (paragraphs.length === 0) {
    // Empty content while streaming — show cursor only
    if (isStreaming) {
      return <span className="streaming-cursor" />;
    }
    return null;
  }

  return (
    <div className="font-serif text-[16px] leading-[1.65]">
      {paragraphs.map((paragraph, index) => {
        const isLastParagraph = index === paragraphs.length - 1;
        return (
          <p key={index} className={index > 0 ? 'mt-3' : undefined}>
            {paragraph}
            {isStreaming && isLastParagraph && (
              <span className="streaming-cursor" />
            )}
          </p>
        );
      })}
    </div>
  );
}
