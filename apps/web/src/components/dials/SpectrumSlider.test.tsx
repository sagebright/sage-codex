/**
 * SpectrumSlider Component Tests
 *
 * TDD tests for the conceptual dial slider with endpoint labels
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpectrumSlider } from './SpectrumSlider';

describe('SpectrumSlider', () => {
  const mockOnChange = vi.fn();
  const defaultEndpoints = { low: 'Combat-heavy', high: 'Exploration-focused' };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('rendering', () => {
    it('renders a slider input', () => {
      render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders endpoint labels', () => {
      render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Combat-heavy')).toBeInTheDocument();
      expect(screen.getByText('Exploration-focused')).toBeInTheDocument();
    });

    it('renders optional label', () => {
      render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
          label="Combat/Exploration Balance"
        />
      );

      expect(screen.getByText('Combat/Exploration Balance')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('shows current value when set', () => {
      render(
        <SpectrumSlider
          value="balanced"
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      // The slider should indicate middle position (50)
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('50');
    });
  });

  describe('interaction', () => {
    it('calls onChange when slider is moved', async () => {
      render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '75' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('converts slider position to semantic value', async () => {
      render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      const slider = screen.getByRole('slider');

      // Move to low end
      fireEvent.change(slider, { target: { value: '10' } });
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.stringMatching(/combat|low/i)
      );

      // Move to high end
      fireEvent.change(slider, { target: { value: '90' } });
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.stringMatching(/exploration|high/i)
      );
    });

    it('sets middle value when moved from extreme to center', async () => {
      // Start from a non-middle value to test the middle position callback
      render(
        <SpectrumSlider
          value="Leaning combat-heavy"
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '50' } });

      // Value should contain balanced or middle
      expect(mockOnChange).toHaveBeenCalled();
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
      expect(lastCall[0].toLowerCase()).toMatch(/balanced|middle/);
    });
  });

  describe('disabled state', () => {
    it('disables slider when disabled', () => {
      render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
          disabled
        />
      );

      expect(screen.getByRole('slider')).toBeDisabled();
    });

    it('does not call onChange when disabled', async () => {
      render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
          disabled
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '75' } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard accessibility', () => {
    it('supports Tab to focus slider', async () => {
      const user = userEvent.setup();
      render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      await user.tab();
      expect(screen.getByRole('slider')).toHaveFocus();
    });

    it('allows value change via keyboard (simulated)', async () => {
      // Note: jsdom doesn't fully support keyboard events on range inputs
      // This test verifies the slider is focusable and change events work
      render(
        <SpectrumSlider
          value="balanced"
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      const slider = screen.getByRole('slider');
      slider.focus();
      expect(slider).toHaveFocus();

      // Simulate what arrow key would do (increment value)
      fireEvent.change(slider, { target: { value: '51' } });
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has accessible name from label', () => {
      render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
          label="Combat Balance"
        />
      );

      expect(screen.getByRole('slider')).toHaveAccessibleName(/combat balance/i);
    });

    it('has aria-valuemin and aria-valuemax', () => {
      render(
        <SpectrumSlider
          value={null}
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
    });

    it('has aria-valuenow when value is set', () => {
      render(
        <SpectrumSlider
          value="balanced"
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '50');
    });

    it('has aria-valuetext for screen readers', () => {
      render(
        <SpectrumSlider
          value="balanced"
          endpoints={defaultEndpoints}
          onChange={mockOnChange}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuetext');
    });
  });
});
