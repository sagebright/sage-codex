/**
 * DialSummaryPanel Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialSummaryPanel } from './DialSummaryPanel';
import type { DialsState } from '../../stores/dialsStore';

describe('DialSummaryPanel', () => {
  const mockDials: DialsState = {
    partySize: 4,
    partyTier: 2,
    sceneCount: 4,
    sessionLength: '3-4 hours',
    tone: 'grim',
    pillarBalance: { primary: 'combat', secondary: 'exploration', tertiary: 'social' },
    npcDensity: null,
    lethality: null,
    emotionalRegister: null,
    themes: ['redemption', 'sacrifice'],
    confirmedDials: new Set(['partySize', 'partyTier', 'tone']),
    setDial: vi.fn(),
    confirmDial: vi.fn(),
    unconfirmDial: vi.fn(),
    resetDials: vi.fn(),
    resetDial: vi.fn(),
    addTheme: vi.fn(),
    removeTheme: vi.fn(),
  };

  const defaultProps = {
    dials: mockDials,
    onConfirmToggle: vi.fn(),
    onContinue: vi.fn(),
    renderSelector: vi.fn(() => <div data-testid="selector-widget">Selector</div>),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the panel with title', () => {
    render(<DialSummaryPanel {...defaultProps} />);
    expect(screen.getByText('Adventure Dials')).toBeInTheDocument();
  });

  it('renders progress bar showing dial configuration progress', () => {
    render(<DialSummaryPanel {...defaultProps} />);
    // 3 confirmed out of 10 total dials
    expect(screen.getByText('3 of 10 configured')).toBeInTheDocument();
  });

  it('renders Concrete section header', () => {
    render(<DialSummaryPanel {...defaultProps} />);
    expect(screen.getByText('Concrete')).toBeInTheDocument();
  });

  it('renders Conceptual section header', () => {
    render(<DialSummaryPanel {...defaultProps} />);
    expect(screen.getByText('Conceptual')).toBeInTheDocument();
  });

  it('renders all concrete dials', () => {
    render(<DialSummaryPanel {...defaultProps} />);
    expect(screen.getByText('Party Size')).toBeInTheDocument();
    expect(screen.getByText('Party Tier')).toBeInTheDocument();
    expect(screen.getByText('Scene Count')).toBeInTheDocument();
    expect(screen.getByText('Session Length')).toBeInTheDocument();
  });

  it('renders all conceptual dials', () => {
    render(<DialSummaryPanel {...defaultProps} />);
    expect(screen.getByText('Tone')).toBeInTheDocument();
    expect(screen.getByText('Pillar Balance')).toBeInTheDocument();
    expect(screen.getByText('NPC Density')).toBeInTheDocument();
    expect(screen.getByText('Lethality')).toBeInTheDocument();
    expect(screen.getByText('Emotional Register')).toBeInTheDocument();
    expect(screen.getByText('Themes')).toBeInTheDocument();
  });

  it('renders selector widgets for all dials', () => {
    render(<DialSummaryPanel {...defaultProps} />);
    // Should have 10 selector widgets (4 concrete + 6 conceptual)
    const selectorWidgets = screen.getAllByTestId('selector-widget');
    expect(selectorWidgets).toHaveLength(10);
  });

  it('calls renderSelector with correct dialId for each dial', () => {
    const renderSelector = vi.fn(() => <div data-testid="selector-widget">Selector</div>);
    render(<DialSummaryPanel {...defaultProps} renderSelector={renderSelector} />);

    // Verify renderSelector was called for all dials
    expect(renderSelector).toHaveBeenCalledWith('partySize');
    expect(renderSelector).toHaveBeenCalledWith('partyTier');
    expect(renderSelector).toHaveBeenCalledWith('sceneCount');
    expect(renderSelector).toHaveBeenCalledWith('sessionLength');
    expect(renderSelector).toHaveBeenCalledWith('tone');
    expect(renderSelector).toHaveBeenCalledWith('pillarBalance');
    expect(renderSelector).toHaveBeenCalledWith('npcDensity');
    expect(renderSelector).toHaveBeenCalledWith('lethality');
    expect(renderSelector).toHaveBeenCalledWith('emotionalRegister');
    expect(renderSelector).toHaveBeenCalledWith('themes');
  });

  it('calls onConfirmToggle when checkmark is clicked', () => {
    const onConfirmToggle = vi.fn();
    render(<DialSummaryPanel {...defaultProps} onConfirmToggle={onConfirmToggle} />);

    // Find the first checkmark button and click it
    const checkmarks = screen.getAllByRole('button', { pressed: false });
    // Filter to only checkmarks (not section toggles)
    const dialCheckmarks = checkmarks.filter((btn) =>
      btn.getAttribute('aria-label')?.includes('Confirm')
    );
    if (dialCheckmarks.length > 0) {
      fireEvent.click(dialCheckmarks[0]);
      expect(onConfirmToggle).toHaveBeenCalled();
    }
  });

  it('does not render Continue button when not all dials are confirmed', () => {
    render(<DialSummaryPanel {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /continue to frame/i })).not.toBeInTheDocument();
  });

  it('renders Continue button when all dials are confirmed', () => {
    const allConfirmedDials: DialsState = {
      ...mockDials,
      confirmedDials: new Set([
        'partySize',
        'partyTier',
        'sceneCount',
        'sessionLength',
        'tone',
        'pillarBalance',
        'npcDensity',
        'lethality',
        'emotionalRegister',
        'themes',
      ]),
    };
    render(<DialSummaryPanel {...defaultProps} dials={allConfirmedDials} />);
    expect(screen.getByRole('button', { name: /continue to frame/i })).toBeInTheDocument();
  });

  it('calls onContinue when Continue button is clicked', () => {
    const onContinue = vi.fn();
    const allConfirmedDials: DialsState = {
      ...mockDials,
      confirmedDials: new Set([
        'partySize',
        'partyTier',
        'sceneCount',
        'sessionLength',
        'tone',
        'pillarBalance',
        'npcDensity',
        'lethality',
        'emotionalRegister',
        'themes',
      ]),
    };
    render(<DialSummaryPanel {...defaultProps} dials={allConfirmedDials} onContinue={onContinue} />);

    fireEvent.click(screen.getByRole('button', { name: /continue to frame/i }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<DialSummaryPanel {...defaultProps} className="custom-class" />);
    const panel = screen.getByTestId('dial-summary-panel');
    expect(panel).toHaveClass('custom-class');
  });

  it('can collapse and expand Concrete section', () => {
    render(<DialSummaryPanel {...defaultProps} />);

    // Find the Concrete section toggle button
    const concreteToggle = screen.getByRole('button', { name: /concrete/i });

    // Initially expanded
    expect(concreteToggle).toHaveAttribute('aria-expanded', 'true');

    // Click to collapse
    fireEvent.click(concreteToggle);
    expect(concreteToggle).toHaveAttribute('aria-expanded', 'false');

    // Click to expand again
    fireEvent.click(concreteToggle);
    expect(concreteToggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('can collapse and expand Conceptual section', () => {
    render(<DialSummaryPanel {...defaultProps} />);

    const conceptualToggle = screen.getByRole('button', { name: /conceptual/i });

    // Initially expanded
    expect(conceptualToggle).toHaveAttribute('aria-expanded', 'true');

    // Click to collapse
    fireEvent.click(conceptualToggle);
    expect(conceptualToggle).toHaveAttribute('aria-expanded', 'false');
  });
});
