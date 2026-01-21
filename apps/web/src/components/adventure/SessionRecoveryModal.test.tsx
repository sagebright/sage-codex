/**
 * SessionRecoveryModal Component Tests
 *
 * Tests for session recovery modal that appears on app load
 * when a previous session exists in localStorage.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionRecoveryModal } from './SessionRecoveryModal';
import * as adventureService from '../../services/adventureService';
import type { SessionMetadata } from '../../services/adventureService';

// Mock the adventure service
vi.mock('../../services/adventureService', () => ({
  checkSession: vi.fn(),
}));

const mockSessionMetadata: SessionMetadata = {
  sessionId: 'test-session-123',
  adventureName: 'The Hollow Vigil',
  currentPhase: 'dial-tuning',
  updatedAt: '2024-01-15T10:30:00.000Z',
  sceneCount: 3,
  npcCount: 5,
};

describe('SessionRecoveryModal', () => {
  const mockOnResume = vi.fn();
  const mockOnStartFresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows loading state initially while checking session', () => {
      // Mock a pending promise that never resolves
      vi.mocked(adventureService.checkSession).mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      expect(screen.getByText(/checking.*session/i)).toBeInTheDocument();
    });
  });

  describe('session not found in Supabase', () => {
    it('calls onStartFresh when session does not exist in Supabase', async () => {
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: false,
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        expect(mockOnStartFresh).toHaveBeenCalled();
      });
    });
  });

  describe('session exists in Supabase', () => {
    it('displays session metadata when session exists', async () => {
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: true,
        metadata: mockSessionMetadata,
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('The Hollow Vigil')).toBeInTheDocument();
      });

      // Check phase is displayed (human-readable)
      expect(screen.getByText(/dial.*tuning/i)).toBeInTheDocument();

      // Check scene count is displayed
      expect(screen.getByText(/3.*scene/i)).toBeInTheDocument();

      // Check NPC count is displayed
      expect(screen.getByText(/5.*npc/i)).toBeInTheDocument();
    });

    it('displays formatted last saved time', async () => {
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: true,
        metadata: mockSessionMetadata,
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        // Check that a formatted date is shown (contains the date or relative time)
        expect(screen.getByText(/last saved/i)).toBeInTheDocument();
      });
    });

    it('shows Resume and Start Fresh buttons', async () => {
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: true,
        metadata: mockSessionMetadata,
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /start fresh/i })).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onResume when Resume button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: true,
        metadata: mockSessionMetadata,
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /resume/i }));

      expect(mockOnResume).toHaveBeenCalled();
    });

    it('calls onStartFresh when Start Fresh button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: true,
        metadata: mockSessionMetadata,
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start fresh/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /start fresh/i }));

      expect(mockOnStartFresh).toHaveBeenCalled();
    });
  });

  describe('error state', () => {
    it('shows error message when API fails', async () => {
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: false,
        error: 'Network error',
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows Start Fresh fallback button when error occurs', async () => {
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: false,
        error: 'Network error',
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start fresh/i })).toBeInTheDocument();
      });
    });

    it('calls onStartFresh when clicking Start Fresh in error state', async () => {
      const user = userEvent.setup();
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: false,
        error: 'Network error',
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start fresh/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /start fresh/i }));

      expect(mockOnStartFresh).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has accessible modal role', async () => {
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: true,
        metadata: mockSessionMetadata,
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('has accessible heading', async () => {
      vi.mocked(adventureService.checkSession).mockResolvedValue({
        exists: true,
        metadata: mockSessionMetadata,
      });

      render(
        <SessionRecoveryModal
          sessionId="test-session-123"
          onResume={mockOnResume}
          onStartFresh={mockOnStartFresh}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /previous session/i })).toBeInTheDocument();
      });
    });
  });
});
