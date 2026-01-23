/**
 * TierSelect Layout Tests
 *
 * Tests for desktop layout behavior - ensuring buttons don't overflow
 * their container at wide viewports (1920px, 2560px, 3840px).
 *
 * Bug fix: Issue #80 - Party Tier buttons overflow on wide screens
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TierSelect } from './TierSelect';

describe('TierSelect Layout - Wide Viewport Handling', () => {
  describe('button container constraints', () => {
    it('has flex-wrap to prevent button overflow', () => {
      render(<TierSelect value={1} onChange={() => {}} />);

      const buttonContainer = screen.getByRole('group');
      expect(buttonContainer).toHaveClass('flex-wrap');
    });

    it('constrains button width with max-width', () => {
      const { container } = render(<TierSelect value={1} onChange={() => {}} />);

      // Find the button container div that wraps the buttons
      const buttonContainer = container.querySelector('[role="group"]');
      expect(buttonContainer).toHaveClass('max-w-2xl');
    });

    it('buttons maintain reasonable size on wide screens', () => {
      const { container } = render(<TierSelect value={1} onChange={() => {}} />);

      // Verify buttons don't use unconstrained flex-1
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        // Should have min-width and max-width constraints
        expect(button).toHaveClass('min-w-[100px]');
        expect(button).toHaveClass('max-w-[180px]');
      });
    });
  });

  describe('responsive behavior maintained', () => {
    it('buttons remain side-by-side on normal widths', () => {
      render(<TierSelect value={1} onChange={() => {}} />);

      const buttonContainer = screen.getByRole('group');
      // Should still use flex layout
      expect(buttonContainer).toHaveClass('flex');
    });

    it('preserves gap between buttons', () => {
      render(<TierSelect value={1} onChange={() => {}} />);

      const buttonContainer = screen.getByRole('group');
      expect(buttonContainer).toHaveClass('gap-2');
    });
  });
});
