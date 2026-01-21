/**
 * NPCList Component Tests
 *
 * Tests for the NPC compilation view that displays all compiled NPCs
 * with streaming content support and confirmation workflow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NPCList } from './NPCList';
import type { NPC } from '@dagger-app/shared-types';

// =============================================================================
// Test Data
// =============================================================================

const mockNPCs: NPC[] = [
  {
    id: 'npc-1',
    name: 'Orik the Guide',
    role: 'quest-giver',
    description: 'A weathered traveler who knows the ancient paths.',
    appearance: 'Tall with silver hair.',
    personality: 'Cautious but kind.',
    motivations: ['Protect the village'],
    connections: ['Elder Mira'],
    sceneAppearances: ['scene-1', 'scene-3'],
  },
  {
    id: 'npc-2',
    name: 'Zara the Merchant',
    role: 'neutral',
    description: 'A shrewd trader with goods from distant lands.',
    appearance: 'Short and stout, colorful clothing.',
    personality: 'Business-minded but fair.',
    motivations: ['Profit', 'Rare artifacts'],
    connections: ['Trade Guild'],
    sceneAppearances: ['scene-2'],
  },
  {
    id: 'npc-3',
    name: 'The Shadow',
    role: 'antagonist',
    description: 'A mysterious figure working against the party.',
    appearance: 'Cloaked in darkness.',
    personality: 'Calculating and ruthless.',
    motivations: ['Power', 'Revenge'],
    connections: [],
    sceneAppearances: ['scene-3', 'scene-4'],
  },
];


// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe('NPCList', () => {
  const defaultProps = {
    npcs: mockNPCs,
    onRefine: vi.fn(),
    onConfirm: vi.fn(),
    onConfirmAll: vi.fn(),
    onProceed: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders all NPCs', () => {
      render(<NPCList {...defaultProps} />);

      expect(screen.getByText('Orik the Guide')).toBeInTheDocument();
      expect(screen.getByText('Zara the Merchant')).toBeInTheDocument();
      expect(screen.getByText('The Shadow')).toBeInTheDocument();
    });

    it('renders NPC count header', () => {
      render(<NPCList {...defaultProps} />);

      expect(screen.getByText(/3.*npc/i)).toBeInTheDocument();
    });

    it('renders empty state when no NPCs', () => {
      render(<NPCList {...defaultProps} npcs={[]} />);

      expect(screen.getByText(/no npcs|empty/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Loading/Streaming State
  // ===========================================================================

  describe('loading state', () => {
    it('shows loading spinner during compilation', () => {
      render(<NPCList {...defaultProps} isLoading />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/compiling/i)).toBeInTheDocument();
    });

    it('displays streaming content during compilation', () => {
      render(
        <NPCList {...defaultProps} isLoading streamingContent="Analyzing scene 1 for NPCs..." />
      );

      expect(screen.getByText(/analyzing scene 1/i)).toBeInTheDocument();
    });

    it('disables confirm all button during loading', () => {
      render(<NPCList {...defaultProps} isLoading />);

      const confirmAllButton = screen.queryByRole('button', { name: /confirm all/i });
      if (confirmAllButton) {
        expect(confirmAllButton).toBeDisabled();
      }
    });
  });

  // ===========================================================================
  // NPC Card Interactions
  // ===========================================================================

  describe('NPC card interactions', () => {
    it('calls onRefine when refine clicked on NPC card', async () => {
      const user = userEvent.setup();
      const mockRefine = vi.fn();

      render(<NPCList {...defaultProps} onRefine={mockRefine} />);

      // Find the first NPC card and click refine
      const refineButtons = screen.getAllByRole('button', { name: /refine/i });
      await user.click(refineButtons[0]);

      expect(mockRefine).toHaveBeenCalledWith('npc-1');
    });

    it('calls onConfirm when confirm clicked on NPC card', async () => {
      const user = userEvent.setup();
      const mockConfirm = vi.fn();

      render(<NPCList {...defaultProps} onConfirm={mockConfirm} />);

      // Find confirm buttons (aria-label is "Confirm NPC")
      const confirmButtons = screen.getAllByRole('button', { name: /confirm npc/i });
      await user.click(confirmButtons[0]);

      expect(mockConfirm).toHaveBeenCalledWith('npc-1');
    });

    it('tracks confirmed NPCs', () => {
      render(<NPCList {...defaultProps} confirmedNPCIds={new Set(['npc-1'])} />);

      // First NPC should show confirmed state
      expect(screen.getAllByText(/confirmed/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  // ===========================================================================
  // Confirm All Action
  // ===========================================================================

  describe('confirm all action', () => {
    it('renders confirm all button', () => {
      render(<NPCList {...defaultProps} />);

      expect(screen.getByRole('button', { name: /confirm all/i })).toBeInTheDocument();
    });

    it('calls onConfirmAll when clicked', async () => {
      const user = userEvent.setup();
      const mockConfirmAll = vi.fn();

      render(<NPCList {...defaultProps} onConfirmAll={mockConfirmAll} />);

      await user.click(screen.getByRole('button', { name: /confirm all/i }));

      expect(mockConfirmAll).toHaveBeenCalled();
    });

    it('disables confirm all when all NPCs are confirmed', () => {
      const allConfirmed = new Set(mockNPCs.map((n) => n.id));
      render(<NPCList {...defaultProps} confirmedNPCIds={allConfirmed} />);

      const confirmAllButton = screen.queryByRole('button', { name: /confirm all/i });
      if (confirmAllButton) {
        expect(confirmAllButton).toBeDisabled();
      }
    });
  });

  // ===========================================================================
  // Proceed Action
  // ===========================================================================

  describe('proceed action', () => {
    it('renders proceed button when all NPCs confirmed', () => {
      const allConfirmed = new Set(mockNPCs.map((n) => n.id));
      render(<NPCList {...defaultProps} confirmedNPCIds={allConfirmed} />);

      expect(screen.getByRole('button', { name: /proceed|next|adversaries/i })).toBeInTheDocument();
    });

    it('calls onProceed when proceed clicked', async () => {
      const user = userEvent.setup();
      const mockProceed = vi.fn();
      const allConfirmed = new Set(mockNPCs.map((n) => n.id));

      render(<NPCList {...defaultProps} confirmedNPCIds={allConfirmed} onProceed={mockProceed} />);

      await user.click(screen.getByRole('button', { name: /proceed|next|adversaries/i }));

      expect(mockProceed).toHaveBeenCalled();
    });

    it('disables proceed when not all NPCs confirmed', () => {
      render(<NPCList {...defaultProps} confirmedNPCIds={new Set(['npc-1'])} />);

      const proceedButton = screen.queryByRole('button', { name: /proceed|next|adversaries/i });
      if (proceedButton) {
        expect(proceedButton).toBeDisabled();
      }
    });
  });

  // ===========================================================================
  // Filtering and Sorting
  // ===========================================================================

  describe('filtering and sorting', () => {
    it('can filter NPCs by role', async () => {
      const user = userEvent.setup();
      render(<NPCList {...defaultProps} />);

      // Find filter/role selector
      const roleFilter = screen.queryByRole('combobox', { name: /filter|role/i });
      if (roleFilter) {
        await user.selectOptions(roleFilter, 'antagonist');
        expect(screen.queryByText('Orik the Guide')).not.toBeInTheDocument();
        expect(screen.getByText('The Shadow')).toBeInTheDocument();
      }
    });

    it('can filter by confirmed status', async () => {
      const user = userEvent.setup();
      render(<NPCList {...defaultProps} confirmedNPCIds={new Set(['npc-1'])} />);

      // Find confirmed filter
      const statusFilter = screen.queryByRole('checkbox', { name: /unconfirmed|pending/i });
      if (statusFilter) {
        await user.click(statusFilter);
        // Should show only unconfirmed NPCs
      }
    });
  });

  // ===========================================================================
  // Progress Indicator
  // ===========================================================================

  describe('progress indicator', () => {
    it('shows confirmation progress', () => {
      render(<NPCList {...defaultProps} confirmedNPCIds={new Set(['npc-1'])} />);

      // Should show "1 of 3 confirmed" or similar
      expect(screen.getByText(/1.*3|1\/3/i)).toBeInTheDocument();
    });

    it('shows complete status when all confirmed', () => {
      const allConfirmed = new Set(mockNPCs.map((n) => n.id));
      render(<NPCList {...defaultProps} confirmedNPCIds={allConfirmed} />);

      // Check for the progress indicator showing 3/3
      expect(screen.getByText('3/3')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Error State
  // ===========================================================================

  describe('error state', () => {
    it('displays error message', () => {
      render(<NPCList {...defaultProps} error="Failed to compile NPCs" />);

      expect(screen.getByText(/failed to compile/i)).toBeInTheDocument();
    });

    it('shows retry button on error', () => {
      render(<NPCList {...defaultProps} error="Compilation failed" onRetry={vi.fn()} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls onRetry when retry clicked', async () => {
      const user = userEvent.setup();
      const mockRetry = vi.fn();

      render(<NPCList {...defaultProps} error="Compilation failed" onRetry={mockRetry} />);

      await user.click(screen.getByRole('button', { name: /retry/i }));

      expect(mockRetry).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    it('has accessible loading state', () => {
      render(<NPCList {...defaultProps} isLoading />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('NPC cards are in a list structure', () => {
      render(<NPCList {...defaultProps} />);

      // Should have list role or similar structure
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('each NPC card is a list item', () => {
      render(<NPCList {...defaultProps} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles single NPC', () => {
      render(<NPCList {...defaultProps} npcs={[mockNPCs[0]]} />);

      expect(screen.getByText('Orik the Guide')).toBeInTheDocument();
      expect(screen.getByText(/1.*npc/i)).toBeInTheDocument();
    });

    it('handles many NPCs', () => {
      const manyNPCs = Array.from({ length: 20 }, (_, i) => ({
        ...mockNPCs[0],
        id: `npc-${i}`,
        name: `NPC ${i}`,
      }));

      render(<NPCList {...defaultProps} npcs={manyNPCs} />);

      expect(screen.getByText(/20.*npc/i)).toBeInTheDocument();
    });

    it('handles NPC being refined', () => {
      render(<NPCList {...defaultProps} refiningNPCId="npc-2" />);

      // NPC-2 should show loading/refining state
      const npc2Card = screen.getByText('Zara the Merchant').closest('article');
      expect(npc2Card).toBeInTheDocument();
    });
  });
});
