/**
 * ToneSelect Snapshot Tests
 *
 * Visual regression tests using Vitest's built-in snapshot capability.
 * Tests both light and dark mode states with AI example stubs visible.
 */

import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ToneSelect } from './ToneSelect';

describe('ToneSelect Snapshots', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  describe('Light Mode', () => {
    it('renders grim tone selected with AI example', () => {
      const { container } = render(
        <ToneSelect value="grim" onChange={() => {}} label="Adventure Tone" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders balanced tone selected with AI example', () => {
      const { container } = render(
        <ToneSelect value="balanced" onChange={() => {}} label="Adventure Tone" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders whimsical tone selected with AI example', () => {
      const { container } = render(
        <ToneSelect value="whimsical" onChange={() => {}} label="Adventure Tone" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled state with AI examples', () => {
      const { container } = render(
        <ToneSelect value="serious" onChange={() => {}} label="Adventure Tone" disabled />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Dark Mode', () => {
    beforeEach(() => {
      document.documentElement.classList.add('dark');
    });

    it('renders grim tone selected with AI example', () => {
      const { container } = render(
        <ToneSelect value="grim" onChange={() => {}} label="Adventure Tone" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders lighthearted tone selected with AI example', () => {
      const { container } = render(
        <ToneSelect value="lighthearted" onChange={() => {}} label="Adventure Tone" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders disabled state with AI examples', () => {
      const { container } = render(
        <ToneSelect value="balanced" onChange={() => {}} label="Adventure Tone" disabled />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Default vs Confirmed States', () => {
    it('renders default (unconfirmed) state with AI examples', () => {
      const { container } = render(
        <ToneSelect
          value="balanced"
          onChange={() => {}}
          label="Adventure Tone"
          isDefault={true}
          isConfirmed={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders confirmed state with AI examples', () => {
      const { container } = render(
        <ToneSelect
          value="balanced"
          onChange={() => {}}
          label="Adventure Tone"
          isDefault={true}
          isConfirmed={true}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('renders default state with AI examples in dark mode', () => {
      document.documentElement.classList.add('dark');
      const { container } = render(
        <ToneSelect
          value="serious"
          onChange={() => {}}
          label="Adventure Tone"
          isDefault={true}
          isConfirmed={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
      document.documentElement.classList.remove('dark');
    });
  });
});
