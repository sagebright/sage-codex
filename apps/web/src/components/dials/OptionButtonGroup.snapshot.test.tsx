/**
 * OptionButtonGroup Snapshot Tests
 *
 * Visual regression tests using Vitest's built-in snapshot capability.
 * Tests both light and dark mode states with selected/unselected variants.
 */

import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { OptionButtonGroup } from './OptionButtonGroup';

const TEST_OPTIONS = [
  { value: 'option1', label: 'Option 1', description: 'First option' },
  { value: 'option2', label: 'Option 2', description: 'Second option' },
  { value: 'option3', label: 'Option 3' },
];

describe('OptionButtonGroup Snapshots', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  describe('Light Mode', () => {
    it('renders with no selection', () => {
      const { container } = render(
        <OptionButtonGroup
          options={TEST_OPTIONS}
          value={null}
          onChange={() => {}}
          label="Test Options"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders with selected option', () => {
      const { container } = render(
        <OptionButtonGroup
          options={TEST_OPTIONS}
          value="option2"
          onChange={() => {}}
          label="Test Options"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled state', () => {
      const { container } = render(
        <OptionButtonGroup
          options={TEST_OPTIONS}
          value="option1"
          onChange={() => {}}
          label="Test Options"
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

    it('renders with no selection', () => {
      const { container } = render(
        <OptionButtonGroup
          options={TEST_OPTIONS}
          value={null}
          onChange={() => {}}
          label="Test Options"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders with selected option', () => {
      const { container } = render(
        <OptionButtonGroup
          options={TEST_OPTIONS}
          value="option2"
          onChange={() => {}}
          label="Test Options"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled state', () => {
      const { container } = render(
        <OptionButtonGroup
          options={TEST_OPTIONS}
          value="option1"
          onChange={() => {}}
          label="Test Options"
          disabled
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
