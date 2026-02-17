/**
 * Tests for MessageBubble component
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  it('renders user messages with content', () => {
    render(<MessageBubble role="user" content="Hello Sage" />);

    expect(screen.getByText('Hello Sage')).toBeInTheDocument();
  });

  it('renders assistant messages with Sage label', () => {
    render(
      <MessageBubble role="assistant" content="Welcome, storyteller." />
    );

    expect(screen.getByText('Sage')).toBeInTheDocument();
    expect(screen.getByText('Welcome, storyteller.')).toBeInTheDocument();
  });

  it('shows streaming cursor on assistant messages when streaming', () => {
    const { container } = render(
      <MessageBubble role="assistant" content="Streaming..." isStreaming={true} />
    );

    const cursor = container.querySelector('.streaming-cursor');
    expect(cursor).toBeInTheDocument();
  });

  it('does not show Sage label on user messages', () => {
    render(<MessageBubble role="user" content="Test" />);

    expect(screen.queryByText('Sage')).not.toBeInTheDocument();
  });
});
