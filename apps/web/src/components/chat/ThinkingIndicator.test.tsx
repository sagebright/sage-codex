/**
 * Tests for ThinkingIndicator component
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThinkingIndicator } from './ThinkingIndicator';

describe('ThinkingIndicator', () => {
  it('renders with accessible role and label', () => {
    render(<ThinkingIndicator />);

    const indicator = screen.getByRole('status');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute('aria-label', 'Sage is thinking');
  });

  it('renders the Sage label', () => {
    render(<ThinkingIndicator />);

    expect(screen.getByText('Sage')).toBeInTheDocument();
  });

  it('renders three thinking dots', () => {
    const { container } = render(<ThinkingIndicator />);

    const dots = container.querySelectorAll('.thinking-dot');
    expect(dots).toHaveLength(3);
  });
});
