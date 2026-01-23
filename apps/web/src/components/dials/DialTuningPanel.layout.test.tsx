/**
 * DialTuningPanel Layout Tests
 *
 * Tests for desktop layout balance across sections at wide viewports.
 *
 * Bug fix: Issue #80 - Rebalance column layout for visual consistency
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DialTuningPanel } from './DialTuningPanel';
import type { DialsState } from '../../stores/dialsStore';
import type {
  PartySize,
  PartyTier,
  SceneCount,
  SessionLength,
  ToneOption,
  NPCDensityOption,
  LethalityOption,
  EmotionalRegisterOption,
  PillarBalance,
  ThemeOption,
  DialId,
} from '@dagger-app/shared-types';

/**
 * Creates a mock DialsState for testing
 */
function createMockDials(overrides: Partial<DialsState> = {}): DialsState {
  return {
    partySize: 4 as PartySize,
    partyTier: 1 as PartyTier,
    sceneCount: 4 as SceneCount,
    sessionLength: '3-4 hours' as SessionLength,
    tone: null as ToneOption | null,
    pillarBalance: null as PillarBalance | null,
    npcDensity: null as NPCDensityOption | null,
    lethality: null as LethalityOption | null,
    emotionalRegister: null as EmotionalRegisterOption | null,
    themes: [] as ThemeOption[],
    confirmedDials: new Set<DialId>(),
    setDial: vi.fn(() => true),
    confirmDial: vi.fn(),
    unconfirmDial: vi.fn(),
    resetDials: vi.fn(),
    resetDial: vi.fn(),
    addTheme: vi.fn(() => true),
    removeTheme: vi.fn(),
    ...overrides,
  };
}

describe('DialTuningPanel Layout - Wide Viewport Balance', () => {
  let portalRoot: HTMLDivElement;

  beforeEach(() => {
    portalRoot = document.createElement('div');
    portalRoot.id = 'portal-root';
    document.body.appendChild(portalRoot);
  });

  afterEach(() => {
    if (portalRoot && portalRoot.parentNode) {
      portalRoot.parentNode.removeChild(portalRoot);
    }
    vi.clearAllMocks();
  });

  describe('Party section layout balance', () => {
    it('Party group grid spans 2 columns at lg breakpoint', () => {
      const dials = createMockDials();
      render(
        <DialTuningPanel dials={dials} onContinue={() => {}} canContinue={false} />
      );

      // Find the Party group specifically
      const partyGroup = screen.getByText('Party').closest('[data-testid="dial-group"]');
      expect(partyGroup).toBeInTheDocument();

      // The grid within Party group should use 2 columns at lg
      const partyGrid = partyGroup?.querySelector('[data-testid="dial-group-grid"]');
      expect(partyGrid).toHaveClass('lg:grid-cols-2');
    });
  });

  describe('Session section layout balance', () => {
    it('Session group grid spans 2 columns at lg breakpoint', () => {
      const dials = createMockDials();
      render(
        <DialTuningPanel dials={dials} onContinue={() => {}} canContinue={false} />
      );

      const sessionGroup = screen.getByText('Session').closest('[data-testid="dial-group"]');
      expect(sessionGroup).toBeInTheDocument();

      const sessionGrid = sessionGroup?.querySelector('[data-testid="dial-group-grid"]');
      expect(sessionGrid).toHaveClass('lg:grid-cols-2');
    });
  });

  describe('Atmosphere section layout', () => {
    it('Atmosphere group grid uses 3 columns at lg breakpoint', () => {
      const dials = createMockDials();
      render(
        <DialTuningPanel dials={dials} onContinue={() => {}} canContinue={false} />
      );

      const atmosphereGroup = screen.getByText('Atmosphere').closest('[data-testid="dial-group"]');
      expect(atmosphereGroup).toBeInTheDocument();

      const atmosphereGrid = atmosphereGroup?.querySelector('[data-testid="dial-group-grid"]');
      expect(atmosphereGrid).toHaveClass('lg:grid-cols-3');
    });
  });

  describe('visual consistency across sections', () => {
    it('all dial groups have consistent responsive breakpoints', () => {
      const dials = createMockDials();
      render(
        <DialTuningPanel dials={dials} onContinue={() => {}} canContinue={false} />
      );

      const grids = screen.getAllByTestId('dial-group-grid');

      // All grids should have mobile-first single column
      grids.forEach((grid) => {
        expect(grid).toHaveClass('grid-cols-1');
        expect(grid).toHaveClass('md:grid-cols-2');
      });
    });

    it('welcome banner maintains full width', () => {
      const dials = createMockDials();
      render(
        <DialTuningPanel dials={dials} onContinue={() => {}} canContinue={false} />
      );

      const welcomeBanner = screen.getByTestId('welcome-banner');
      // Banner should not have column constraints that would narrow it
      expect(welcomeBanner).not.toHaveClass('lg:col-span-2');
    });
  });
});
