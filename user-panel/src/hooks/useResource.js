import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribe } from '@/services/realtime';

/**
 * Loads data from a service function and keeps it fresh.
 *
 *   const { data, loading, error, reload } = useResource(
 *     () => learnerService.list({ search, status }),
 *     [search, status],
 *     { topics: ['learners'] },
 *   );
 *
 * - `loading` is true only for the first load / when deps change.
 * - Realtime `topics` trigger a silent background refresh (no skeleton flash).
 * - Stale responses from earlier deps are ignored.
 */
export function useResource(fetcher, deps = [], { topics = [], initialData = null, enabled = true } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await fetcherRef.current();
      if (id === requestId.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (id === requestId.current) setError(err);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  const topicKey = topics.join('|');
  useEffect(() => {
    if (!enabled || !topicKey) return undefined;
    let timer;
    const unsub = subscribe(topicKey.split('|'), () => {
      clearTimeout(timer);
      timer = setTimeout(() => run({ silent: true }), 120);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [enabled, topicKey, run]);

  return { data, setData, loading, error, reload: run };
}
