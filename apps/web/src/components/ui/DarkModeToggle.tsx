/**
 * DarkModeToggle Component
 *
 * A toggle button for switching between light and dark modes.
 * Defaults to dark mode for TTRPG immersion (ignores system preference).
 *
 * WCAG AA Compliance: Button maintains 4.5:1 contrast ratio in both modes.
 */

import { useState, useEffect } from 'react';

const DARK_MODE_DEFAULT: boolean = true;

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      // Check if dark mode class is already set (e.g., from previous session)
      const hasExistingDarkClass =
        document.documentElement.classList.contains('dark');
      // Default to dark mode, but preserve existing state if set
      return hasExistingDarkClass || DARK_MODE_DEFAULT;
    }
    return DARK_MODE_DEFAULT;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="btn-secondary"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
