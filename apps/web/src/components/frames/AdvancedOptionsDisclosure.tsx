/**
 * AdvancedOptionsDisclosure Component
 *
 * A collapsible disclosure panel for advanced/optional settings.
 * Features smooth animation and fantasy-themed styling.
 */

import { useState, useId } from 'react';

export interface AdvancedOptionsDisclosureProps {
  /** Content to display when expanded */
  children: React.ReactNode;
  /** Custom label text */
  label?: string;
  /** Start expanded */
  defaultOpen?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function AdvancedOptionsDisclosure({
  children,
  label = 'Advanced Options',
  defaultOpen = false,
  className = '',
}: AdvancedOptionsDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={`mt-6 border-t border-ink-200 dark:border-shadow-600 pt-4 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="
          w-full flex items-center justify-between
          text-sm font-medium text-ink-600 dark:text-parchment-400
          hover:text-ink-800 dark:hover:text-parchment-200
          transition-colors duration-200
        "
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {label}
        </span>
        <span className="text-xs text-ink-400 dark:text-parchment-600">
          {isOpen ? 'Hide' : 'Show'}
        </span>
      </button>

      <div
        id={contentId}
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}
        `}
      >
        {children}
      </div>
    </div>
  );
}
