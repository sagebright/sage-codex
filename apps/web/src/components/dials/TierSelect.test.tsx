/**
 * TierSelect Component Tests
 *
 * TDD tests for the party tier selector with descriptions
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TierSelect } from './TierSelect';

describe('TierSelect', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('rendering', () => {
    it('renders all four tier options', () => {
      render(<TierSelect value={1} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /tier 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tier 2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tier 3/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tier 4/i })).toBeInTheDocument();
    });

    it('highlights selected tier', () => {
      render(<TierSelect value={2} onChange={mockOnChange} />);

      const tier2Button = screen.getByRole('button', { name: /tier 2/i });
      expect(tier2Button).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows tier descriptions', () => {
      render(<TierSelect value={1} onChange={mockOnChange} />);

      // Tier descriptions should be visible
      expect(screen.getByText(/beginner/i)).toBeInTheDocument();
      expect(screen.getByText(/experienced/i)).toBeInTheDocument();
      expect(screen.getByText(/veteran/i)).toBeInTheDocument();
      expect(screen.getByText(/legendary/i)).toBeInTheDocument();
    });

    it('renders optional label', () => {
      render(<TierSelect value={1} onChange={mockOnChange} label="Party Tier" />);

      expect(screen.getByText('Party Tier')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <TierSelect value={1} onChange={mockOnChange} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('selection', () => {
    it('calls onChange when tier is selected', async () => {
      const user = userEvent.setup();
      render(<TierSelect value={1} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /tier 3/i }));

      expect(mockOnChange).toHaveBeenCalledWith(3);
    });

    it('does not call onChange when same tier is clicked', async () => {
      const user = userEvent.setup();
      render(<TierSelect value={2} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /tier 2/i }));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('updates visual selection on value change', () => {
      const { rerender } = render(<TierSelect value={1} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /tier 1/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      );

      rerender(<TierSelect value={3} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /tier 1/i })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(screen.getByRole('button', { name: /tier 3/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });

  describe('disabled state', () => {
    it('disables all buttons when disabled', () => {
      render(<TierSelect value={1} onChange={mockOnChange} disabled />);

      expect(screen.getByRole('button', { name: /tier 1/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /tier 2/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /tier 3/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /tier 4/i })).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      render(<TierSelect value={1} onChange={mockOnChange} disabled />);

      await user.click(screen.getByRole('button', { name: /tier 2/i }));

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard accessibility', () => {
    it('supports Tab navigation between tiers', async () => {
      const user = userEvent.setup();
      render(<TierSelect value={1} onChange={mockOnChange} />);

      await user.tab();
      expect(screen.getByRole('button', { name: /tier 1/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /tier 2/i })).toHaveFocus();
    });

    it('selects tier with Enter key', async () => {
      const user = userEvent.setup();
      render(<TierSelect value={1} onChange={mockOnChange} />);

      const tier3 = screen.getByRole('button', { name: /tier 3/i });
      tier3.focus();
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(3);
    });

    it('selects tier with Space key', async () => {
      const user = userEvent.setup();
      render(<TierSelect value={1} onChange={mockOnChange} />);

      const tier4 = screen.getByRole('button', { name: /tier 4/i });
      tier4.focus();
      await user.keyboard(' ');

      expect(mockOnChange).toHaveBeenCalledWith(4);
    });
  });

  describe('accessibility', () => {
    it('has proper role group for tier buttons', () => {
      render(<TierSelect value={1} onChange={mockOnChange} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('buttons have aria-pressed state', () => {
      render(<TierSelect value={2} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /tier 1/i })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(screen.getByRole('button', { name: /tier 2/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    it('has accessible descriptions for each tier', () => {
      render(<TierSelect value={1} onChange={mockOnChange} />);

      // Each button should have an accessible description
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });
  });
});
