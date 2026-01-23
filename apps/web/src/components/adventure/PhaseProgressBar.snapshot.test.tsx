/**
 * PhaseProgressBar Snapshot Tests
 *
 * Captures visual structure at various phases to detect unintended changes.
 */

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PhaseProgressBar } from './PhaseProgressBar';

describe('PhaseProgressBar Snapshots', () => {
  describe('at setup phase', () => {
    it('renders correctly with short name', () => {
      const { container } = render(
        <PhaseProgressBar currentPhase="setup" adventureName="Test Quest" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders correctly with long name', () => {
      const { container } = render(
        <PhaseProgressBar
          currentPhase="setup"
          adventureName="The Incredible Journey Through Ancient Lands"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('at mid-phase (scenes)', () => {
    it('renders correctly showing completed and pending states', () => {
      const { container } = render(
        <PhaseProgressBar currentPhase="scenes" adventureName="Test Quest" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('at complete phase', () => {
    it('renders correctly with all phases completed', () => {
      const { container } = render(
        <PhaseProgressBar currentPhase="complete" adventureName="Test Quest" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('with default name', () => {
    it('renders correctly without adventure name', () => {
      const { container } = render(
        <PhaseProgressBar currentPhase="dial-tuning" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('dark mode', () => {
    it('has proper dark mode classes', () => {
      const { container } = render(
        <PhaseProgressBar currentPhase="frame" adventureName="Dark Quest" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
