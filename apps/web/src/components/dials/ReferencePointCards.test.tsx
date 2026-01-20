/**
 * ReferencePointCards Component Tests
 *
 * TDD tests for clickable reference point selection cards
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReferencePointCards } from './ReferencePointCards';

const sampleReferences = [
  {
    id: 'princess-bride',
    label: 'Princess Bride',
    description: 'Lighthearted adventure',
    icon: '⚔️',
  },
  {
    id: 'witcher',
    label: 'The Witcher',
    description: 'Gritty and morally gray',
    icon: '🐺',
  },
  {
    id: 'bloodborne',
    label: 'Bloodborne',
    description: 'Cosmic horror, dread',
    icon: '🌙',
  },
];

describe('ReferencePointCards', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('rendering', () => {
    it('renders all reference cards', () => {
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      expect(screen.getByText('Princess Bride')).toBeInTheDocument();
      expect(screen.getByText('The Witcher')).toBeInTheDocument();
      expect(screen.getByText('Bloodborne')).toBeInTheDocument();
    });

    it('renders descriptions', () => {
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      expect(screen.getByText('Lighthearted adventure')).toBeInTheDocument();
      expect(screen.getByText('Gritty and morally gray')).toBeInTheDocument();
    });

    it('renders icons when provided', () => {
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      expect(screen.getByText('⚔️')).toBeInTheDocument();
      expect(screen.getByText('🐺')).toBeInTheDocument();
    });

    it('renders cards as buttons', () => {
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });

    it('applies custom className', () => {
      const { container } = render(
        <ReferencePointCards
          references={sampleReferences}
          onSelect={mockOnSelect}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('selection', () => {
    it('calls onSelect with id and label when card is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      await user.click(screen.getByText('Princess Bride'));

      expect(mockOnSelect).toHaveBeenCalledWith('princess-bride', 'Princess Bride');
    });

    it('highlights selected card', () => {
      render(
        <ReferencePointCards
          references={sampleReferences}
          selectedId="witcher"
          onSelect={mockOnSelect}
        />
      );

      const witcherCard = screen.getByText('The Witcher').closest('button');
      expect(witcherCard).toHaveAttribute('aria-pressed', 'true');
    });

    it('deselects previously selected card', () => {
      const { rerender } = render(
        <ReferencePointCards
          references={sampleReferences}
          selectedId="witcher"
          onSelect={mockOnSelect}
        />
      );

      let witcherCard = screen.getByText('The Witcher').closest('button');
      expect(witcherCard).toHaveAttribute('aria-pressed', 'true');

      rerender(
        <ReferencePointCards
          references={sampleReferences}
          selectedId="bloodborne"
          onSelect={mockOnSelect}
        />
      );

      witcherCard = screen.getByText('The Witcher').closest('button');
      expect(witcherCard).toHaveAttribute('aria-pressed', 'false');

      const bloodborneCard = screen.getByText('Bloodborne').closest('button');
      expect(bloodborneCard).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('custom option', () => {
    it('shows Custom option when allowCustom is true', () => {
      render(
        <ReferencePointCards
          references={sampleReferences}
          onSelect={mockOnSelect}
          allowCustom
        />
      );

      expect(screen.getByText(/custom/i)).toBeInTheDocument();
    });

    it('does not show Custom option when allowCustom is false', () => {
      render(
        <ReferencePointCards
          references={sampleReferences}
          onSelect={mockOnSelect}
          allowCustom={false}
        />
      );

      expect(screen.queryByText(/custom/i)).not.toBeInTheDocument();
    });

    it('calls onSelect with custom id when Custom is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ReferencePointCards
          references={sampleReferences}
          onSelect={mockOnSelect}
          allowCustom
        />
      );

      await user.click(screen.getByText(/custom/i));

      expect(mockOnSelect).toHaveBeenCalledWith('custom', 'Custom');
    });
  });

  describe('keyboard accessibility', () => {
    it('supports Tab navigation between cards', async () => {
      const user = userEvent.setup();
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      await user.tab();
      expect(screen.getByText('Princess Bride').closest('button')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('The Witcher').closest('button')).toHaveFocus();
    });

    it('selects card with Enter key', async () => {
      const user = userEvent.setup();
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      const card = screen.getByText('The Witcher').closest('button')!;
      card.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSelect).toHaveBeenCalledWith('witcher', 'The Witcher');
    });

    it('selects card with Space key', async () => {
      const user = userEvent.setup();
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      const card = screen.getByText('Bloodborne').closest('button')!;
      card.focus();
      await user.keyboard(' ');

      expect(mockOnSelect).toHaveBeenCalledWith('bloodborne', 'Bloodborne');
    });
  });

  describe('accessibility', () => {
    it('has accessible labels for all cards', () => {
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('has aria-pressed on all cards', () => {
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });

    it('has role group for card container', () => {
      render(
        <ReferencePointCards references={sampleReferences} onSelect={mockOnSelect} />
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
    });
  });
});
