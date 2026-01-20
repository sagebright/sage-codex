/**
 * SessionLengthSelect Component Tests
 *
 * TDD tests for the session length selector
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionLengthSelect } from './SessionLengthSelect';

describe('SessionLengthSelect', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('rendering', () => {
    it('renders all session length options', () => {
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /2-3 hours/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /3-4 hours/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /4-5 hours/i })).toBeInTheDocument();
    });

    it('highlights selected option', () => {
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} />);

      const selectedButton = screen.getByRole('button', { name: /3-4 hours/i });
      expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders optional label', () => {
      render(
        <SessionLengthSelect
          value="3-4 hours"
          onChange={mockOnChange}
          label="Session Length"
        />
      );

      expect(screen.getByText('Session Length')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <SessionLengthSelect
          value="3-4 hours"
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('selection', () => {
    it('calls onChange when option is selected', async () => {
      const user = userEvent.setup();
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /4-5 hours/i }));

      expect(mockOnChange).toHaveBeenCalledWith('4-5 hours');
    });

    it('does not call onChange when same option is clicked', async () => {
      const user = userEvent.setup();
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /3-4 hours/i }));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('updates visual selection on value change', () => {
      const { rerender } = render(
        <SessionLengthSelect value="2-3 hours" onChange={mockOnChange} />
      );

      expect(screen.getByRole('button', { name: /2-3 hours/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      );

      rerender(<SessionLengthSelect value="4-5 hours" onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /2-3 hours/i })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(screen.getByRole('button', { name: /4-5 hours/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });

  describe('disabled state', () => {
    it('disables all buttons when disabled', () => {
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} disabled />);

      expect(screen.getByRole('button', { name: /2-3 hours/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /3-4 hours/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /4-5 hours/i })).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} disabled />);

      await user.click(screen.getByRole('button', { name: /4-5 hours/i }));

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard accessibility', () => {
    it('supports Tab navigation between options', async () => {
      const user = userEvent.setup();
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} />);

      await user.tab();
      expect(screen.getByRole('button', { name: /2-3 hours/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /3-4 hours/i })).toHaveFocus();
    });

    it('selects option with Enter key', async () => {
      const user = userEvent.setup();
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} />);

      const option = screen.getByRole('button', { name: /2-3 hours/i });
      option.focus();
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith('2-3 hours');
    });

    it('selects option with Space key', async () => {
      const user = userEvent.setup();
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} />);

      const option = screen.getByRole('button', { name: /4-5 hours/i });
      option.focus();
      await user.keyboard(' ');

      expect(mockOnChange).toHaveBeenCalledWith('4-5 hours');
    });
  });

  describe('accessibility', () => {
    it('has proper role group for options', () => {
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('buttons have aria-pressed state', () => {
      render(<SessionLengthSelect value="2-3 hours" onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /2-3 hours/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(screen.getByRole('button', { name: /3-4 hours/i })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    it('has accessible names for all options', () => {
      render(<SessionLengthSelect value="3-4 hours" onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });
  });
});
