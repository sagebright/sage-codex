/**
 * PillarBalanceSelect Component Tests
 *
 * TDD tests for pillar balance priority ranking UI with drag-and-drop
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PillarBalanceSelect } from './PillarBalanceSelect';
import { reorderPillars } from './pillar-utils';
import type { PillarBalance } from '@dagger-app/shared-types';

describe('PillarBalanceSelect', () => {
  const mockOnChange = vi.fn();

  const defaultValue: PillarBalance = {
    primary: 'combat',
    secondary: 'exploration',
    tertiary: 'social',
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('rendering', () => {
    it('renders three priority slots labeled 1st, 2nd, 3rd', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      // Each label appears twice: once in header, once in button
      expect(screen.getAllByText('1st')).toHaveLength(2);
      expect(screen.getAllByText('2nd')).toHaveLength(2);
      expect(screen.getAllByText('3rd')).toHaveLength(2);
    });

    it('renders all three pillar options', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      expect(screen.getByText('Combat')).toBeInTheDocument();
      expect(screen.getByText('Exploration')).toBeInTheDocument();
      expect(screen.getByText('Social')).toBeInTheDocument();
    });

    it('shows current assignments in slots', () => {
      const value: PillarBalance = {
        primary: 'social',
        secondary: 'combat',
        tertiary: 'exploration',
      };
      render(<PillarBalanceSelect value={value} onChange={mockOnChange} />);

      // The pillars should be displayed in their assigned slots
      const slots = screen.getAllByRole('listitem');
      expect(slots).toHaveLength(3);
    });

    it('renders optional label', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} label="Pillar Balance" />);

      expect(screen.getByText('Pillar Balance')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <PillarBalanceSelect value={defaultValue} onChange={mockOnChange} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('displays drag instruction text', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      expect(screen.getByText('Drag pillars to reorder priority')).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('always has all three pillars assigned', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      // All three pillars should be visible
      expect(screen.getByText('Combat')).toBeInTheDocument();
      expect(screen.getByText('Exploration')).toBeInTheDocument();
      expect(screen.getByText('Social')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables all pillar buttons when disabled', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} disabled />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('visual indicators', () => {
    it('highlights primary pillar with gold styling', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      const combatButton = screen.getByRole('button', { name: /combat/i });
      // Primary button should have the gold/selected styling class
      expect(combatButton.className).toMatch(/gold/);
    });

    it('shows position indicator on each pillar', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      // Each pillar button should show its position
      const combatButton = screen.getByRole('button', { name: /combat/i });
      const explorationButton = screen.getByRole('button', { name: /exploration/i });
      const socialButton = screen.getByRole('button', { name: /social/i });

      expect(within(combatButton).getByText('1st')).toBeInTheDocument();
      expect(within(explorationButton).getByText('2nd')).toBeInTheDocument();
      expect(within(socialButton).getByText('3rd')).toBeInTheDocument();
    });

    it('shows cursor-grab styling on interactive items', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      const button = screen.getByRole('button', { name: /combat/i });
      expect(button.className).toMatch(/cursor-grab/);
    });

    it('shows cursor-not-allowed styling when disabled', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} disabled />);

      const button = screen.getByRole('button', { name: /combat/i });
      expect(button.className).toMatch(/cursor-not-allowed/);
    });
  });

  describe('accessibility', () => {
    it('has proper role group for pillar buttons', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('buttons have accessible names with drag instruction', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
        // Each button should mention "Drag to reorder"
        expect(button.getAttribute('aria-label')).toMatch(/Drag to reorder/);
      });
    });

    it('provides screen reader instructions for keyboard users', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      // The sr-only instructions should be present
      expect(screen.getByText(/Press Space or Enter to start dragging/)).toBeInTheDocument();
    });

    it('buttons are keyboard focusable', async () => {
      const user = userEvent.setup();
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      const firstButton = screen.getByRole('button', { name: /combat/i });

      await user.tab();
      expect(firstButton).toHaveFocus();
    });
  });

  describe('drag-and-drop reordering', () => {
    it('renders sortable items in list', () => {
      const value: PillarBalance = {
        primary: 'combat',
        secondary: 'exploration',
        tertiary: 'social',
      };
      render(<PillarBalanceSelect value={value} onChange={mockOnChange} />);

      // Get the sortable items
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);

      // Each item should contain a button
      items.forEach((item) => {
        expect(item.querySelector('button')).toBeInTheDocument();
      });
    });

    it('items have drag-and-drop attributes', () => {
      render(<PillarBalanceSelect value={defaultValue} onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      // @dnd-kit adds tabindex and data attributes for keyboard navigation
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('tabindex');
      });
    });
  });

  describe('reorderPillars utility function', () => {
    it('moves item from first to last position', () => {
      const reordered = reorderPillars(
        ['combat', 'exploration', 'social'],
        0, // from index
        2  // to index
      );

      expect(reordered).toEqual(['exploration', 'social', 'combat']);
    });

    it('moves item from last to first position', () => {
      const reordered = reorderPillars(
        ['combat', 'exploration', 'social'],
        2, // from index
        0  // to index
      );

      expect(reordered).toEqual(['social', 'combat', 'exploration']);
    });

    it('swaps adjacent items', () => {
      const reordered = reorderPillars(
        ['combat', 'exploration', 'social'],
        0, // from index
        1  // to index
      );

      expect(reordered).toEqual(['exploration', 'combat', 'social']);
    });

    it('maintains pillar identity during reorder', () => {
      const original = ['combat', 'exploration', 'social'] as const;
      const reordered = reorderPillars([...original], 1, 0);

      // All original pillars should be present
      expect(reordered).toContain('combat');
      expect(reordered).toContain('exploration');
      expect(reordered).toContain('social');
      expect(reordered).toHaveLength(3);
    });

    it('returns same array when from and to are equal', () => {
      const original: ['combat', 'exploration', 'social'] = ['combat', 'exploration', 'social'];
      const reordered = reorderPillars([...original], 1, 1);

      expect(reordered).toEqual(original);
    });
  });

  describe('order persistence', () => {
    it('displays pillars in the order specified by value prop', () => {
      const value: PillarBalance = {
        primary: 'social',
        secondary: 'combat',
        tertiary: 'exploration',
      };
      render(<PillarBalanceSelect value={value} onChange={mockOnChange} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('Social');
      expect(buttons[1]).toHaveTextContent('Combat');
      expect(buttons[2]).toHaveTextContent('Exploration');
    });

    it('updates display when value prop changes', () => {
      const initialValue: PillarBalance = {
        primary: 'combat',
        secondary: 'exploration',
        tertiary: 'social',
      };

      const { rerender } = render(
        <PillarBalanceSelect value={initialValue} onChange={mockOnChange} />
      );

      // Verify initial order
      let buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('Combat');

      // Change value
      const newValue: PillarBalance = {
        primary: 'social',
        secondary: 'combat',
        tertiary: 'exploration',
      };
      rerender(<PillarBalanceSelect value={newValue} onChange={mockOnChange} />);

      // Verify updated order
      buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('Social');
    });
  });
});
