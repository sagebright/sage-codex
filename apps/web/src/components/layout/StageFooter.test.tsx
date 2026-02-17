/**
 * Tests for StageFooter component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { StageFooter } from './StageFooter';

describe('StageFooter', () => {
  it('renders the label', () => {
    render(
      <StageFooter label="Continue to Attuning" isReady={false} onAdvance={vi.fn()} />
    );

    expect(screen.getByText('Continue to Attuning')).toBeInTheDocument();
  });

  it('is disabled when not ready', () => {
    render(
      <StageFooter label="Continue" isReady={false} onAdvance={vi.fn()} />
    );

    expect(screen.getByText('Continue')).toBeDisabled();
  });

  it('is enabled when ready', () => {
    render(
      <StageFooter label="Continue" isReady={true} onAdvance={vi.fn()} />
    );

    expect(screen.getByText('Continue')).not.toBeDisabled();
  });

  it('calls onAdvance when clicked', async () => {
    const handleAdvance = vi.fn();
    const user = userEvent.setup();

    render(
      <StageFooter label="Continue" isReady={true} onAdvance={handleAdvance} />
    );

    await user.click(screen.getByText('Continue'));
    expect(handleAdvance).toHaveBeenCalledOnce();
  });

  it('does not call onAdvance when disabled', async () => {
    const handleAdvance = vi.fn();
    const user = userEvent.setup();

    render(
      <StageFooter label="Continue" isReady={false} onAdvance={handleAdvance} />
    );

    await user.click(screen.getByText('Continue'));
    expect(handleAdvance).not.toHaveBeenCalled();
  });
});
