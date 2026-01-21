/**
 * DialSummaryItem Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialSummaryItem } from './DialSummaryItem';

describe('DialSummaryItem', () => {
  const defaultProps = {
    dialId: 'partySize' as const,
    label: 'Party Size',
    isConfirmed: false,
    onConfirmToggle: vi.fn(),
    selector: <div data-testid="selector-widget">Selector</div>,
  };

  it('renders dial label', () => {
    render(<DialSummaryItem {...defaultProps} />);
    expect(screen.getByText('Party Size')).toBeInTheDocument();
  });

  it('always renders selector widget inline', () => {
    render(<DialSummaryItem {...defaultProps} />);
    expect(screen.getByTestId('selector-widget')).toBeInTheDocument();
  });

  it('renders ConfirmCheckmark in header', () => {
    render(<DialSummaryItem {...defaultProps} />);
    // ConfirmCheckmark renders a button with aria-pressed
    expect(screen.getByRole('button', { pressed: false })).toBeInTheDocument();
  });

  it('shows gold checkmark when confirmed', () => {
    render(<DialSummaryItem {...defaultProps} isConfirmed={true} />);
    const checkmark = screen.getByRole('button', { pressed: true });
    expect(checkmark).toBeInTheDocument();
  });

  it('calls onConfirmToggle when checkmark is clicked', () => {
    const onConfirmToggle = vi.fn();
    render(<DialSummaryItem {...defaultProps} onConfirmToggle={onConfirmToggle} />);

    const checkmark = screen.getByRole('button', { pressed: false });
    fireEvent.click(checkmark);

    expect(onConfirmToggle).toHaveBeenCalledTimes(1);
  });

  it('applies pending styling when not confirmed', () => {
    render(<DialSummaryItem {...defaultProps} isConfirmed={false} />);
    const container = screen.getByTestId('dial-summary-item');
    expect(container).toHaveClass('border-l-2');
  });

  it('applies confirmed styling when confirmed', () => {
    render(<DialSummaryItem {...defaultProps} isConfirmed={true} />);
    const container = screen.getByTestId('dial-summary-item');
    expect(container).not.toHaveClass('border-l-2');
  });

  it('renders with custom className', () => {
    render(<DialSummaryItem {...defaultProps} className="custom-class" />);
    const container = screen.getByTestId('dial-summary-item');
    expect(container).toHaveClass('custom-class');
  });

  it('provides accessible label for confirm checkmark', () => {
    render(<DialSummaryItem {...defaultProps} />);
    expect(screen.getByRole('button', { name: /confirm party size/i })).toBeInTheDocument();
  });

  it('provides accessible label for unconfirm when confirmed', () => {
    render(<DialSummaryItem {...defaultProps} isConfirmed={true} />);
    expect(screen.getByRole('button', { name: /unconfirm party size/i })).toBeInTheDocument();
  });
});
