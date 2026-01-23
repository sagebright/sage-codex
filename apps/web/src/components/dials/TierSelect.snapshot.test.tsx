/**
 * TierSelect Snapshot Tests
 *
 * Visual regression tests using Vitest's built-in snapshot capability.
 * Tests both light and dark mode states with different tier selections.
 */

import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { TierSelect } from './TierSelect';

describe('TierSelect Snapshots', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  describe('Light Mode', () => {
    it('renders tier 1 selected', () => {
      const { container } = render(
        <TierSelect value={1} onChange={() => {}} label="Party Tier" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders tier 2 selected', () => {
      const { container } = render(
        <TierSelect value={2} onChange={() => {}} label="Party Tier" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled state', () => {
      const { container } = render(
        <TierSelect value={3} onChange={() => {}} label="Party Tier" disabled />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Dark Mode', () => {
    beforeEach(() => {
      document.documentElement.classList.add('dark');
    });

    it('renders tier 1 selected', () => {
      const { container } = render(
        <TierSelect value={1} onChange={() => {}} label="Party Tier" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders tier 4 selected', () => {
      const { container } = render(
        <TierSelect value={4} onChange={() => {}} label="Party Tier" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled state', () => {
      const { container } = render(
        <TierSelect value={2} onChange={() => {}} label="Party Tier" disabled />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
