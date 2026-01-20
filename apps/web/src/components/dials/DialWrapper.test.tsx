/**
 * DialWrapper Component Tests
 *
 * TDD tests for the consistent wrapper for dial components
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DialWrapper } from './DialWrapper';

describe('DialWrapper', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <DialWrapper label="Party Size" dialId="partySize">
          <input type="text" data-testid="child-input" />
        </DialWrapper>
      );

      expect(screen.getByTestId('child-input')).toBeInTheDocument();
    });

    it('renders label', () => {
      render(
        <DialWrapper label="Party Size" dialId="partySize">
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.getByText('Party Size')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <DialWrapper
          label="Party Size"
          dialId="partySize"
          description="Number of players at the table"
        >
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.getByText('Number of players at the table')).toBeInTheDocument();
    });

    it('renders help text when provided', () => {
      render(
        <DialWrapper
          label="Party Size"
          dialId="partySize"
          helpText="Recommended: 4 players"
        >
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.getByText('Recommended: 4 players')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <DialWrapper label="Test" dialId="test" className="custom-class">
          <span>Content</span>
        </DialWrapper>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('confirmed state', () => {
    it('shows confirmed indicator when isConfirmed is true', () => {
      render(
        <DialWrapper label="Party Size" dialId="partySize" isConfirmed>
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.getByTestId('confirmed-indicator')).toBeInTheDocument();
    });

    it('does not show confirmed indicator when isConfirmed is false', () => {
      render(
        <DialWrapper label="Party Size" dialId="partySize" isConfirmed={false}>
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.queryByTestId('confirmed-indicator')).not.toBeInTheDocument();
    });

    it('shows confirm button when onConfirm is provided and not confirmed', () => {
      const mockOnConfirm = vi.fn();
      render(
        <DialWrapper
          label="Party Size"
          dialId="partySize"
          isConfirmed={false}
          onConfirm={mockOnConfirm}
        >
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });

    it('hides confirm button when already confirmed', () => {
      const mockOnConfirm = vi.fn();
      render(
        <DialWrapper
          label="Party Size"
          dialId="partySize"
          isConfirmed={true}
          onConfirm={mockOnConfirm}
        >
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnConfirm = vi.fn();
      render(
        <DialWrapper
          label="Party Size"
          dialId="partySize"
          isConfirmed={false}
          onConfirm={mockOnConfirm}
        >
          <span>Content</span>
        </DialWrapper>
      );

      await user.click(screen.getByRole('button', { name: /confirm/i }));

      expect(mockOnConfirm).toHaveBeenCalledWith('partySize');
    });
  });

  describe('error state', () => {
    it('shows error message when provided', () => {
      render(
        <DialWrapper
          label="Party Size"
          dialId="partySize"
          error="Invalid value"
        >
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.getByText('Invalid value')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('does not show error when not provided', () => {
      render(
        <DialWrapper label="Party Size" dialId="partySize">
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('applies error styling when error is present', () => {
      render(
        <DialWrapper
          label="Party Size"
          dialId="partySize"
          error="Invalid value"
        >
          <span>Content</span>
        </DialWrapper>
      );

      const wrapper = screen.getByTestId('dial-wrapper');
      expect(wrapper).toHaveClass('border-blood');
    });
  });

  describe('required indicator', () => {
    it('shows required indicator when required is true', () => {
      render(
        <DialWrapper label="Party Size" dialId="partySize" required>
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not show required indicator when required is false', () => {
      render(
        <DialWrapper label="Party Size" dialId="partySize" required={false}>
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('associates label with content via aria-labelledby', () => {
      render(
        <DialWrapper label="Party Size" dialId="partySize">
          <span>Content</span>
        </DialWrapper>
      );

      const label = screen.getByText('Party Size');
      expect(label).toHaveAttribute('id');
    });

    it('associates description via aria-describedby', () => {
      render(
        <DialWrapper
          label="Party Size"
          dialId="partySize"
          description="Number of players"
        >
          <span>Content</span>
        </DialWrapper>
      );

      const description = screen.getByText('Number of players');
      expect(description).toHaveAttribute('id');
    });

    it('has proper role for error alert', () => {
      render(
        <DialWrapper label="Party Size" dialId="partySize" error="Invalid">
          <span>Content</span>
        </DialWrapper>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
