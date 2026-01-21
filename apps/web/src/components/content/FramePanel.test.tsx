/**
 * FramePanel Component Tests
 *
 * Tests for frame selection panel
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FramePanel } from './FramePanel';
import { useContentStore } from '../../stores/contentStore';
import type { DaggerheartFrame } from '@dagger-app/shared-types';

// Mock the store
vi.mock('../../stores/contentStore', () => ({
  useContentStore: vi.fn(),
  selectHasSelectedFrame: vi.fn(),
  selectIsFrameConfirmed: vi.fn(),
  selectCanProceedToOutline: vi.fn(),
}));

const mockFrames: DaggerheartFrame[] = [
  {
    id: 'frame-1',
    name: 'The Dark Forest',
    description: 'A mysterious forest full of danger',
    themes: ['mystery', 'horror'],
    typical_adversaries: ['beasts', 'undead'],
    lore: 'Ancient evil lurks',
    source_book: 'Core Rulebook',
    embedding: null,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'frame-2',
    name: 'City of Shadows',
    description: 'A sprawling city with criminal underbelly',
    themes: ['urban', 'political'],
    typical_adversaries: ['humanoid', 'demons'],
    lore: 'Factions vie for control',
    source_book: 'Core Rulebook',
    embedding: null,
    created_at: '2024-01-01T00:00:00.000Z',
  },
];

describe('FramePanel', () => {
  const mockOnCreateCustom = vi.fn();
  const mockOnContinueToOutline = vi.fn();
  const mockSelectFrame = vi.fn();
  const mockConfirmFrame = vi.fn();
  const mockClearFrame = vi.fn();
  const mockSetAvailableFrames = vi.fn();
  const mockSetFramesLoading = vi.fn();
  const mockSetFramesError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(useContentStore).mockImplementation((selector) => {
      const state = {
        availableFrames: mockFrames,
        selectedFrame: null,
        framesLoading: false,
        framesError: null,
        selectFrame: mockSelectFrame,
        confirmFrame: mockConfirmFrame,
        clearFrame: mockClearFrame,
        setAvailableFrames: mockSetAvailableFrames,
        setFramesLoading: mockSetFramesLoading,
        setFramesError: mockSetFramesError,
      };

      if (typeof selector === 'function') {
        return selector(state as unknown as Parameters<typeof selector>[0]);
      }
      return state;
    });
  });

  describe('rendering', () => {
    it('renders header', () => {
      render(
        <FramePanel
          onCreateCustom={mockOnCreateCustom}
          onContinueToOutline={mockOnContinueToOutline}
        />
      );

      expect(screen.getByText('Select a Frame')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(
        <FramePanel
          onCreateCustom={mockOnCreateCustom}
          onContinueToOutline={mockOnContinueToOutline}
        />
      );

      expect(screen.getByPlaceholderText('Search frames...')).toBeInTheDocument();
    });

    it('renders Create Custom button', () => {
      render(
        <FramePanel
          onCreateCustom={mockOnCreateCustom}
          onContinueToOutline={mockOnContinueToOutline}
        />
      );

      expect(screen.getByText('+ Create Custom')).toBeInTheDocument();
    });

    it('renders frame cards', () => {
      render(
        <FramePanel
          onCreateCustom={mockOnCreateCustom}
          onContinueToOutline={mockOnContinueToOutline}
        />
      );

      expect(screen.getByText('The Dark Forest')).toBeInTheDocument();
      expect(screen.getByText('City of Shadows')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading spinner when loading', () => {
      vi.mocked(useContentStore).mockImplementation((selector) => {
        const state = {
          availableFrames: [],
          selectedFrame: null,
          framesLoading: true,
          framesError: null,
          selectFrame: mockSelectFrame,
          confirmFrame: mockConfirmFrame,
          clearFrame: mockClearFrame,
          setAvailableFrames: mockSetAvailableFrames,
          setFramesLoading: mockSetFramesLoading,
          setFramesError: mockSetFramesError,
        };

        if (typeof selector === 'function') {
          return selector(state as unknown as Parameters<typeof selector>[0]);
        }
        return state;
      });

      render(
        <FramePanel
          onCreateCustom={mockOnCreateCustom}
          onContinueToOutline={mockOnContinueToOutline}
        />
      );

      expect(screen.getByText('Loading frames...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when there is an error', () => {
      vi.mocked(useContentStore).mockImplementation((selector) => {
        const state = {
          availableFrames: [],
          selectedFrame: null,
          framesLoading: false,
          framesError: 'Failed to load frames',
          selectFrame: mockSelectFrame,
          confirmFrame: mockConfirmFrame,
          clearFrame: mockClearFrame,
          setAvailableFrames: mockSetAvailableFrames,
          setFramesLoading: mockSetFramesLoading,
          setFramesError: mockSetFramesError,
        };

        if (typeof selector === 'function') {
          return selector(state as unknown as Parameters<typeof selector>[0]);
        }
        return state;
      });

      render(
        <FramePanel
          onCreateCustom={mockOnCreateCustom}
          onContinueToOutline={mockOnContinueToOutline}
        />
      );

      expect(screen.getByText('Failed to load frames')).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('filters frames by search query', async () => {
      const user = userEvent.setup();
      render(
        <FramePanel
          onCreateCustom={mockOnCreateCustom}
          onContinueToOutline={mockOnContinueToOutline}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search frames...');
      await user.type(searchInput, 'Dark');

      expect(screen.getByText('The Dark Forest')).toBeInTheDocument();
      expect(screen.queryByText('City of Shadows')).not.toBeInTheDocument();
    });

    it('shows no results message when search matches nothing', async () => {
      const user = userEvent.setup();
      render(
        <FramePanel
          onCreateCustom={mockOnCreateCustom}
          onContinueToOutline={mockOnContinueToOutline}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search frames...');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText('No frames match your search')).toBeInTheDocument();
    });
  });

  describe('create custom', () => {
    it('calls onCreateCustom when Create Custom button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <FramePanel
          onCreateCustom={mockOnCreateCustom}
          onContinueToOutline={mockOnContinueToOutline}
        />
      );

      await user.click(screen.getByText('+ Create Custom'));

      expect(mockOnCreateCustom).toHaveBeenCalled();
    });
  });

  // Note: Frame selection display is tested via integration tests
  // The Zustand selector pattern makes unit testing with mocks complex
});
