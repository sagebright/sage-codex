/**
 * AdversarySelector Component Tests
 *
 * Tests for the adversary picker view that displays available adversaries
 * with filtering, selection, quantity controls, and confirmation workflow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdversarySelector } from './AdversarySelector';
import type { DaggerheartAdversary, SelectedAdversary } from '@dagger-app/shared-types';

// =============================================================================
// Test Data
// =============================================================================

const mockAdversaries: DaggerheartAdversary[] = [
  {
    id: 'adv-1',
    name: 'Dire Wolf',
    tier: 1,
    type: 'Beast',
    description: 'A massive wolf with glowing red eyes.',
    motives_tactics: ['Hunt in packs', 'Ambush prey'],
    difficulty: 12,
    thresholds: 'Minor 5, Major 10, Severe 15',
    hp: 8,
    stress: 3,
    atk: '+4',
    weapon: 'Bite',
    range: 'Melee',
    dmg: '2d6+2',
    experiences: null,
    features: ['Pack Tactics'],
    searchable_text: null,
    embedding: null,
    source_book: 'Core Rules',
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'adv-2',
    name: 'Bandit Captain',
    tier: 2,
    type: 'Humanoid',
    description: 'A cunning leader of thieves.',
    motives_tactics: ['Command troops', 'Fight dirty'],
    difficulty: 15,
    thresholds: 'Minor 5, Major 12, Severe 18',
    hp: 15,
    stress: 6,
    atk: '+5',
    weapon: 'Shortsword',
    range: 'Melee',
    dmg: '2d8+3',
    experiences: null,
    features: ['Leadership'],
    searchable_text: null,
    embedding: null,
    source_book: 'Core Rules',
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'adv-3',
    name: 'Skeleton Guard',
    tier: 1,
    type: 'Undead',
    description: 'An animated skeleton armed with rusty weapons.',
    motives_tactics: ['Follow orders', 'Patrol'],
    difficulty: 10,
    thresholds: 'Minor 3, Major 6, Severe 10',
    hp: 6,
    stress: 2,
    atk: '+3',
    weapon: 'Rusty Sword',
    range: 'Melee',
    dmg: '1d8+1',
    experiences: null,
    features: ['Undying'],
    searchable_text: null,
    embedding: null,
    source_book: 'Core Rules',
    created_at: '2024-01-01T00:00:00.000Z',
  },
];

const mockSelectedAdversaries: SelectedAdversary[] = [
  {
    adversary: mockAdversaries[0],
    quantity: 2,
  },
];

const availableTypes = ['Beast', 'Humanoid', 'Undead'];

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe('AdversarySelector', () => {
  const defaultProps = {
    adversaries: mockAdversaries,
    selectedAdversaries: [] as SelectedAdversary[],
    availableTypes,
    partyTier: 1 as const,
    onSelect: vi.fn(),
    onDeselect: vi.fn(),
    onQuantityChange: vi.fn(),
    onConfirm: vi.fn(),
    onConfirmAll: vi.fn(),
    onProceed: vi.fn(),
    onFilterChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders adversaries', () => {
      render(<AdversarySelector {...defaultProps} />);

      expect(screen.getByText('Dire Wolf')).toBeInTheDocument();
      expect(screen.getByText('Skeleton Guard')).toBeInTheDocument();
    });

    it('renders header', () => {
      render(<AdversarySelector {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /select adversaries/i })).toBeInTheDocument();
    });

    it('renders empty state when no adversaries match filters', () => {
      render(
        <AdversarySelector
          {...defaultProps}
          adversaries={[]}
        />
      );

      expect(screen.getByText(/no adversaries found/i)).toBeInTheDocument();
    });

    it('renders filter controls', () => {
      render(<AdversarySelector {...defaultProps} />);

      expect(screen.getByLabelText(/tier/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Loading State
  // ===========================================================================

  describe('loading state', () => {
    it('shows loading spinner during load', () => {
      render(<AdversarySelector {...defaultProps} isLoading />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Filtering
  // ===========================================================================

  describe('filtering', () => {
    it('filters by tier', async () => {
      const user = userEvent.setup();
      render(<AdversarySelector {...defaultProps} />);

      // Change tier filter to 2
      const tierSelect = screen.getByLabelText(/tier/i);
      await user.selectOptions(tierSelect, '2');

      // Tier 1 adversaries should be hidden
      expect(screen.queryByText('Dire Wolf')).not.toBeInTheDocument();
      expect(screen.queryByText('Skeleton Guard')).not.toBeInTheDocument();
      // Tier 2 adversary should be visible
      expect(screen.getByText('Bandit Captain')).toBeInTheDocument();
    });

    it('filters by type', async () => {
      const user = userEvent.setup();
      render(<AdversarySelector {...defaultProps} />);

      // First show all tiers
      const tierSelect = screen.getByLabelText(/tier/i);
      await user.selectOptions(tierSelect, '');

      // Change type filter to Undead
      const typeSelect = screen.getByLabelText(/type/i);
      await user.selectOptions(typeSelect, 'Undead');

      // Only undead should be visible
      expect(screen.queryByText('Dire Wolf')).not.toBeInTheDocument();
      expect(screen.getByText('Skeleton Guard')).toBeInTheDocument();
    });

    it('filters by search term', async () => {
      const user = userEvent.setup();
      render(<AdversarySelector {...defaultProps} />);

      // First show all tiers
      const tierSelect = screen.getByLabelText(/tier/i);
      await user.selectOptions(tierSelect, '');

      // Search for "wolf"
      const searchInput = screen.getByLabelText(/search/i);
      await user.type(searchInput, 'wolf');

      // Only wolf should be visible
      expect(screen.getByText('Dire Wolf')).toBeInTheDocument();
      expect(screen.queryByText('Skeleton Guard')).not.toBeInTheDocument();
      expect(screen.queryByText('Bandit Captain')).not.toBeInTheDocument();
    });

    it('resets filters', async () => {
      const user = userEvent.setup();
      render(<AdversarySelector {...defaultProps} />);

      // Apply some filters
      const tierSelect = screen.getByLabelText(/tier/i);
      await user.selectOptions(tierSelect, '2');

      // Reset filters
      await user.click(screen.getByRole('button', { name: /reset/i }));

      // Should be back to default tier (1) based on partyTier
      expect(screen.getByText('Dire Wolf')).toBeInTheDocument();
      expect(screen.getByText('Skeleton Guard')).toBeInTheDocument();
    });

    it('defaults tier filter to party tier', () => {
      render(<AdversarySelector {...defaultProps} partyTier={2} />);

      // Tier 1 adversaries should be hidden by default
      expect(screen.queryByText('Dire Wolf')).not.toBeInTheDocument();
      expect(screen.queryByText('Skeleton Guard')).not.toBeInTheDocument();
      // Tier 2 adversary should be visible
      expect(screen.getByText('Bandit Captain')).toBeInTheDocument();
    });

    it('calls onFilterChange when filters change', async () => {
      const user = userEvent.setup();
      const mockFilterChange = vi.fn();
      render(<AdversarySelector {...defaultProps} onFilterChange={mockFilterChange} />);

      const tierSelect = screen.getByLabelText(/tier/i);
      await user.selectOptions(tierSelect, '2');

      expect(mockFilterChange).toHaveBeenCalledWith(expect.objectContaining({ tier: 2 }));
    });
  });

  // ===========================================================================
  // Selection
  // ===========================================================================

  describe('selection', () => {
    it('calls onSelect when adversary selected', async () => {
      const user = userEvent.setup();
      const mockSelect = vi.fn();
      render(<AdversarySelector {...defaultProps} onSelect={mockSelect} />);

      // Click the checkbox for the first adversary
      const checkboxes = screen.getAllByRole('checkbox', { name: /select/i });
      await user.click(checkboxes[0]);

      expect(mockSelect).toHaveBeenCalledWith(mockAdversaries[0]);
    });

    it('calls onDeselect when adversary deselected', async () => {
      const user = userEvent.setup();
      const mockDeselect = vi.fn();
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
          onDeselect={mockDeselect}
        />
      );

      // Click the checkbox to deselect
      const checkboxes = screen.getAllByRole('checkbox', { name: /select/i });
      await user.click(checkboxes[0]);

      expect(mockDeselect).toHaveBeenCalledWith('Dire Wolf');
    });

    it('tracks selected adversaries', () => {
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
        />
      );

      // First adversary should be selected
      const checkboxes = screen.getAllByRole('checkbox', { name: /select/i });
      expect(checkboxes[0]).toBeChecked();
    });

    it('shows selected count in header', () => {
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
        />
      );

      // Should show selection count
      expect(screen.getByText(/0\/1/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Quantity Management
  // ===========================================================================

  describe('quantity management', () => {
    it('shows quantity controls when selected', () => {
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
        />
      );

      expect(screen.getByText('Qty:')).toBeInTheDocument();
      // Quantity display may be in different elements, just verify quantity controls exist
      expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument();
    });

    it('calls onQuantityChange when quantity adjusted', async () => {
      const user = userEvent.setup();
      const mockQuantityChange = vi.fn();
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
          onQuantityChange={mockQuantityChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /increase quantity/i }));

      expect(mockQuantityChange).toHaveBeenCalledWith('Dire Wolf', 3);
    });
  });

  // ===========================================================================
  // Confirm Actions
  // ===========================================================================

  describe('confirm actions', () => {
    it('renders confirm all button when selections exist', () => {
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
        />
      );

      expect(screen.getByRole('button', { name: /confirm all/i })).toBeInTheDocument();
    });

    it('calls onConfirmAll when clicked', async () => {
      const user = userEvent.setup();
      const mockConfirmAll = vi.fn();
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
          onConfirmAll={mockConfirmAll}
        />
      );

      await user.click(screen.getByRole('button', { name: /confirm all/i }));

      expect(mockConfirmAll).toHaveBeenCalled();
    });

    it('tracks confirmed adversaries', () => {
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
          confirmedAdversaryIds={new Set(['Dire Wolf'])}
        />
      );

      expect(screen.getByText(/1\/1/)).toBeInTheDocument();
    });

    it('calls onConfirm when individual confirm clicked', async () => {
      const user = userEvent.setup();
      const mockConfirm = vi.fn();
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
          onConfirm={mockConfirm}
        />
      );

      await user.click(screen.getByRole('button', { name: /confirm adversary/i }));

      expect(mockConfirm).toHaveBeenCalledWith('Dire Wolf');
    });
  });

  // ===========================================================================
  // Proceed Action
  // ===========================================================================

  describe('proceed action', () => {
    it('renders proceed button when all confirmed', () => {
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
          confirmedAdversaryIds={new Set(['Dire Wolf'])}
        />
      );

      expect(screen.getByRole('button', { name: /proceed|items/i })).toBeInTheDocument();
    });

    it('calls onProceed when clicked', async () => {
      const user = userEvent.setup();
      const mockProceed = vi.fn();
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
          confirmedAdversaryIds={new Set(['Dire Wolf'])}
          onProceed={mockProceed}
        />
      );

      await user.click(screen.getByRole('button', { name: /proceed|items/i }));

      expect(mockProceed).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Progress Indicator
  // ===========================================================================

  describe('progress indicator', () => {
    it('shows confirmation progress', () => {
      const selected: SelectedAdversary[] = [
        { adversary: mockAdversaries[0], quantity: 1 },
        { adversary: mockAdversaries[1], quantity: 1 },
      ];
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={selected}
          confirmedAdversaryIds={new Set(['Dire Wolf'])}
        />
      );

      // Should show "1 of 2 confirmed" or similar
      expect(screen.getByText(/1\/2/i)).toBeInTheDocument();
    });

    it('shows total quantity in header', () => {
      const selected: SelectedAdversary[] = [
        { adversary: mockAdversaries[0], quantity: 3 },
        { adversary: mockAdversaries[1], quantity: 2 },
      ];
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={selected}
        />
      );

      // Should show total quantity (5)
      expect(screen.getByText(/5 total/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Error State
  // ===========================================================================

  describe('error state', () => {
    it('displays error message', () => {
      render(<AdversarySelector {...defaultProps} error="Failed to load adversaries" />);

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      render(<AdversarySelector {...defaultProps} error="Load failed" onRetry={vi.fn()} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls onRetry when retry clicked', async () => {
      const user = userEvent.setup();
      const mockRetry = vi.fn();

      render(<AdversarySelector {...defaultProps} error="Load failed" onRetry={mockRetry} />);

      await user.click(screen.getByRole('button', { name: /retry/i }));

      expect(mockRetry).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    it('has accessible loading state', () => {
      render(<AdversarySelector {...defaultProps} isLoading />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('adversary cards are in a list structure', () => {
      render(<AdversarySelector {...defaultProps} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('each adversary card is a list item', () => {
      render(<AdversarySelector {...defaultProps} />);

      // Only tier 1 (2 adversaries) by default
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });

    it('filter inputs have labels', () => {
      render(<AdversarySelector {...defaultProps} />);

      expect(screen.getByLabelText(/tier/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    });

    it('progress bar has aria attributes', () => {
      render(
        <AdversarySelector
          {...defaultProps}
          selectedAdversaries={mockSelectedAdversaries}
          confirmedAdversaryIds={new Set(['Dire Wolf'])}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', '1');
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles single adversary', () => {
      render(<AdversarySelector {...defaultProps} adversaries={[mockAdversaries[0]]} />);

      expect(screen.getByText('Dire Wolf')).toBeInTheDocument();
    });

    it('handles many adversaries', () => {
      const manyAdversaries = Array.from({ length: 20 }, (_, i) => ({
        ...mockAdversaries[0],
        id: `adv-${i}`,
        name: `Adversary ${i}`,
      }));

      render(
        <AdversarySelector
          {...defaultProps}
          adversaries={manyAdversaries}
        />
      );

      // Should render all adversaries
      expect(screen.getByText('Adversary 0')).toBeInTheDocument();
      expect(screen.getByText('Adversary 19')).toBeInTheDocument();
    });

    it('handles adversary with minimal data', () => {
      const minimalAdversary: DaggerheartAdversary = {
        id: 'adv-min',
        name: 'Minimal',
        tier: 1,
        type: 'Other',
        description: 'Minimal creature',
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

      render(<AdversarySelector {...defaultProps} adversaries={[minimalAdversary]} />);

      expect(screen.getByText('Minimal')).toBeInTheDocument();
    });

    it('shows empty message when no selections and not loading', () => {
      render(<AdversarySelector {...defaultProps} selectedAdversaries={[]} />);

      // The footer should show a prompt to select adversaries
      expect(screen.getByText(/select adversaries to add/i)).toBeInTheDocument();
    });
  });
});
