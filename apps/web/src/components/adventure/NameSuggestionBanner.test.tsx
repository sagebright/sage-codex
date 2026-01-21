/**
 * NameSuggestionBanner Component Tests
 *
 * Tests for the dismissible name suggestion banner:
 * - Displays suggested name
 * - Accept callback with name
 * - Modify mode allows editing
 * - Dismiss callback
 * - Keyboard interactions
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NameSuggestionBanner } from './NameSuggestionBanner';

describe('NameSuggestionBanner', () => {
  const mockOnAccept = vi.fn();
  const mockOnDismiss = vi.fn();
  const defaultProps = {
    suggestedName: 'Shadows of Redemption',
    onAccept: mockOnAccept,
    onDismiss: mockOnDismiss,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the suggested name', () => {
      render(<NameSuggestionBanner {...defaultProps} />);

      expect(screen.getByText('"Shadows of Redemption"')).toBeInTheDocument();
    });

    it('renders the prompt text', () => {
      render(<NameSuggestionBanner {...defaultProps} />);

      expect(screen.getByText('How about naming your adventure?')).toBeInTheDocument();
    });

    it('renders Accept, Modify, and Dismiss buttons', () => {
      render(<NameSuggestionBanner {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Modify' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('has alert role for accessibility', () => {
      render(<NameSuggestionBanner {...defaultProps} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<NameSuggestionBanner {...defaultProps} className="custom-class" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('custom-class');
    });
  });

  describe('accept action', () => {
    it('calls onAccept with suggested name when Accept is clicked', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Accept' }));

      expect(mockOnAccept).toHaveBeenCalledWith('Shadows of Redemption');
    });
  });

  describe('modify action', () => {
    it('shows input field when Modify is clicked', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Modify' }));

      expect(screen.getByLabelText('Edit adventure name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Shadows of Redemption')).toBeInTheDocument();
    });

    it('shows Save and Cancel buttons in edit mode', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Modify' }));

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('calls onAccept with modified name when Save is clicked', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Modify' }));
      const input = screen.getByLabelText('Edit adventure name');
      await user.clear(input);
      await user.type(input, 'New Adventure Name');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockOnAccept).toHaveBeenCalledWith('New Adventure Name');
    });

    it('restores original name when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Modify' }));
      const input = screen.getByLabelText('Edit adventure name');
      await user.clear(input);
      await user.type(input, 'New Name');
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.getByText('"Shadows of Redemption"')).toBeInTheDocument();
      expect(mockOnAccept).not.toHaveBeenCalled();
    });

    it('disables Save button when input is empty', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Modify' }));
      const input = screen.getByLabelText('Edit adventure name');
      await user.clear(input);

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('trims whitespace from edited name', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Modify' }));
      const input = screen.getByLabelText('Edit adventure name');
      await user.clear(input);
      await user.type(input, '  Trimmed Name  ');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockOnAccept).toHaveBeenCalledWith('Trimmed Name');
    });
  });

  describe('dismiss action', () => {
    it('calls onDismiss when Dismiss button is clicked', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Dismiss' }));

      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('calls onDismiss when close button (X) is clicked', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Dismiss suggestion' }));

      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  describe('keyboard interactions', () => {
    it('saves on Enter key in edit mode', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Modify' }));
      const input = screen.getByLabelText('Edit adventure name');
      await user.clear(input);
      await user.type(input, 'Keyboard Name{Enter}');

      expect(mockOnAccept).toHaveBeenCalledWith('Keyboard Name');
    });

    it('cancels on Escape key in edit mode', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: 'Modify' }));
      const input = screen.getByLabelText('Edit adventure name');
      await user.clear(input);
      await user.type(input, 'New Name{Escape}');

      expect(screen.getByText('"Shadows of Redemption"')).toBeInTheDocument();
      expect(mockOnAccept).not.toHaveBeenCalled();
    });
  });

  describe('suggest another action', () => {
    const mockOnSuggestAnother = vi.fn();

    it('renders Suggest Another button when callback is provided', () => {
      render(<NameSuggestionBanner {...defaultProps} onSuggestAnother={mockOnSuggestAnother} />);

      expect(screen.getByRole('button', { name: 'Suggest Another' })).toBeInTheDocument();
    });

    it('does not render Suggest Another button when callback is not provided', () => {
      render(<NameSuggestionBanner {...defaultProps} />);

      expect(screen.queryByRole('button', { name: 'Suggest Another' })).not.toBeInTheDocument();
    });

    it('calls onSuggestAnother when Suggest Another button is clicked', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} onSuggestAnother={mockOnSuggestAnother} />);

      await user.click(screen.getByRole('button', { name: 'Suggest Another' }));

      expect(mockOnSuggestAnother).toHaveBeenCalled();
    });

    it('positions Suggest Another button between Modify and Dismiss', () => {
      render(<NameSuggestionBanner {...defaultProps} onSuggestAnother={mockOnSuggestAnother} />);

      const buttons = screen.getAllByRole('button');
      const acceptIndex = buttons.findIndex((btn) => btn.textContent === 'Accept');
      const modifyIndex = buttons.findIndex((btn) => btn.textContent === 'Modify');
      const suggestAnotherIndex = buttons.findIndex((btn) => btn.textContent === 'Suggest Another');
      const dismissIndex = buttons.findIndex((btn) => btn.textContent === 'Dismiss');

      // Suggest Another should be after Modify and before Dismiss
      expect(suggestAnotherIndex).toBeGreaterThan(modifyIndex);
      expect(suggestAnotherIndex).toBeLessThan(dismissIndex);
      expect(acceptIndex).toBeLessThan(modifyIndex);
    });

    it('does not show Suggest Another button in edit mode', async () => {
      const user = userEvent.setup();
      render(<NameSuggestionBanner {...defaultProps} onSuggestAnother={mockOnSuggestAnother} />);

      await user.click(screen.getByRole('button', { name: 'Modify' }));

      expect(screen.queryByRole('button', { name: 'Suggest Another' })).not.toBeInTheDocument();
    });

    it('shows loading state when isLoading is true', () => {
      render(
        <NameSuggestionBanner
          {...defaultProps}
          onSuggestAnother={mockOnSuggestAnother}
          isLoading={true}
        />
      );

      // When loading, button shows "Generating..." text
      const suggestButton = screen.getByRole('button', { name: /Generating/i });
      expect(suggestButton).toBeDisabled();
      expect(suggestButton).toHaveTextContent('Generating...');
    });

    it('disables Suggest Another button when isLoading', async () => {
      render(
        <NameSuggestionBanner
          {...defaultProps}
          onSuggestAnother={mockOnSuggestAnother}
          isLoading={true}
        />
      );

      const suggestButton = screen.getByRole('button', { name: /Generating/i });
      expect(suggestButton).toBeDisabled();
    });
  });
});
