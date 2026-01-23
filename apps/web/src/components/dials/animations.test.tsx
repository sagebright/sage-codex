/**
 * Animation Tests for Dial Tuning UI
 *
 * Tests that verify:
 * 1. Animations are applied correctly
 * 2. prefers-reduced-motion is respected via Tailwind's motion-safe/reduce
 * 3. Animation classes are present on interactive elements
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OptionButtonGroup } from './OptionButtonGroup';
import { MultiSelectChips } from './MultiSelectChips';
import { DialCard } from './DialCard';

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Mock matchMedia for prefers-reduced-motion testing
 */
function mockReducedMotion(prefersReduced: boolean) {
  const mockMatchMedia = (query: string) => ({
    matches: query.includes('prefers-reduced-motion') && prefersReduced,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });
}

// =============================================================================
// OptionButtonGroup Animation Tests
// =============================================================================

describe('OptionButtonGroup Animations', () => {
  const defaultProps = {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    value: null,
    onChange: () => {},
  };

  describe('hover effects', () => {
    it('should have motion-safe hover glow class on buttons', () => {
      render(<OptionButtonGroup {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        // Check for motion-safe hover glow animation class
        expect(button.className).toMatch(/motion-safe:hover:shadow-gold-glow/);
      });
    });

    it('should have transition classes for smooth animations', () => {
      render(<OptionButtonGroup {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toContain('transition');
      });
    });
  });

  describe('selection animations', () => {
    it('should have motion-safe selection animation when selected', () => {
      render(<OptionButtonGroup {...defaultProps} value="option1" />);

      const selectedButton = screen.getByRole('button', { pressed: true });
      // Check for motion-safe selection animation class
      expect(selectedButton.className).toMatch(/motion-safe:animate-selection-glow/);
    });
  });
});

// =============================================================================
// MultiSelectChips Animation Tests
// =============================================================================

describe('MultiSelectChips Animations', () => {
  const defaultProps = {
    options: [
      { id: 'chip1', label: 'Chip 1' },
      { id: 'chip2', label: 'Chip 2' },
    ],
    selected: [],
    maxSelections: 3,
    onChange: () => {},
  };

  describe('hover effects', () => {
    it('should have motion-safe hover scale/lift effect on chips', () => {
      render(<MultiSelectChips {...defaultProps} />);

      const chips = screen.getAllByRole('button');
      chips.forEach((chip) => {
        // Check for motion-safe scale and lift animations
        expect(chip.className).toMatch(/motion-safe:hover:scale/);
        expect(chip.className).toMatch(/motion-safe:hover:-translate-y/);
      });
    });
  });

  describe('selection animations', () => {
    it('should have motion-safe selection animation when selected', () => {
      render(<MultiSelectChips {...defaultProps} selected={['chip1']} />);

      const selectedChip = screen.getByRole('button', { pressed: true });
      expect(selectedChip.className).toMatch(/motion-safe:animate-selection-glow/);
    });
  });
});

// =============================================================================
// DialCard Animation Tests
// =============================================================================

describe('DialCard Animations', () => {
  const defaultProps = {
    label: 'Test Dial',
    value: 'Test Value',
    children: <button>Control</button>,
  };

  describe('hover effects', () => {
    it('should have motion-safe hover lift effect on card', () => {
      render(<DialCard {...defaultProps} />);

      const card = screen.getByTestId('dial-card');
      expect(card.className).toMatch(/motion-safe:hover:-translate-y/);
    });

    it('should have motion-safe hover glow effect on card', () => {
      render(<DialCard {...defaultProps} />);

      const card = screen.getByTestId('dial-card');
      expect(card.className).toMatch(/motion-safe:hover:shadow-gold-glow/);
    });
  });

  describe('state transition animations', () => {
    it('should have transition for isSet state changes', () => {
      render(<DialCard {...defaultProps} isSet={true} />);

      const card = screen.getByTestId('dial-card');
      expect(card.className).toContain('transition');
    });
  });
});

// =============================================================================
// Reduced Motion Tests
// =============================================================================

describe('prefers-reduced-motion support', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  describe('OptionButtonGroup', () => {
    it('should use motion-safe/reduce classes for animation control', () => {
      mockReducedMotion(true);

      render(
        <OptionButtonGroup
          options={[{ value: 'test', label: 'Test' }]}
          value="test"
          onChange={() => {}}
        />
      );

      // Animations are controlled via Tailwind's motion-safe/motion-reduce
      // CSS handles the actual enabling/disabling based on user preference
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/motion-safe:|motion-reduce:/);
    });
  });

  describe('MultiSelectChips', () => {
    it('should use motion-safe/reduce classes for animation control', () => {
      mockReducedMotion(true);

      render(
        <MultiSelectChips
          options={[{ id: 'test', label: 'Test' }]}
          selected={['test']}
          maxSelections={3}
          onChange={() => {}}
        />
      );

      const chip = screen.getByRole('button');
      expect(chip.className).toMatch(/motion-safe:|motion-reduce:/);
    });
  });

  describe('DialCard', () => {
    it('should use motion-safe/reduce classes for hover animations', () => {
      mockReducedMotion(true);

      render(
        <DialCard label="Test" value="Value">
          <span>Child</span>
        </DialCard>
      );

      const card = screen.getByTestId('dial-card');
      expect(card.className).toMatch(/motion-safe:|motion-reduce:/);
    });
  });
});

// =============================================================================
// CSS Animation Class Presence Tests
// =============================================================================

describe('Animation CSS classes are applied', () => {
  it('should have selection-glow animation class on selected option', () => {
    render(
      <OptionButtonGroup
        options={[{ value: 'test', label: 'Test' }]}
        value="test"
        onChange={() => {}}
      />
    );

    const selectedButton = screen.getByRole('button');
    expect(selectedButton.className).toMatch(/animate-selection-glow/);
  });

  it('should have selection-glow animation class on selected chip', () => {
    render(
      <MultiSelectChips
        options={[{ id: 'test', label: 'Test' }]}
        selected={['test']}
        maxSelections={3}
        onChange={() => {}}
      />
    );

    const selectedChip = screen.getByRole('button');
    expect(selectedChip.className).toMatch(/animate-selection-glow/);
  });
});
