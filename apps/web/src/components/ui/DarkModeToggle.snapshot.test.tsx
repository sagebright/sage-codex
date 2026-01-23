/**
 * DarkModeToggle Snapshot Tests
 *
 * Visual regression tests using Vitest's built-in snapshot capability.
 * Tests both dark mode (default) and light mode states.
 */

import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { DarkModeToggle } from './DarkModeToggle';

describe('DarkModeToggle Snapshots', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('renders in dark mode (default state)', () => {
    const { container } = render(<DarkModeToggle />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders in light mode (after toggle)', () => {
    const { container, getByRole } = render(<DarkModeToggle />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(container.firstChild).toMatchSnapshot();
  });
});
