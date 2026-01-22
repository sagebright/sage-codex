/**
 * PoweredByIndicator Component Tests
 *
 * Tests for the PoweredByIndicator component which shows
 * generation status (loading) and "Powered by Claude" attribution.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PoweredByIndicator } from './PoweredByIndicator';

describe('PoweredByIndicator', () => {
  describe('loading state', () => {
    it('shows spinning indicator when loading', () => {
      render(<PoweredByIndicator isLoading={true} />);

      // Should show loading animation
      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-label', 'Generating with Claude');
    });

    it('shows "Generating with Claude..." text when loading', () => {
      render(<PoweredByIndicator isLoading={true} />);

      expect(screen.getByText(/Generating with Claude/i)).toBeInTheDocument();
    });

    it('applies animate-spin class to spinner when loading', () => {
      render(<PoweredByIndicator isLoading={true} />);

      const spinner = screen.getByTestId('claude-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('complete state', () => {
    it('shows Claude logo when not loading', () => {
      render(<PoweredByIndicator isLoading={false} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-label', 'Powered by Claude');
    });

    it('shows "Powered by Claude" text when not loading', () => {
      render(<PoweredByIndicator isLoading={false} />);

      expect(screen.getByText('Powered by Claude')).toBeInTheDocument();
    });

    it('does not show spinner when not loading', () => {
      render(<PoweredByIndicator isLoading={false} />);

      expect(screen.queryByTestId('claude-spinner')).not.toBeInTheDocument();
    });
  });

  describe('visibility', () => {
    it('is visible by default', () => {
      render(<PoweredByIndicator isLoading={false} />);

      const indicator = screen.getByRole('status');
      expect(indicator).toBeVisible();
    });

    it('can be hidden with className', () => {
      render(<PoweredByIndicator isLoading={false} className="hidden" />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('hidden');
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<PoweredByIndicator isLoading={false} className="mt-4" />);

      const indicator = screen.getByRole('status');
      expect(indicator).toHaveClass('mt-4');
    });

    it('has fantasy theme styling', () => {
      render(<PoweredByIndicator isLoading={false} />);

      const indicator = screen.getByRole('status');
      // Should have some fantasy-themed classes
      expect(indicator.className).toMatch(/text-(ink|parchment|gold)/);
    });
  });
});
