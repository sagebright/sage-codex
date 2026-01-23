/**
 * DarkModeToggle Unit Tests
 *
 * Tests dark mode toggle behavior including:
 * - Default dark mode state (TTRPG persona requirement)
 * - Toggle functionality
 * - Document class manipulation
 * - Accessibility labels
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DarkModeToggle } from './DarkModeToggle';

describe('DarkModeToggle', () => {
  beforeEach(() => {
    // Clean document state before each test
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    // Clean up after each test
    document.documentElement.classList.remove('dark');
  });

  describe('default state', () => {
    it('defaults to dark mode on first render', () => {
      render(<DarkModeToggle />);

      // Button should show "Light Mode" when in dark mode
      expect(
        screen.getByRole('button', { name: /switch to light mode/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });

    it('adds dark class to document on mount', () => {
      render(<DarkModeToggle />);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('preserves existing dark mode state if already set', () => {
      // Pre-set dark mode
      document.documentElement.classList.add('dark');

      render(<DarkModeToggle />);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });
  });

  describe('toggle behavior', () => {
    it('toggles to light mode when clicked', () => {
      render(<DarkModeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    });

    it('toggles back to dark mode when clicked again', () => {
      render(<DarkModeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button); // To light mode
      fireEvent.click(button); // Back to dark mode

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label in dark mode', () => {
      render(<DarkModeToggle />);

      expect(
        screen.getByRole('button', { name: /switch to light mode/i })
      ).toBeInTheDocument();
    });

    it('has correct aria-label in light mode', () => {
      render(<DarkModeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(
        screen.getByRole('button', { name: /switch to dark mode/i })
      ).toBeInTheDocument();
    });
  });
});
