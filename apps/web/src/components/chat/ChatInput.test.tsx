/**
 * Tests for ChatInput component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('renders textarea with placeholder', () => {
    render(<ChatInput onSubmit={vi.fn()} />);

    const textarea = screen.getByLabelText('Chat message input');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute(
      'placeholder',
      'What path shall we take?'
    );
  });

  it('accepts custom placeholder', () => {
    render(
      <ChatInput onSubmit={vi.fn()} placeholder="Share your vision..." />
    );

    const textarea = screen.getByLabelText('Chat message input');
    expect(textarea).toHaveAttribute('placeholder', 'Share your vision...');
  });

  it('disables textarea and button when isDisabled is true', () => {
    render(<ChatInput onSubmit={vi.fn()} isDisabled={true} />);

    const textarea = screen.getByLabelText('Chat message input');
    expect(textarea).toBeDisabled();
  });

  it('calls onSubmit with trimmed value on form submit', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<ChatInput onSubmit={handleSubmit} />);

    const textarea = screen.getByLabelText('Chat message input');
    await user.type(textarea, 'My adventure idea');

    // Submit the form by pressing Enter
    await user.keyboard('{Enter}');

    expect(handleSubmit).toHaveBeenCalledWith('My adventure idea');
  });

  it('does not submit empty messages', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<ChatInput onSubmit={handleSubmit} />);

    const textarea = screen.getByLabelText('Chat message input');
    await user.click(textarea);
    await user.keyboard('{Enter}');

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('clears input after successful submit', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<ChatInput onSubmit={handleSubmit} />);

    const textarea = screen.getByLabelText('Chat message input');
    await user.type(textarea, 'Hello');
    await user.keyboard('{Enter}');

    expect(textarea).toHaveValue('');
  });

  it('allows Shift+Enter for newlines', async () => {
    const handleSubmit = vi.fn();

    render(<ChatInput onSubmit={handleSubmit} />);

    const textarea = screen.getByLabelText('Chat message input');
    // Simulate Shift+Enter
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
