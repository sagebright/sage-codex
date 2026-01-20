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
    value: 4,
    isConfirmed: false,
    isEditing: false,
    onEdit: vi.fn(),
    onConfirm: vi.fn(),
    renderEditWidget: () => <input data-testid="edit-widget" />,
  };

  it('renders dial label', () => {
    render(<DialSummaryItem {...defaultProps} />);
    expect(screen.getByText('Party Size')).toBeInTheDocument();
  });

  it('renders dial value', () => {
    render(<DialSummaryItem {...defaultProps} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders string values correctly', () => {
    render(<DialSummaryItem {...defaultProps} value="Like The Witcher" />);
    expect(screen.getByText('Like The Witcher')).toBeInTheDocument();
  });

  it('renders array values as comma-separated list', () => {
    render(<DialSummaryItem {...defaultProps} value={['redemption', 'sacrifice']} />);
    expect(screen.getByText('redemption, sacrifice')).toBeInTheDocument();
  });

  it('renders "Not set" for null values', () => {
    render(<DialSummaryItem {...defaultProps} value={null} />);
    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  it('renders Edit button when not editing', () => {
    render(<DialSummaryItem {...defaultProps} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<DialSummaryItem {...defaultProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders edit widget when isEditing is true', () => {
    render(<DialSummaryItem {...defaultProps} isEditing={true} />);
    expect(screen.getByTestId('edit-widget')).toBeInTheDocument();
  });

  it('does not render Edit button when isEditing is true', () => {
    render(<DialSummaryItem {...defaultProps} isEditing={true} />);
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('renders checkmark indicator when confirmed', () => {
    render(<DialSummaryItem {...defaultProps} isConfirmed={true} />);
    expect(screen.getByTestId('confirmed-checkmark')).toBeInTheDocument();
  });

  it('does not render checkmark indicator when not confirmed', () => {
    render(<DialSummaryItem {...defaultProps} isConfirmed={false} />);
    expect(screen.queryByTestId('confirmed-checkmark')).not.toBeInTheDocument();
  });

  it('applies pending styling when not confirmed', () => {
    render(<DialSummaryItem {...defaultProps} isConfirmed={false} />);
    const container = screen.getByTestId('dial-summary-item');
    expect(container).toHaveClass('border-l-2');
  });

  it('renders Confirm button when editing and not confirmed', () => {
    render(<DialSummaryItem {...defaultProps} isEditing={true} isConfirmed={false} />);
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('calls onConfirm when Confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<DialSummaryItem {...defaultProps} isEditing={true} isConfirmed={false} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
