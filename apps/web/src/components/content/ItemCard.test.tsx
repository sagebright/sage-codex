/**
 * ItemCard Component Tests
 *
 * Tests for individual item display with name, category, description,
 * tier (for weapons/armor), stats, and interaction controls for
 * selection, quantity, and confirmation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemCard } from './ItemCard';
import type { UnifiedItem } from '@dagger-app/shared-types';

// =============================================================================
// Test Data
// =============================================================================

const mockItem: UnifiedItem = {
  category: 'item',
  data: {
    id: 'item-1',
    name: 'Healing Potion',
    description: 'Restores health when consumed.',
    item_type: 'potion',
    searchable_text: null,
    embedding: null,
    source_book: null,
    created_at: '2024-01-01T00:00:00.000Z',
  },
};

const mockWeapon: UnifiedItem = {
  category: 'weapon',
  data: {
    id: 'weapon-1',
    name: 'Longsword',
    weapon_category: 'Blade',
    tier: 2,
    trait: 'Versatile',
    damage: '1d8+2',
    range: 'Melee',
    burden: null,
    feature: 'Can be wielded one or two-handed.',
    searchable_text: null,
    embedding: null,
    source_book: null,
    created_at: '2024-01-01T00:00:00.000Z',
  },
};

const mockArmor: UnifiedItem = {
  category: 'armor',
  data: {
    id: 'armor-1',
    name: 'Chain Mail',
    tier: 2,
    base_score: 5,
    base_thresholds: '3/6/9',
    feature: 'Heavy armor providing solid protection.',
    searchable_text: null,
    embedding: null,
    source_book: null,
    created_at: '2024-01-01T00:00:00.000Z',
  },
};

const mockConsumable: UnifiedItem = {
  category: 'consumable',
  data: {
    id: 'consumable-1',
    name: 'Fire Bomb',
    description: 'Explodes in a burst of flame.',
    uses: 3,
    searchable_text: null,
    embedding: null,
    source_book: null,
    created_at: '2024-01-01T00:00:00.000Z',
  },
};

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe('ItemCard', () => {
  const defaultProps = {
    item: mockItem,
    onToggleSelect: vi.fn(),
    onQuantityChange: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders item name', () => {
      render(<ItemCard {...defaultProps} />);

      expect(screen.getByText('Healing Potion')).toBeInTheDocument();
    });

    it('renders category badge', () => {
      render(<ItemCard {...defaultProps} />);

      expect(screen.getByText(/item/i)).toBeInTheDocument();
    });

    it('renders item description', () => {
      render(<ItemCard {...defaultProps} />);

      expect(screen.getByText(/restores health/i)).toBeInTheDocument();
    });

    it('renders selection checkbox', () => {
      render(<ItemCard {...defaultProps} />);

      expect(screen.getByRole('checkbox', { name: /select healing potion/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Compact Badge Styling Tests
  // ===========================================================================

  describe('compact badge styling', () => {
    it('applies compact badge styling to category badge', () => {
      render(<ItemCard {...defaultProps} />);

      // Find the category badge by its content (contains icon and text)
      const categoryBadge = screen.getByText(/item/i).closest('span');
      // Compact badge styling: rounded-lg border-2 px-3 py-1
      expect(categoryBadge).toHaveClass('rounded-lg', 'border-2', 'px-3', 'py-1');
    });

    it('applies compact badge styling to tier badge on weapons', () => {
      render(<ItemCard {...defaultProps} item={mockWeapon} />);

      const tierBadge = screen.getByText('T2');
      // Compact badge styling: rounded-lg border-2 px-3 py-1
      expect(tierBadge).toHaveClass('rounded-lg', 'border-2', 'px-3', 'py-1');
    });

    it('applies compact badge styling to tier badge on armor', () => {
      render(<ItemCard {...defaultProps} item={mockArmor} />);

      const tierBadge = screen.getByText('T2');
      // Compact badge styling: rounded-lg border-2 px-3 py-1
      expect(tierBadge).toHaveClass('rounded-lg', 'border-2', 'px-3', 'py-1');
    });

    it('applies compact badge styling to category badge on weapons', () => {
      render(<ItemCard {...defaultProps} item={mockWeapon} />);

      // Use getAllByText to handle multiple matches, then filter for the badge
      const weaponElements = screen.getAllByText(/weapon/i);
      const categoryBadge = weaponElements.find((el) => el.tagName === 'SPAN' && el.classList.contains('capitalize'));
      // Compact badge styling: rounded-lg border-2 px-3 py-1
      expect(categoryBadge).toHaveClass('rounded-lg', 'border-2', 'px-3', 'py-1');
    });

    it('applies compact badge styling to category badge on consumables', () => {
      render(<ItemCard {...defaultProps} item={mockConsumable} />);

      const categoryBadge = screen.getByText(/consumable/i).closest('span');
      // Compact badge styling: rounded-lg border-2 px-3 py-1
      expect(categoryBadge).toHaveClass('rounded-lg', 'border-2', 'px-3', 'py-1');
    });

    it('shows multiple badges inline without visual bloat', () => {
      // Weapon should have both tier and category badges
      render(<ItemCard {...defaultProps} item={mockWeapon} />);

      const tierBadge = screen.getByText('T2');
      // Use getAllByText to handle multiple matches, then filter for the badge
      const weaponElements = screen.getAllByText(/weapon/i);
      const categoryBadge = weaponElements.find((el) => el.tagName === 'SPAN' && el.classList.contains('capitalize'));

      // Both badges should exist and have compact styling
      expect(tierBadge).toBeInTheDocument();
      expect(categoryBadge).toBeInTheDocument();
      expect(tierBadge).toHaveClass('rounded-lg', 'border-2', 'px-3', 'py-1');
      expect(categoryBadge).toHaveClass('rounded-lg', 'border-2', 'px-3', 'py-1');
    });
  });

  // ===========================================================================
  // Tier Display Tests
  // ===========================================================================

  describe('tier display', () => {
    it('renders tier badge for weapons', () => {
      render(<ItemCard {...defaultProps} item={mockWeapon} />);

      expect(screen.getByText('T2')).toBeInTheDocument();
    });

    it('renders tier badge for armor', () => {
      render(<ItemCard {...defaultProps} item={mockArmor} />);

      expect(screen.getByText('T2')).toBeInTheDocument();
    });

    it('does not render tier badge for items', () => {
      render(<ItemCard {...defaultProps} item={mockItem} />);

      expect(screen.queryByText(/T\d/)).not.toBeInTheDocument();
    });

    it('does not render tier badge for consumables', () => {
      render(<ItemCard {...defaultProps} item={mockConsumable} />);

      expect(screen.queryByText(/T\d/)).not.toBeInTheDocument();
    });

    it('renders tier 1 with correct styling', () => {
      const tier1Weapon: UnifiedItem = {
        category: 'weapon',
        data: { ...mockWeapon.data, tier: 1 },
      };
      render(<ItemCard {...defaultProps} item={tier1Weapon} />);

      expect(screen.getByText('T1')).toBeInTheDocument();
    });

    it('renders tier 4 with correct styling', () => {
      const tier4Weapon: UnifiedItem = {
        category: 'weapon',
        data: { ...mockWeapon.data, tier: 4 },
      };
      render(<ItemCard {...defaultProps} item={tier4Weapon} />);

      expect(screen.getByText('T4')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Category Display Tests
  // ===========================================================================

  describe('category display', () => {
    it('renders item category with icon', () => {
      render(<ItemCard {...defaultProps} item={mockItem} />);

      expect(screen.getByText(/item/i)).toBeInTheDocument();
    });

    it('renders weapon category with icon', () => {
      render(<ItemCard {...defaultProps} item={mockWeapon} />);

      // Use getAllByText to handle multiple matches, then filter for the badge
      const weaponElements = screen.getAllByText(/weapon/i);
      const categoryBadge = weaponElements.find((el) => el.tagName === 'SPAN' && el.classList.contains('capitalize'));
      expect(categoryBadge).toBeInTheDocument();
    });

    it('renders armor category with icon', () => {
      render(<ItemCard {...defaultProps} item={mockArmor} />);

      // Use getAllByText to handle multiple matches, then filter for the badge
      const armorElements = screen.getAllByText(/armor/i);
      const categoryBadge = armorElements.find((el) => el.tagName === 'SPAN' && el.classList.contains('capitalize'));
      expect(categoryBadge).toBeInTheDocument();
    });

    it('renders consumable category with icon', () => {
      render(<ItemCard {...defaultProps} item={mockConsumable} />);

      expect(screen.getByText(/consumable/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Selection Interaction
  // ===========================================================================

  describe('selection interaction', () => {
    it('calls onToggleSelect when checkbox clicked', async () => {
      const user = userEvent.setup();
      const mockToggleSelect = vi.fn();

      render(<ItemCard {...defaultProps} onToggleSelect={mockToggleSelect} />);

      await user.click(screen.getByRole('checkbox', { name: /select healing potion/i }));

      expect(mockToggleSelect).toHaveBeenCalledWith('Healing Potion', 'item');
    });

    it('shows selected state with ring', () => {
      render(<ItemCard {...defaultProps} isSelected />);

      const checkbox = screen.getByRole('checkbox', { name: /select healing potion/i });
      expect(checkbox).toBeChecked();
    });

    it('shows unselected state', () => {
      render(<ItemCard {...defaultProps} isSelected={false} />);

      const checkbox = screen.getByRole('checkbox', { name: /select healing potion/i });
      expect(checkbox).not.toBeChecked();
    });
  });

  // ===========================================================================
  // Quantity Controls
  // ===========================================================================

  describe('quantity controls', () => {
    it('shows quantity controls when selected', () => {
      render(<ItemCard {...defaultProps} isSelected quantity={2} />);

      expect(screen.getByText('Qty:')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('hides quantity controls when not selected', () => {
      render(<ItemCard {...defaultProps} isSelected={false} />);

      expect(screen.queryByText('Qty:')).not.toBeInTheDocument();
    });

    it('calls onQuantityChange when increase clicked', async () => {
      const user = userEvent.setup();
      const mockQuantityChange = vi.fn();

      render(
        <ItemCard
          {...defaultProps}
          isSelected
          quantity={2}
          onQuantityChange={mockQuantityChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /increase quantity/i }));

      expect(mockQuantityChange).toHaveBeenCalledWith('Healing Potion', 'item', 3);
    });

    it('calls onQuantityChange when decrease clicked', async () => {
      const user = userEvent.setup();
      const mockQuantityChange = vi.fn();

      render(
        <ItemCard
          {...defaultProps}
          isSelected
          quantity={3}
          onQuantityChange={mockQuantityChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /decrease quantity/i }));

      expect(mockQuantityChange).toHaveBeenCalledWith('Healing Potion', 'item', 2);
    });

    it('disables decrease button at minimum quantity', () => {
      render(<ItemCard {...defaultProps} isSelected quantity={1} />);

      expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeDisabled();
    });

    it('disables increase button at maximum quantity', () => {
      render(<ItemCard {...defaultProps} isSelected quantity={10} />);

      expect(screen.getByRole('button', { name: /increase quantity/i })).toBeDisabled();
    });
  });

  // ===========================================================================
  // Confirm Interaction
  // ===========================================================================

  describe('confirm interaction', () => {
    it('shows confirm button when selected and not confirmed', () => {
      render(<ItemCard {...defaultProps} isSelected isConfirmed={false} />);

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button clicked', async () => {
      const user = userEvent.setup();
      const mockConfirm = vi.fn();

      render(<ItemCard {...defaultProps} isSelected onConfirm={mockConfirm} />);

      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(mockConfirm).toHaveBeenCalledWith('Healing Potion', 'item');
    });

    it('shows confirmed state', () => {
      render(<ItemCard {...defaultProps} isSelected isConfirmed />);

      expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
    });

    it('hides action buttons when confirmed', () => {
      render(<ItemCard {...defaultProps} isSelected isConfirmed />);

      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
      expect(screen.queryByText('Qty:')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    it('has accessible name for item', () => {
      render(<ItemCard {...defaultProps} />);

      expect(screen.getByText('Healing Potion')).toBeInTheDocument();
    });

    it('selection checkbox has accessible name', () => {
      render(<ItemCard {...defaultProps} />);

      expect(screen.getByRole('checkbox', { name: /select healing potion/i })).toBeInTheDocument();
    });

    it('quantity buttons have accessible names', () => {
      render(<ItemCard {...defaultProps} isSelected />);

      expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument();
    });

    it('confirm button has accessible name', () => {
      render(<ItemCard {...defaultProps} isSelected />);

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });
  });
});
