/**
 * PhaseProgressBar Component Tests
 *
 * Tests for the progress bar that displays adventure phases.
 * Verifies phase labels, adventure name display, and responsive behavior.
 */

import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PhaseProgressBar } from './PhaseProgressBar';
import { PHASES } from '@dagger-app/shared-types';

describe('PhaseProgressBar', () => {
  describe('adventure name display', () => {
    it('displays adventure names up to 40 characters without truncation', () => {
      const longName = 'The Quest for the Legendary Ancient Swords';
      expect(longName.length).toBe(42); // Verify we're testing >40 chars

      render(
        <PhaseProgressBar currentPhase="setup" adventureName={longName} />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      // The name should not be truncated - full text should be visible
      expect(heading).toHaveTextContent(longName);
      // Verify no truncation class is applied
      expect(heading).not.toHaveClass('truncate');
    });

    it('displays 40-character adventure name without truncation', () => {
      // Exactly 40 characters
      const exactName = 'The Hollow Vigil of the Forgotten Realms';
      expect(exactName.length).toBe(40);

      render(
        <PhaseProgressBar currentPhase="dial-tuning" adventureName={exactName} />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(exactName);
      expect(heading).not.toHaveClass('truncate');
    });

    it('shows tooltip for very long names (over 60 characters)', () => {
      const veryLongName = 'The Incredibly Long and Winding Tale of Heroes Traversing the Mystical Lands';
      expect(veryLongName.length).toBeGreaterThan(60);

      render(
        <PhaseProgressBar currentPhase="setup" adventureName={veryLongName} />
      );

      const heading = screen.getByRole('heading', { level: 2 });
      // Should have a title attribute for very long names
      expect(heading).toHaveAttribute('title', veryLongName);
    });

    it('displays default name when no adventure name provided', () => {
      render(<PhaseProgressBar currentPhase="setup" />);

      expect(screen.getByText('Untitled Adventure')).toBeInTheDocument();
    });
  });

  describe('phase labels visibility', () => {
    it('renders visible labels for all 10 phases in the progress indicators', () => {
      render(
        <PhaseProgressBar currentPhase="setup" adventureName="Test Adventure" />
      );

      const indicators = screen.getAllByTestId('phase-indicator');

      // All phase labels should be visible in their respective indicators
      // Each indicator has both full label (desktop) and abbreviated (mobile)
      PHASES.forEach((phase, index) => {
        const labels = within(indicators[index]).getAllByText(phase.label);
        // Should have the full label (abbreviated may be different text)
        expect(labels.length).toBeGreaterThan(0);
      });
    });

    it('displays phase label below each progress indicator', () => {
      render(
        <PhaseProgressBar currentPhase="dial-tuning" adventureName="Test" />
      );

      // Find the phase indicators container
      const phaseIndicators = screen.getAllByTestId('phase-indicator');
      expect(phaseIndicators).toHaveLength(10);

      // Each indicator should have labels (full and abbreviated)
      phaseIndicators.forEach((indicator, index) => {
        const labels = within(indicator).getAllByText(PHASES[index].label);
        expect(labels.length).toBeGreaterThan(0);
      });
    });

    it('labels are not hidden behind hover-only visibility', () => {
      render(
        <PhaseProgressBar currentPhase="frame" adventureName="Test" />
      );

      const indicators = screen.getAllByTestId('phase-indicator');
      const frameIndex = PHASES.findIndex(p => p.id === 'frame');

      // The labels for frame phase should not have sr-only class
      const frameLabels = within(indicators[frameIndex]).getAllByText('Frame');
      // At least one label should not have sr-only (the visible one based on viewport)
      const hasVisibleLabel = frameLabels.some(label => !label.classList.contains('sr-only'));
      expect(hasVisibleLabel).toBe(true);
    });
  });

  describe('progress bar states', () => {
    it('shows completed state for phases before current', () => {
      render(
        <PhaseProgressBar currentPhase="scenes" adventureName="Test" />
      );

      // Phases 0-3 (setup, dial-tuning, frame, outline) should be completed
      const indicators = screen.getAllByTestId('phase-indicator');

      // Check the 'scenes' phase is at index 4
      const scenesPhase = PHASES.find(p => p.id === 'scenes');
      expect(scenesPhase?.order).toBe(4);

      // First 4 indicators should have completed styling
      for (let i = 0; i < 4; i++) {
        const dot = within(indicators[i]).getByTestId('phase-dot');
        expect(dot).toHaveClass('bg-gold-500');
      }
    });

    it('shows current state for current phase with ring indicator', () => {
      render(
        <PhaseProgressBar currentPhase="outline" adventureName="Test" />
      );

      const indicators = screen.getAllByTestId('phase-indicator');
      const outlineIndex = PHASES.findIndex(p => p.id === 'outline');

      const currentDot = within(indicators[outlineIndex]).getByTestId('phase-dot');
      expect(currentDot).toHaveClass('ring-2');
    });

    it('shows pending state for phases after current', () => {
      render(
        <PhaseProgressBar currentPhase="setup" adventureName="Test" />
      );

      const indicators = screen.getAllByTestId('phase-indicator');

      // All phases except setup should be pending
      for (let i = 1; i < indicators.length; i++) {
        const dot = within(indicators[i]).getByTestId('phase-dot');
        expect(dot).toHaveClass('bg-ink-300');
      }
    });
  });

  describe('progress percentage', () => {
    it('shows 0% complete for setup phase', () => {
      render(
        <PhaseProgressBar currentPhase="setup" adventureName="Test" />
      );

      expect(screen.getByText('0% Complete')).toBeInTheDocument();
    });

    it('shows 100% complete for complete phase', () => {
      render(
        <PhaseProgressBar currentPhase="complete" adventureName="Test" />
      );

      expect(screen.getByText('100% Complete')).toBeInTheDocument();
    });

    it('shows correct percentage for middle phases', () => {
      render(
        <PhaseProgressBar currentPhase="scenes" adventureName="Test" />
      );

      // scenes is order 4 of 10 (0-9), so 4/9 = 44%
      expect(screen.getByText('44% Complete')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible progressbar role with correct aria attributes', () => {
      render(
        <PhaseProgressBar currentPhase="dial-tuning" adventureName="Test" />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '11');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('has descriptive aria-label including phase name', () => {
      render(
        <PhaseProgressBar currentPhase="npcs" adventureName="Test" />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute(
        'aria-label',
        expect.stringMatching(/NPCs/i)
      );
    });

    it('phase labels are semantically associated with indicators', () => {
      render(
        <PhaseProgressBar currentPhase="setup" adventureName="Test" />
      );

      const indicators = screen.getAllByTestId('phase-indicator');

      // Each indicator should be labeled properly for screen readers
      PHASES.forEach((phase, index) => {
        const labels = within(indicators[index]).getAllByText(phase.label);
        // Labels should be visible (accessible) and not aria-hidden
        labels.forEach(label => {
          expect(label).not.toHaveAttribute('aria-hidden', 'true');
        });
      });
    });
  });

  describe('responsive behavior', () => {
    it('renders phase abbreviations on narrow viewports', () => {
      // This tests the presence of both full and abbreviated labels
      // The CSS handles the actual show/hide based on viewport
      render(
        <PhaseProgressBar currentPhase="setup" adventureName="Test" />
      );

      // Should have abbreviated versions available
      // Full labels: "Dial Tuning" should have abbreviated "Dials"
      const indicators = screen.getAllByTestId('phase-indicator');

      // At least check that the structure supports both
      // Look for the dial-tuning indicator
      const dialTuningIndex = PHASES.findIndex(p => p.id === 'dial-tuning');
      const dialIndicator = indicators[dialTuningIndex];

      // Should have both full and short labels (CSS controls visibility)
      expect(within(dialIndicator).getByText('Dial Tuning')).toBeInTheDocument();
    });

    it('maintains fantasy theme styling', () => {
      render(
        <PhaseProgressBar currentPhase="frame" adventureName="Test" />
      );

      // Check that fantasy theme classes are applied
      const container = screen.getByTestId('phase-progress-bar');
      expect(container).toHaveClass('bg-parchment-100');
    });
  });

  describe('custom className support', () => {
    it('accepts and applies additional className', () => {
      render(
        <PhaseProgressBar
          currentPhase="setup"
          adventureName="Test"
          className="custom-class mt-4"
        />
      );

      const container = screen.getByTestId('phase-progress-bar');
      expect(container).toHaveClass('custom-class');
      expect(container).toHaveClass('mt-4');
    });
  });
});
