/**
 * NumberStepper Component Tests
 *
 * TDD tests for the number stepper with +/- buttons
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NumberStepper } from './NumberStepper';

describe('NumberStepper', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('rendering', () => {
    it('renders current value', () => {
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} />);

      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('renders increment and decrement buttons', () => {
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /increase/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /decrease/i })).toBeInTheDocument();
    });

    it('renders optional label', () => {
      render(
        <NumberStepper
          value={4}
          min={2}
          max={6}
          onChange={mockOnChange}
          label="Party Size"
        />
      );

      expect(screen.getByText('Party Size')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <NumberStepper
          value={4}
          min={2}
          max={6}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('incrementing', () => {
    it('calls onChange with incremented value on + click', async () => {
      const user = userEvent.setup();
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /increase/i }));

      expect(mockOnChange).toHaveBeenCalledWith(5);
    });

    it('does not increment beyond max', async () => {
      const user = userEvent.setup();
      render(<NumberStepper value={6} min={2} max={6} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /increase/i }));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('disables + button at max value', () => {
      render(<NumberStepper value={6} min={2} max={6} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled();
    });
  });

  describe('decrementing', () => {
    it('calls onChange with decremented value on - click', async () => {
      const user = userEvent.setup();
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /decrease/i }));

      expect(mockOnChange).toHaveBeenCalledWith(3);
    });

    it('does not decrement below min', async () => {
      const user = userEvent.setup();
      render(<NumberStepper value={2} min={2} max={6} onChange={mockOnChange} />);

      await user.click(screen.getByRole('button', { name: /decrease/i }));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('disables - button at min value', () => {
      render(<NumberStepper value={2} min={2} max={6} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /decrease/i })).toBeDisabled();
    });
  });

  describe('disabled state', () => {
    it('disables both buttons when disabled', () => {
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} disabled />);

      expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /decrease/i })).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} disabled />);

      await user.click(screen.getByRole('button', { name: /increase/i }));
      await user.click(screen.getByRole('button', { name: /decrease/i }));

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard accessibility', () => {
    it('supports keyboard navigation with Tab', async () => {
      const user = userEvent.setup();
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} />);

      await user.tab();
      expect(screen.getByRole('button', { name: /decrease/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /increase/i })).toHaveFocus();
    });

    it('activates button with Enter key', async () => {
      const user = userEvent.setup();
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} />);

      const decreaseBtn = screen.getByRole('button', { name: /decrease/i });
      decreaseBtn.focus();
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(3);
    });

    it('activates button with Space key', async () => {
      const user = userEvent.setup();
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} />);

      const increaseBtn = screen.getByRole('button', { name: /increase/i });
      increaseBtn.focus();
      await user.keyboard(' ');

      expect(mockOnChange).toHaveBeenCalledWith(5);
    });
  });

  describe('accessibility', () => {
    it('has accessible labels for buttons', () => {
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} />);

      expect(screen.getByRole('button', { name: /increase/i })).toHaveAccessibleName();
      expect(screen.getByRole('button', { name: /decrease/i })).toHaveAccessibleName();
    });

    it('associates label with control via aria-labelledby', () => {
      render(
        <NumberStepper
          value={4}
          min={2}
          max={6}
          onChange={mockOnChange}
          label="Party Size"
        />
      );

      const valueDisplay = screen.getByText('4');
      expect(valueDisplay).toHaveAttribute('aria-labelledby');
    });

    it('announces current value with aria-valuenow', () => {
      render(<NumberStepper value={4} min={2} max={6} onChange={mockOnChange} />);

      const spinbutton = screen.getByRole('spinbutton');
      expect(spinbutton).toHaveAttribute('aria-valuenow', '4');
      expect(spinbutton).toHaveAttribute('aria-valuemin', '2');
      expect(spinbutton).toHaveAttribute('aria-valuemax', '6');
    });
  });
});
