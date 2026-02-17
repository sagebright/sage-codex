/**
 * Tests for StreamingText component
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StreamingText } from './StreamingText';

describe('StreamingText', () => {
  it('renders content as paragraphs', () => {
    render(
      <StreamingText content={"First paragraph.\n\nSecond paragraph."} isStreaming={false} />
    );

    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();
  });

  it('shows streaming cursor when streaming', () => {
    const { container } = render(
      <StreamingText content="Hello world" isStreaming={true} />
    );

    const cursor = container.querySelector('.streaming-cursor');
    expect(cursor).toBeInTheDocument();
  });

  it('hides streaming cursor when not streaming', () => {
    const { container } = render(
      <StreamingText content="Hello world" isStreaming={false} />
    );

    const cursor = container.querySelector('.streaming-cursor');
    expect(cursor).not.toBeInTheDocument();
  });

  it('shows cursor only on empty content when streaming', () => {
    const { container } = render(
      <StreamingText content="" isStreaming={true} />
    );

    const cursor = container.querySelector('.streaming-cursor');
    expect(cursor).toBeInTheDocument();
  });

  it('renders nothing for empty content when not streaming', () => {
    const { container } = render(
      <StreamingText content="" isStreaming={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('splits on double newlines but not single newlines', () => {
    const { container } = render(
      <StreamingText
        content={"Line one\nLine two\n\nNew paragraph"}
        isStreaming={false}
      />
    );

    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
  });
});
