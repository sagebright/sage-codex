/**
 * ChatInput Component Tests
 *
 * TDD tests for the chat input textarea with send functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  const mockOnSend = vi.fn();

  beforeEach(() => {
    mockOnSend.mockClear();
  });

  describe('rendering', () => {
    it('renders textarea and send button', () => {
      render(<ChatInput onSend={mockOnSend} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('applies custom placeholder', () => {
      render(<ChatInput onSend={mockOnSend} placeholder="Type something..." />);

      expect(screen.getByPlaceholderText('Type something...')).toBeInTheDocument();
    });

    it('applies default placeholder when not specified', () => {
      render(<ChatInput onSend={mockOnSend} />);

      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ChatInput onSend={mockOnSend} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('sending messages', () => {
    it('calls onSend with trimmed content on button click', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '  Hello world  ');
      await user.click(screen.getByRole('button', { name: /send/i }));

      expect(mockOnSend).toHaveBeenCalledTimes(1);
      expect(mockOnSend).toHaveBeenCalledWith('Hello world');
    });

    it('clears input after sending', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world');
      await user.click(screen.getByRole('button', { name: /send/i }));

      expect(textarea).toHaveValue('');
    });

    it('does not call onSend when content is empty', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      await user.click(screen.getByRole('button', { name: /send/i }));

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('does not call onSend when content is only whitespace', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '   ');
      await user.click(screen.getByRole('button', { name: /send/i }));

      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('keyboard handling', () => {
    it('sends message on Enter key press', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world');
      await user.keyboard('{Enter}');

      expect(mockOnSend).toHaveBeenCalledWith('Hello world');
    });

    it('creates newline on Shift+Enter', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      await user.type(textarea, 'Line 2');

      expect(textarea).toHaveValue('Line 1\nLine 2');
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('clears input after Enter key send', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world');
      await user.keyboard('{Enter}');

      expect(textarea).toHaveValue('');
    });

    it('does not send on Enter when content is empty', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByRole('textbox');
      textarea.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('disables textarea when disabled prop is true', () => {
      render(<ChatInput onSend={mockOnSend} disabled />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disables send button when disabled prop is true', () => {
      render(<ChatInput onSend={mockOnSend} disabled />);

      expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    });

    it('disables send button when textarea is empty', () => {
      render(<ChatInput onSend={mockOnSend} />);

      expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    });

    it('enables send button when textarea has content', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      expect(screen.getByRole('button', { name: /send/i })).not.toBeDisabled();
    });

    it('does not call onSend when disabled even with content', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} disabled />);

      const textarea = screen.getByRole('textbox');
      // Force set value since textarea is disabled
      fireEvent.change(textarea, { target: { value: 'Hello' } });

      // Try to click the button
      await user.click(screen.getByRole('button', { name: /send/i }));

      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has accessible labels', () => {
      render(<ChatInput onSend={mockOnSend} />);

      expect(screen.getByRole('textbox')).toHaveAccessibleName();
      expect(screen.getByRole('button', { name: /send/i })).toHaveAccessibleName();
    });

    it('maintains focus on textarea after failed send attempt', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);

      const textarea = screen.getByRole('textbox');
      textarea.focus();
      await user.keyboard('{Enter}');

      expect(document.activeElement).toBe(textarea);
    });
  });
});
