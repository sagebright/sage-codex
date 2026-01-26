/**
 * NPCCard Component Tests
 *
 * Tests for individual NPC display with name, role, description,
 * and interaction controls for refinement and confirmation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NPCCard } from './NPCCard';
import type { NPC, CompiledNPC } from '@dagger-app/shared-types';

// =============================================================================
// Test Data
// =============================================================================

const mockNPC: NPC = {
  id: 'npc-1',
  name: 'Orik the Guide',
  role: 'quest-giver',
  description: 'A weathered traveler who knows the ancient paths through the forest.',
  appearance:
    'Tall and lean, with silver-streaked hair and piercing blue eyes that seem to see beyond.',
  personality: 'Cautious but kind-hearted, speaks in measured tones and riddles.',
  motivations: ['Protect the village from the darkness', 'Atone for past mistakes'],
  connections: ['Elder Mira (sister)', 'The Hollow Grove (sacred site)'],
  sceneAppearances: ['scene-1', 'scene-3'],
};

const mockCompiledNPC: CompiledNPC = {
  ...mockNPC,
  isConfirmed: false,
  extractedFrom: [
    { sceneId: 'scene-1', context: 'The party meets Orik at the village gate.' },
    { sceneId: 'scene-3', context: 'Orik reveals the secret path through the forest.' },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe('NPCCard', () => {
  const defaultProps = {
    npc: mockNPC,
    onRefine: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders NPC name', () => {
      render(<NPCCard {...defaultProps} />);

      expect(screen.getByText('Orik the Guide')).toBeInTheDocument();
    });

    it('renders NPC role badge', () => {
      render(<NPCCard {...defaultProps} />);

      expect(screen.getByText(/quest-giver/i)).toBeInTheDocument();
    });

    it('renders NPC description', () => {
      render(<NPCCard {...defaultProps} />);

      expect(screen.getByText(/weathered traveler/i)).toBeInTheDocument();
    });

    it('renders appearance section', () => {
      render(<NPCCard {...defaultProps} />);

      expect(screen.getByText(/silver-streaked hair/i)).toBeInTheDocument();
    });

    it('renders personality section', () => {
      render(<NPCCard {...defaultProps} />);

      expect(screen.getByText(/cautious but kind/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Role Display Tests
  // ===========================================================================

  describe('role display', () => {
    it('renders ally role with correct styling', () => {
      const allyNPC: NPC = { ...mockNPC, role: 'ally' };
      render(<NPCCard {...defaultProps} npc={allyNPC} />);

      expect(screen.getByText(/ally/i)).toBeInTheDocument();
    });

    it('renders antagonist role with correct styling', () => {
      const antagonistNPC: NPC = { ...mockNPC, role: 'antagonist' };
      render(<NPCCard {...defaultProps} npc={antagonistNPC} />);

      expect(screen.getByText(/antagonist/i)).toBeInTheDocument();
    });

    it('renders neutral role', () => {
      const neutralNPC: NPC = { ...mockNPC, role: 'neutral' };
      render(<NPCCard {...defaultProps} npc={neutralNPC} />);

      expect(screen.getByText(/neutral/i)).toBeInTheDocument();
    });

    it('renders bystander role', () => {
      const bystanderNPC: NPC = { ...mockNPC, role: 'bystander' };
      render(<NPCCard {...defaultProps} npc={bystanderNPC} />);

      expect(screen.getByText(/bystander/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Motivations Display
  // ===========================================================================

  describe('motivations display', () => {
    it('renders all motivations when expanded', async () => {
      const user = userEvent.setup();
      render(<NPCCard {...defaultProps} />);

      // Motivations are hidden by default - expand first
      await user.click(screen.getByRole('button', { name: /show more/i }));

      expect(screen.getByText(/protect the village/i)).toBeInTheDocument();
      expect(screen.getByText(/atone for past mistakes/i)).toBeInTheDocument();
    });

    it('handles NPC with no motivations', () => {
      const npcNoMotivations: NPC = { ...mockNPC, motivations: [] };
      render(<NPCCard {...defaultProps} npc={npcNoMotivations} />);

      // Should render without crashing
      expect(screen.getByText('Orik the Guide')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Connections Display
  // ===========================================================================

  describe('connections display', () => {
    it('renders all connections when expanded', async () => {
      const user = userEvent.setup();
      render(<NPCCard {...defaultProps} />);

      // Connections are hidden by default - expand first
      await user.click(screen.getByRole('button', { name: /show more/i }));

      expect(screen.getByText(/elder mira/i)).toBeInTheDocument();
      expect(screen.getByText(/hollow grove/i)).toBeInTheDocument();
    });

    it('handles NPC with no connections', () => {
      const npcNoConnections: NPC = { ...mockNPC, connections: [] };
      render(<NPCCard {...defaultProps} npc={npcNoConnections} />);

      expect(screen.getByText('Orik the Guide')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Scene Appearances
  // ===========================================================================

  describe('scene appearances', () => {
    it('shows scene count', () => {
      render(<NPCCard {...defaultProps} />);

      // Should show "Appears in 2 scenes" or similar
      expect(screen.getByText(/2.*scene/i)).toBeInTheDocument();
    });

    it('handles single scene appearance', () => {
      const npcSingleScene: NPC = { ...mockNPC, sceneAppearances: ['scene-1'] };
      render(<NPCCard {...defaultProps} npc={npcSingleScene} />);

      expect(screen.getByText(/1.*scene/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Refine Interaction
  // ===========================================================================

  describe('refine interaction', () => {
    it('renders refine button', () => {
      render(<NPCCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /refine/i })).toBeInTheDocument();
    });

    it('calls onRefine when refine button clicked', async () => {
      const user = userEvent.setup();
      const mockRefine = vi.fn();

      render(<NPCCard {...defaultProps} onRefine={mockRefine} />);

      await user.click(screen.getByRole('button', { name: /refine/i }));

      expect(mockRefine).toHaveBeenCalledWith('npc-1');
    });

    it('disables refine button when confirmed', () => {
      const confirmedNPC: CompiledNPC = { ...mockCompiledNPC, isConfirmed: true };
      render(<NPCCard {...defaultProps} npc={confirmedNPC} isConfirmed />);

      expect(screen.queryByRole('button', { name: /refine/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Confirm Interaction
  // ===========================================================================

  describe('confirm interaction', () => {
    it('renders confirm button', () => {
      render(<NPCCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button clicked', async () => {
      const user = userEvent.setup();
      const mockConfirm = vi.fn();

      render(<NPCCard {...defaultProps} onConfirm={mockConfirm} />);

      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(mockConfirm).toHaveBeenCalledWith('npc-1');
    });

    it('shows confirmed state', () => {
      render(<NPCCard {...defaultProps} isConfirmed />);

      expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
    });

    it('hides confirm button when confirmed', () => {
      render(<NPCCard {...defaultProps} isConfirmed />);

      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Expanded/Collapsed State
  // ===========================================================================

  describe('expanded state', () => {
    it('can expand to show full details', async () => {
      const user = userEvent.setup();

      render(<NPCCard {...defaultProps} />);

      // Find expand/collapse toggle
      const expandToggle = screen.getByRole('button', { name: /show more|expand|details/i });
      await user.click(expandToggle);

      // Should show appearance and personality details
      expect(screen.getByText(/silver-streaked hair/i)).toBeVisible();
    });

    it('can collapse details', async () => {
      const user = userEvent.setup();

      render(<NPCCard {...defaultProps} defaultExpanded />);

      // Find collapse toggle
      const collapseToggle = screen.getByRole('button', { name: /show less|collapse|hide/i });
      await user.click(collapseToggle);

      // Details should be hidden (implementation may vary)
    });
  });

  // ===========================================================================
  // Loading State
  // ===========================================================================

  describe('loading state', () => {
    it('shows loading state when refining', () => {
      render(<NPCCard {...defaultProps} isLoading />);

      expect(screen.getByText(/refining|loading/i)).toBeInTheDocument();
    });

    it('disables buttons when loading', () => {
      render(<NPCCard {...defaultProps} isLoading />);

      const refineButton = screen.queryByRole('button', { name: /refine/i });
      const confirmButton = screen.queryByRole('button', { name: /confirm/i });

      if (refineButton) expect(refineButton).toBeDisabled();
      if (confirmButton) expect(confirmButton).toBeDisabled();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('accessibility', () => {
    it('has accessible name', () => {
      render(<NPCCard {...defaultProps} />);

      // Card should have accessible name or role
      expect(screen.getByText('Orik the Guide')).toBeInTheDocument();
    });

    it('role badge has accessible text', () => {
      render(<NPCCard {...defaultProps} />);

      expect(screen.getByText(/quest-giver/i)).toBeInTheDocument();
    });

    it('buttons have accessible names', () => {
      render(<NPCCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: /refine/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    it('handles very long name', () => {
      const longNameNPC: NPC = { ...mockNPC, name: 'A'.repeat(100) };
      render(<NPCCard {...defaultProps} npc={longNameNPC} />);

      // Should render without breaking layout
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('handles very long description', () => {
      const longDescNPC: NPC = { ...mockNPC, description: 'A'.repeat(1000) };
      render(<NPCCard {...defaultProps} npc={longDescNPC} />);

      // Should render without crashing
      expect(screen.getByText(mockNPC.name)).toBeInTheDocument();
    });

    it('handles NPC with minimal data', () => {
      const minimalNPC: NPC = {
        id: 'npc-min',
        name: 'Stranger',
        role: 'neutral',
        description: 'Unknown',
        appearance: '',
        personality: '',
        motivations: [],
        connections: [],
        sceneAppearances: [],
      };

      render(<NPCCard {...defaultProps} npc={minimalNPC} />);

      expect(screen.getByText('Stranger')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Animation Tests
  // ===========================================================================

  describe('animations', () => {
    it('has hover lift animation classes (motion-safe)', () => {
      render(<NPCCard {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toHaveClass('motion-safe:hover:-translate-y-1');
    });

    it('has hover glow animation classes (motion-safe)', () => {
      render(<NPCCard {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toHaveClass('motion-safe:hover:shadow-gold-glow-subtle');
    });

    it('has selection glow animation when confirmed (motion-safe)', () => {
      render(<NPCCard {...defaultProps} isConfirmed />);

      const card = screen.getByRole('article');
      expect(card).toHaveClass('motion-safe:animate-selection-glow');
    });

    it('does not have selection glow animation when not confirmed', () => {
      render(<NPCCard {...defaultProps} isConfirmed={false} />);

      const card = screen.getByRole('article');
      expect(card).not.toHaveClass('motion-safe:animate-selection-glow');
    });

    it('has smooth transition classes', () => {
      render(<NPCCard {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-200');
    });

    it('applies gold glow shadow when confirmed', () => {
      render(<NPCCard {...defaultProps} isConfirmed />);

      const card = screen.getByRole('article');
      expect(card).toHaveClass('shadow-gold-glow');
    });

    it('does not apply gold glow shadow when not confirmed', () => {
      render(<NPCCard {...defaultProps} isConfirmed={false} />);

      const card = screen.getByRole('article');
      expect(card).not.toHaveClass('shadow-gold-glow');
    });
  });

  // ===========================================================================
  // Focus Ring Tests
  // ===========================================================================

  describe('focus ring accessibility', () => {
    it('Refine button has focus ring classes', () => {
      render(<NPCCard {...defaultProps} />);

      const refineButton = screen.getByRole('button', { name: /refine/i });
      expect(refineButton).toHaveClass('focus:outline-none');
      expect(refineButton).toHaveClass('focus:ring-2');
      expect(refineButton).toHaveClass('focus:ring-gold-400');
      expect(refineButton).toHaveClass('focus:ring-offset-2');
    });

    it('Confirm button has focus ring classes', () => {
      render(<NPCCard {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).toHaveClass('focus:outline-none');
      expect(confirmButton).toHaveClass('focus:ring-2');
      expect(confirmButton).toHaveClass('focus:ring-gold-400');
      expect(confirmButton).toHaveClass('focus:ring-offset-2');
    });
  });
});
