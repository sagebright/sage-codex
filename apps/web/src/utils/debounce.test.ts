/**
 * Tests for debounce utility
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, DebouncedFunction } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('basic functionality', () => {
    it('delays function execution', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(99);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('calls with correct arguments', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg1', 'arg2');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('cancels previous calls on new invocations', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('first');
      vi.advanceTimersByTime(50);
      debouncedFn('second');
      vi.advanceTimersByTime(50);
      debouncedFn('third');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });

    it('calls function multiple times after delays', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('first');
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenLastCalledWith('first');

      debouncedFn('second');
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenLastCalledWith('second');
    });
  });

  describe('cancel method', () => {
    it('cancels pending execution', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      vi.advanceTimersByTime(50);
      debouncedFn.cancel();
      vi.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();
    });

    it('allows new calls after cancel', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('first');
      debouncedFn.cancel();
      debouncedFn('second');
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('second');
    });
  });

  describe('flush method', () => {
    it('immediately executes pending function', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg');
      debouncedFn.flush();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('arg');
    });

    it('does not call function again after flush', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('arg');
      debouncedFn.flush();
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('does nothing if no pending call', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn.flush();
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('pending method', () => {
    it('returns true when call is pending', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      expect(debouncedFn.pending()).toBe(false);
      debouncedFn();
      expect(debouncedFn.pending()).toBe(true);
    });

    it('returns false after delay completes', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      vi.advanceTimersByTime(100);
      expect(debouncedFn.pending()).toBe(false);
    });

    it('returns false after cancel', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn.cancel();
      expect(debouncedFn.pending()).toBe(false);
    });

    it('returns false after flush', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn.flush();
      expect(debouncedFn.pending()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles zero delay', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 0);

      debouncedFn('arg');
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(0);
      expect(fn).toHaveBeenCalledWith('arg');
    });

    it('handles async functions', async () => {
      const fn = vi.fn().mockResolvedValue('result');
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('preserves this context', () => {
      const obj = {
        value: 42,
        fn: vi.fn(function (this: { value: number }) {
          return this.value;
        }),
      };
      const debouncedFn = debounce(obj.fn, 100);

      debouncedFn.call(obj);
      vi.advanceTimersByTime(100);

      expect(obj.fn).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('infers correct parameter types', () => {
      const fn = (a: string, b: number) => `${a}${b}`;
      const debouncedFn: DebouncedFunction<typeof fn> = debounce(fn, 100);

      // This should compile without errors
      debouncedFn('test', 123);
      vi.advanceTimersByTime(100);
    });
  });
});
