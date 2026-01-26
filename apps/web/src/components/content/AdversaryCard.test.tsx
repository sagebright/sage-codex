/**
 * AdversaryCard Component Tests
 *
 * Tests for individual adversary stat block display with name, tier, type,
 * combat stats, and interaction controls for selection, quantity, and confirmation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdversaryCard } from './AdversaryCard';
import type { DaggerheartAdversary } from '@dagger-app/shared-types';

// =============================================================================
// Test Data
// =============================================================================

const mockAdversary: DaggerheartAdversary = {
  id: 'adv-1',
  name: 'Dire Wolf',
  tier: 1,
  type: 'Beast',
  description: 'A massive wolf with glowing red eyes and razor-sharp fangs.',
  motives_tactics: ['Hunt in packs', 'Ambush prey', 'Protect the pack leader'],
  difficulty: 12,
  thresholds: 'Minor 5, Major 10, Severe 15',
  hp: 8,
  stress: 3,
  atk: '+4',
  weapon: 'Bite',
  range: 'Melee',
  dmg: '2d6+2',
  experiences: null,
  features: ['Pack Tactics: +1 to attack when ally is adjacent', 'Keen Senses: Advantage on perception'],
  searchable_text: null,
  embedding: null,
  source_book: 'Core Rules',
  created_at: '2024-01-01T00:00:00.000Z',
};

const mockHighTierAdversary: DaggerheartAdversary = {
  ...mockAdversary,
  id: 'adv-2',
  name: 'Ancient Dragon',
  tier: 4,
  type: 'Dragon',
  description: 'A terrifying dragon of immense power.',
  hp: 100,
  stress: 20,
  difficulty: 25,
  dmg: '6d10+10',
};

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe('AdversaryCard', () => {
  const defaultProps = {
    adversary: mockAdversary,
    onToggleSelect: vi.fn(),
    onQuantityChange: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders adversary name', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText('Dire Wolf')).toBeInTheDocument();
    });

    it('renders tier badge', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText('T1')).toBeInTheDocument();
    });

    it('renders type badge', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText(/beast/i)).toBeInTheDocument();
    });

    it('renders adversary description', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText(/massive wolf/i)).toBeInTheDocument();
    });

    it('renders selection checkbox', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByRole('checkbox', { name: /select dire wolf/i })).toBeInTheDocument();
    });

    it('applies compact badge styling to tier badge', () => {
      render(<AdversaryCard {...defaultProps} />);

      const tierBadge = screen.getByText('T1');
      // Compact badge styling: rounded-lg border-2 px-3 py-1
      expect(tierBadge).toHaveClass('rounded-lg', 'border-2', 'px-3', 'py-1');
    });

    it('applies compact badge styling to type badge', () => {
      render(<AdversaryCard {...defaultProps} />);

      const typeBadge = screen.getByText(/beast/i);
      // Compact badge styling: rounded-lg border-2 px-3 py-1
      expect(typeBadge).toHaveClass('rounded-lg', 'border-2', 'px-3', 'py-1');
    });
  });

  // ===========================================================================
  // Combat Stats Display
  // ===========================================================================

  describe('combat stats display', () => {
    it('renders HP', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText('HP')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('renders stress', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText('Stress')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders difficulty', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText('Diff')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('renders attack modifier', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText('Atk')).toBeInTheDocument();
      expect(screen.getByText('+4')).toBeInTheDocument();
    });

    it('renders damage', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText('Dmg')).toBeInTheDocument();
      expect(screen.getByText('2d6+2')).toBeInTheDocument();
    });

    it('renders range', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText('Range')).toBeInTheDocument();
      expect(screen.getByText(/melee/i)).toBeInTheDocument();
    });

    it('renders weapon', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText(/weapon/i)).toBeInTheDocument();
      expect(screen.getByText(/bite/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Tier Display Tests
  // ===========================================================================

  describe('tier display', () => {
    it('renders tier 1 badge', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText('T1')).toBeInTheDocument();
    });

    it('renders tier 2 badge', () => {
      const tier2Adversary: DaggerheartAdversary = { ...mockAdversary, tier: 2 };
      render(<AdversaryCard {...defaultProps} adversary={tier2Adversary} />);

      expect(screen.getByText('T2')).toBeInTheDocument();
    });

    it('renders tier 3 badge', () => {
      const tier3Adversary: DaggerheartAdversary = { ...mockAdversary, tier: 3 };
      render(<AdversaryCard {...defaultProps} adversary={tier3Adversary} />);

      expect(screen.getByText('T3')).toBeInTheDocument();
    });

    it('renders tier 4 badge', () => {
      render(<AdversaryCard {...defaultProps} adversary={mockHighTierAdversary} />);

      expect(screen.getByText('T4')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Type Display Tests
  // ===========================================================================

  describe('type display', () => {
    it('renders beast type', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText(/beast/i)).toBeInTheDocument();
    });

    it('renders humanoid type', () => {
      const humanoidAdversary: DaggerheartAdversary = { ...mockAdversary, type: 'Humanoid' };
      render(<AdversaryCard {...defaultProps} adversary={humanoidAdversary} />);

      expect(screen.getByText(/humanoid/i)).toBeInTheDocument();
    });

    it('renders undead type', () => {
      const undeadAdversary: DaggerheartAdversary = { ...mockAdversary, type: 'Undead' };
      render(<AdversaryCard {...defaultProps} adversary={undeadAdversary} />);

      expect(screen.getByText(/undead/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Selection Interaction
  // ===========================================================================

  describe('selection interaction', () => {
    it('calls onToggleSelect when checkbox clicked', async () => {
      const user = userEvent.setup();
      const mockToggleSelect = vi.fn();

      render(<AdversaryCard {...defaultProps} onToggleSelect={mockToggleSelect} />);

      await user.click(screen.getByRole('checkbox', { name: /select dire wolf/i }));

      expect(mockToggleSelect).toHaveBeenCalledWith('Dire Wolf');
    });

    it('shows selected state with ring', () => {
      render(<AdversaryCard {...defaultProps} isSelected />);

      const checkbox = screen.getByRole('checkbox', { name: /select dire wolf/i });
      expect(checkbox).toBeChecked();
    });

    it('shows unselected state', () => {
      render(<AdversaryCard {...defaultProps} isSelected={false} />);

      const checkbox = screen.getByRole('checkbox', { name: /select dire wolf/i });
      expect(checkbox).not.toBeChecked();
    });
  });

  // ===========================================================================
  // Quantity Controls
  // ===========================================================================

  describe('quantity controls', () => {
    it('shows quantity controls when selected', () => {
      render(<AdversaryCard {...defaultProps} isSelected quantity={2} />);

      expect(screen.getByText('Qty:')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('hides quantity controls when not selected', () => {
      render(<AdversaryCard {...defaultProps} isSelected={false} />);

      expect(screen.queryByText('Qty:')).not.toBeInTheDocument();
    });

    it('calls onQuantityChange when increase clicked', async () => {
      const user = userEvent.setup();
      const mockQuantityChange = vi.fn();

      render(
        <AdversaryCard
          {...defaultProps}
          isSelected
          quantity={2}
          onQuantityChange={mockQuantityChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /increase quantity/i }));

      expect(mockQuantityChange).toHaveBeenCalledWith('Dire Wolf', 3);
    });

    it('calls onQuantityChange when decrease clicked', async () => {
      const user = userEvent.setup();
      const mockQuantityChange = vi.fn();

      render(
        <AdversaryCard
          {...defaultProps}
          isSelected
          quantity={3}
          onQuantityChange={mockQuantityChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /decrease quantity/i }));

      expect(mockQuantityChange).toHaveBeenCalledWith('Dire Wolf', 2);
    });

    it('disables decrease button at minimum quantity', () => {
      render(<AdversaryCard {...defaultProps} isSelected quantity={1} />);

      expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeDisabled();
    });

    it('disables increase button at maximum quantity', () => {
      render(<AdversaryCard {...defaultProps} isSelected quantity={10} />);

      expect(screen.getByRole('button', { name: /increase quantity/i })).toBeDisabled();
    });
  });

  // ===========================================================================
  // Confirm Interaction
  // ===========================================================================

  describe('confirm interaction', () => {
    it('shows confirm button when selected and not confirmed', () => {
      render(<AdversaryCard {...defaultProps} isSelected isConfirmed={false} />);

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button clicked', async () => {
      const user = userEvent.setup();
      const mockConfirm = vi.fn();

      render(<AdversaryCard {...defaultProps} isSelected onConfirm={mockConfirm} />);

      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(mockConfirm).toHaveBeenCalledWith('Dire Wolf');
    });

    it('shows confirmed state', () => {
      render(<AdversaryCard {...defaultProps} isSelected isConfirmed />);

      expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
    });

    it('hides action buttons when confirmed', () => {
      render(<AdversaryCard {...defaultProps} isSelected isConfirmed />);

      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
      expect(screen.queryByText('Qty:')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Expanded/Collapsed State
  // ===========================================================================

  describe('expanded state', () => {
    it('shows expand button when content available', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
    });

    it('can expand to show motives and tactics', async () => {
      const user = userEvent.setup();

      render(<AdversaryCard {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /show more/i }));

      expect(screen.getByText(/hunt in packs/i)).toBeInTheDocument();
      expect(screen.getByText(/ambush prey/i)).toBeInTheDocument();
    });

    it('can expand to show features', async () => {
      const user = userEvent.setup();

      render(<AdversaryCard {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /show more/i }));

      expect(screen.getByText(/pack tactics/i)).toBeInTheDocument();
    });

    it('can collapse details', async () => {
      const user = userEvent.setup();

      render(<AdversaryCard {...defaultProps} defaultExpanded />);

      await user.click(screen.getByRole('button', { name: /show less/i }));

      expect(screen.queryByText(/hunt in packs/i)).not.toBeInTheDocument();
    });

    it('starts expanded when defaultExpanded is true', () => {
      render(<AdversaryCard {...defaultProps} defaultExpanded />);

      expect(screen.getByText(/hunt in packs/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    it('has accessible name for adversary', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByText('Dire Wolf')).toBeInTheDocument();
    });

    it('selection checkbox has accessible name', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByRole('checkbox', { name: /select dire wolf/i })).toBeInTheDocument();
    });

    it('quantity buttons have accessible names', () => {
      render(<AdversaryCard {...defaultProps} isSelected />);

      expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument();
    });

    it('confirm button has accessible name', () => {
      render(<AdversaryCard {...defaultProps} isSelected />);

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });

    it('expand button has accessible name', () => {
      render(<AdversaryCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles adversary with no motives/tactics', () => {
      const noMotivesAdversary: DaggerheartAdversary = {
        ...mockAdversary,
        motives_tactics: null,
      };
      render(<AdversaryCard {...defaultProps} adversary={noMotivesAdversary} />);

      // Should render without crashing
      expect(screen.getByText('Dire Wolf')).toBeInTheDocument();
    });

    it('handles adversary with no features', () => {
      const noFeaturesAdversary: DaggerheartAdversary = {
        ...mockAdversary,
        features: null,
      };
      render(<AdversaryCard {...defaultProps} adversary={noFeaturesAdversary} />);

      expect(screen.getByText('Dire Wolf')).toBeInTheDocument();
    });

    it('handles adversary with empty motives/tactics array', () => {
      const emptyMotivesAdversary: DaggerheartAdversary = {
        ...mockAdversary,
        motives_tactics: [],
      };
      render(<AdversaryCard {...defaultProps} adversary={emptyMotivesAdversary} />);

      expect(screen.getByText('Dire Wolf')).toBeInTheDocument();
    });

    it('handles very long name', () => {
      const longNameAdversary: DaggerheartAdversary = {
        ...mockAdversary,
        name: 'A'.repeat(100),
      };
      render(<AdversaryCard {...defaultProps} adversary={longNameAdversary} />);

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('handles very long description', () => {
      const longDescAdversary: DaggerheartAdversary = {
        ...mockAdversary,
        description: 'A'.repeat(1000),
      };
      render(<AdversaryCard {...defaultProps} adversary={longDescAdversary} />);

      expect(screen.getByText(mockAdversary.name)).toBeInTheDocument();
    });

    it('handles adversary with minimal data', () => {
      const minimalAdversary: DaggerheartAdversary = {
        id: 'adv-min',
        name: 'Stranger',
        tier: 1,
        type: 'Other',
        description: 'Unknown creature',
        motives_tactics: null,
        difficulty: 10,
        thresholds: null,
        hp: 1,
        stress: 0,
        atk: '+0',
        weapon: '',
        range: 'Melee',
        dmg: '1d4',
        experiences: null,
        features: null,
        searchable_text: null,
        embedding: null,
        source_book: null,
        created_at: null,
      };

      render(<AdversaryCard {...defaultProps} adversary={minimalAdversary} />);

      expect(screen.getByText('Stranger')).toBeInTheDocument();
    });

    it('handles features as complex objects', () => {
      const complexFeaturesAdversary: DaggerheartAdversary = {
        ...mockAdversary,
        features: [{ name: 'Feature 1', description: 'A feature' }] as unknown as DaggerheartAdversary['features'],
      };

      render(<AdversaryCard {...defaultProps} adversary={complexFeaturesAdversary} defaultExpanded />);

      // Should render without crashing - features may be stringified
      expect(screen.getByText('Dire Wolf')).toBeInTheDocument();
    });
  });
});
