/**
 * Reusable confirmation dialog component
 *
 * Renders a modal overlay with a title, message, and Confirm/Cancel buttons.
 * Supports Escape key and overlay click to dismiss.
 * Uses fantasy theme design tokens from CSS custom properties.
 */

import type { ReactNode } from 'react';

// =============================================================================
// Props
// =============================================================================

interface ConfirmDialogProps {
  /** Dialog heading */
  title: string;
  /** Dialog body content */
  children: ReactNode;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Whether the confirm action is in progress */
  isLoading?: boolean;
  /** Called when the user confirms */
  onConfirm: () => void;
  /** Called when the user cancels (including Escape / overlay click) */
  onCancel: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function ConfirmDialog({
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      style={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
    >
      <div
        style={styles.box}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h3 style={styles.heading}>{title}</h3>
        <div style={styles.body}>{children}</div>
        <div style={styles.actions}>
          <button
            onClick={onCancel}
            style={styles.cancelButton}
            type="button"
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            className="footer-button"
            onClick={onConfirm}
            style={styles.confirmButton}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  box: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-sm)',
    padding: '24px',
    maxWidth: 400,
    width: '90%',
  },
  heading: {
    fontFamily: 'var(--font-serif)',
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--accent-gold)',
    margin: '0 0 12px 0',
  },
  body: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    background: 'none',
    border: '1px solid var(--border-medium)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
  },
  confirmButton: {
    flex: 'none',
  },
};
