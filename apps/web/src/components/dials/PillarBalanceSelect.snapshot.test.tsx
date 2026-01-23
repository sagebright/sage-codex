/**
 * PillarBalanceSelect Snapshot Tests
 *
 * Visual regression tests using Vitest's built-in snapshot capability.
 * Tests both light and dark mode states with different pillar configurations.
 * Includes drag-and-drop specific states.
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

    it('renders social-primary balance', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'social', secondary: 'combat', tertiary: 'exploration' }}
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

    it('renders without label', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'combat', secondary: 'exploration', tertiary: 'social' }}
          onChange={() => {}}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'combat', secondary: 'exploration', tertiary: 'social' }}
          onChange={() => {}}
          label="Pillar Balance"
          className="custom-wrapper-class"
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

  describe('Drag-and-Drop States', () => {
    it('renders draggable items with correct attributes', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'combat', secondary: 'exploration', tertiary: 'social' }}
          onChange={() => {}}
          label="Pillar Balance"
        />
      );

      // Check that sortable structure is in place
      const list = container.querySelector('ol');
      expect(list).toMatchSnapshot();
    });

    it('renders screen reader instructions', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'combat', secondary: 'exploration', tertiary: 'social' }}
          onChange={() => {}}
          label="Pillar Balance"
        />
      );

      // Find the sr-only instructions element
      const srOnlyElements = container.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);

      // Snapshot the instruction content
      const instructionsDiv = Array.from(srOnlyElements).find(
        el => el.textContent?.includes('Press Space or Enter')
      );
      expect(instructionsDiv).toMatchSnapshot();
    });

    it('renders list items with correct structure for sorting', () => {
      const { container } = render(
        <PillarBalanceSelect
          value={{ primary: 'social', secondary: 'combat', tertiary: 'exploration' }}
          onChange={() => {}}
          label="Reordered Balance"
        />
      );

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(3);

      // Each list item should have the expected structure
      listItems.forEach((item, index) => {
        expect(item).toMatchSnapshot(`list-item-${index}`);
      });
    });
  });
});
