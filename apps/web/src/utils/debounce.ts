/**
 * Debounce utility function
 *
 * Creates a debounced version of a function that delays execution
 * until after a specified delay has passed since the last invocation.
 */

/**
 * Type for a debounced function with control methods
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DebouncedFunction<T extends (...args: any[]) => any> {
  /** Call the debounced function */
  (...args: Parameters<T>): void;
  /** Cancel any pending execution */
  cancel: () => void;
  /** Immediately execute any pending call */
  flush: () => void;
  /** Check if there's a pending execution */
  pending: () => boolean;
}

/**
 * Creates a debounced version of the provided function
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function with cancel, flush, and pending methods
 *
 * @example
 * ```ts
 * const debouncedSave = debounce(save, 2500);
 * debouncedSave(data); // Will only execute after 2.5s of inactivity
 * debouncedSave.cancel(); // Cancel pending execution
 * debouncedSave.flush(); // Execute immediately if pending
 * debouncedSave.pending(); // Check if execution is pending
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingArgs: Parameters<T> | null = null;
  let pendingThis: unknown = null;

  const debounced = function (this: unknown, ...args: Parameters<T>): void {
    // Store the context and arguments for later execution
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    pendingThis = this;
    pendingArgs = args;

    // Clear any existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    timeoutId = setTimeout(() => {
      const thisArg = pendingThis;
      const callArgs = pendingArgs;

      // Clear state before calling the function
      timeoutId = null;
      pendingArgs = null;
      pendingThis = null;

      // Execute the function with stored context and arguments
      if (callArgs !== null) {
        fn.apply(thisArg, callArgs);
      }
    }, delay);
  } as DebouncedFunction<T>;

  /**
   * Cancel any pending execution
   */
  debounced.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingArgs = null;
    pendingThis = null;
  };

  /**
   * Immediately execute any pending call
   */
  debounced.flush = (): void => {
    if (timeoutId !== null && pendingArgs !== null) {
      const thisArg = pendingThis;
      const callArgs = pendingArgs;

      // Clear the timeout and state
      clearTimeout(timeoutId);
      timeoutId = null;
      pendingArgs = null;
      pendingThis = null;

      // Execute immediately
      fn.apply(thisArg, callArgs);
    }
  };

  /**
   * Check if there's a pending execution
   */
  debounced.pending = (): boolean => {
    return timeoutId !== null;
  };

  return debounced;
}
