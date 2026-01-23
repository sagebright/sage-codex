/**
 * PillarBalanceSelect Snapshot Tests
 *
 * Visual regression tests using Vitest's built-in snapshot capability.
 * Tests both light and dark mode states with different pillar configurations.
 */

import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { PillarBalanceSelect } from './PillarBalanceSelect';

describe('PillarBalanceSelect Snapshots', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  describe('Light Mode', () => {
    it('renders combat-primary balance', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'combat', secondary: 'exploration', tertiary: 'social' }}
          onChange={() => {}}
          label="Pillar Balance"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders exploration-primary balance', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'exploration', secondary: 'social', tertiary: 'combat' }}
          onChange={() => {}}
          label="Pillar Balance"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled state', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'social', secondary: 'combat', tertiary: 'exploration' }}
          onChange={() => {}}
          label="Pillar Balance"
          disabled
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Dark Mode', () => {
    beforeEach(() => {
      document.documentElement.classList.add('dark');
    });

    it('renders combat-primary balance', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'combat', secondary: 'exploration', tertiary: 'social' }}
          onChange={() => {}}
          label="Pillar Balance"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders social-primary balance', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'social', secondary: 'exploration', tertiary: 'combat' }}
          onChange={() => {}}
          label="Pillar Balance"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled state', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'exploration', secondary: 'combat', tertiary: 'social' }}
          onChange={() => {}}
          label="Pillar Balance"
          disabled
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
