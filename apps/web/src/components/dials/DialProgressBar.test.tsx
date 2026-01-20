/**
 * DialProgressBar Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DialProgressBar } from './DialProgressBar';

describe('DialProgressBar', () => {
  it('renders progress text with confirmed count out of total', () => {
    render(<DialProgressBar confirmedCount={5} totalCount={10} />);
    expect(screen.getByText('5 of 10 configured')).toBeInTheDocument();
  });

  it('renders 0 configured when no dials are confirmed', () => {
    render(<DialProgressBar confirmedCount={0} totalCount={10} />);
    expect(screen.getByText('0 of 10 configured')).toBeInTheDocument();
  });

  it('renders full progress when all dials are confirmed', () => {
    render(<DialProgressBar confirmedCount={10} totalCount={10} />);
    expect(screen.getByText('10 of 10 configured')).toBeInTheDocument();
  });

  it('renders a progress bar with correct aria attributes', () => {
    render(<DialProgressBar confirmedCount={7} totalCount={14} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '7');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '14');
  });

  it('applies custom className', () => {
    render(<DialProgressBar confirmedCount={5} totalCount={10} className="custom-class" />);
    const container = screen.getByTestId('dial-progress-bar');
    expect(container).toHaveClass('custom-class');
  });

  it('calculates correct width percentage for progress fill', () => {
    const { container } = render(<DialProgressBar confirmedCount={5} totalCount={10} />);
    const progressFill = container.querySelector('[data-testid="progress-fill"]');
    expect(progressFill).toHaveStyle({ width: '50%' });
  });
});
