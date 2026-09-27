import { useCallback, useRef, useState } from 'react';

/**
 * Wraps a mutation (save, delete, start…) with pending/error state.
 *
 *   const [save, { pending, error }] = useAsyncAction(learnerService.update);
 *   await save(id, values);   // returns the result, or undefined on failure
 */
export function useAsyncAction(action, { onSuccess, onError } = {}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const ref = useRef({ action, onSuccess, onError });
  ref.current = { action, onSuccess, onError };

  const run = useCallback(async (...args) => {
    setPending(true);
    setError(null);
    try {
      const result = await ref.current.action(...args);
      ref.current.onSuccess?.(result, ...args);
      return result;
    } catch (err) {
      setError(err);
      ref.current.onError?.(err, ...args);
      return undefined;
    } finally {
      setPending(false);
    }
  }, []);

  return [run, { pending, error, setError }];
}
