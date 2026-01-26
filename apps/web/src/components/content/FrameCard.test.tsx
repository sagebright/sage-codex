/**
 * FrameCard Component Tests
 *
 * Tests for frame display card with selection support
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FrameCard } from './FrameCard';
import type { DaggerheartFrame, FrameDraft } from '@dagger-app/shared-types';

const mockDbFrame: DaggerheartFrame = {
  id: 'frame-1',
  name: 'The Dark Forest',
  description: 'A mysterious forest full of danger and ancient secrets',
  themes: ['mystery', 'horror', 'nature', 'survival'],
  typical_adversaries: ['beasts', 'undead', 'fey'],
  lore: 'Ancient evil lurks beneath the trees, waiting for unwary travelers',
  source_book: 'Core Rulebook',
  embedding: null,
  created_at: '2024-01-01T00:00:00.000Z',
};

const mockCustomFrame: FrameDraft = {
  id: 'custom-1',
  name: 'Haunted Manor',
  description: 'A crumbling mansion with dark secrets',
  themes: ['horror', 'mystery'],
  typicalAdversaries: ['undead', 'constructs'],
  lore: 'The manor was once home to a powerful necromancer',
  isCustom: true,
};

describe('FrameCard', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('rendering', () => {
    it('renders frame name', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('The Dark Forest')).toBeInTheDocument();
    });

    it('renders frame description', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText(/mysterious forest/i)).toBeInTheDocument();
    });

    it('renders themes as tags', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('mystery')).toBeInTheDocument();
      expect(screen.getByText('horror')).toBeInTheDocument();
      expect(screen.getByText('nature')).toBeInTheDocument();
    });

    it('truncates themes beyond 3 when not expanded', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
          expanded={false}
        />
      );

      // Should show first 3 themes plus a "+1 more" indicator
      expect(screen.getByText('mystery')).toBeInTheDocument();
      expect(screen.getByText('horror')).toBeInTheDocument();
      expect(screen.getByText('nature')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('shows all themes when expanded', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
          expanded={true}
        />
      );

      expect(screen.getByText('mystery')).toBeInTheDocument();
      expect(screen.getByText('horror')).toBeInTheDocument();
      expect(screen.getByText('nature')).toBeInTheDocument();
      expect(screen.getByText('survival')).toBeInTheDocument();
      expect(screen.queryByText('+1 more')).not.toBeInTheDocument();
    });

    it('renders as button', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('custom frames', () => {
    it('displays Custom badge for custom frames', () => {
      render(
        <FrameCard
          frame={mockCustomFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('does not display Custom badge for DB frames', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByText('Custom')).not.toBeInTheDocument();
    });

    it('renders custom frame adversaries', () => {
      render(
        <FrameCard
          frame={mockCustomFrame}
          isSelected={false}
          onSelect={mockOnSelect}
          expanded={true}
        />
      );

      expect(screen.getByText('undead')).toBeInTheDocument();
      expect(screen.getByText('constructs')).toBeInTheDocument();
    });
  });

  describe('expanded view', () => {
    it('shows lore when expanded', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
          expanded={true}
        />
      );

      expect(screen.getByText(/Ancient evil lurks/i)).toBeInTheDocument();
    });

    it('shows typical adversaries when expanded', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
          expanded={true}
        />
      );

      expect(screen.getByText('beasts')).toBeInTheDocument();
      expect(screen.getByText('undead')).toBeInTheDocument();
      expect(screen.getByText('fey')).toBeInTheDocument();
    });

    it('shows source book when expanded', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
          expanded={true}
        />
      );

      expect(screen.getByText(/Core Rulebook/i)).toBeInTheDocument();
    });

    it('hides expanded details when not expanded', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
          expanded={false}
        />
      );

      // Lore should not be visible
      expect(screen.queryByText(/Ancient evil lurks/i)).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('calls onSelect when clicked', async () => {
      const user = userEvent.setup();
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      await user.click(screen.getByRole('button'));

      expect(mockOnSelect).toHaveBeenCalledWith(mockDbFrame);
    });

    it('has aria-pressed=true when selected', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={true}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('has aria-pressed=false when not selected', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('keyboard accessibility', () => {
    it('selects with Enter key', async () => {
      const user = userEvent.setup();
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSelect).toHaveBeenCalledWith(mockDbFrame);
    });

    it('selects with Space key', async () => {
      const user = userEvent.setup();
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(mockOnSelect).toHaveBeenCalledWith(mockDbFrame);
    });
  });

  describe('accessibility', () => {
    it('has accessible label', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName();
    });

    it('has focus ring classes for keyboard navigation', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-gold-400');
      expect(button).toHaveClass('focus:ring-offset-2');
    });
  });

  describe('animations', () => {
    it('has hover lift animation classes (motion-safe)', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('motion-safe:hover:-translate-y-1');
    });

    it('has hover glow animation classes (motion-safe)', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('motion-safe:hover:shadow-gold-glow-subtle');
    });

    it('has selection glow animation when selected (motion-safe)', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={true}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('motion-safe:animate-selection-glow');
    });

    it('does not have selection glow animation when not selected', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('motion-safe:animate-selection-glow');
    });

    it('has smooth transition classes', () => {
      render(
        <FrameCard
          frame={mockDbFrame}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all');
      expect(button).toHaveClass('duration-200');
    });
  });
});
