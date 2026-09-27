import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { monitoringService } from '@/services/monitoringService';
import { userService } from '@/services/userService';
import { createSimulator } from '@/services/monitoringSimulator';
import { subscribe } from '@/services/realtime';
import { useToast } from '@/context/ToastContext';
import { SIMULATION } from '@/config/app';
import { installAudioUnlock, playAlertChime } from '@/utils/sound';
import { showBrowserNotification } from '@/utils/browserNotifications';
import { formatDate, formatTimeString } from '@/utils/format';

const MonitoringContext = createContext(null);
const MAX_EVENTS = 40;

/**
 * Live monitoring state for the authenticated app.
 *
 * Today it drives a frontend-only simulation (clearly labelled in the UI).
 * When the backend exists, replace the interval + simulator with a realtime
 * subscription to server-side monitoring events — consumers keep the same API.
 */
export function MonitoringProvider({ children }) {
  const toast = useToast();
  const [overview, setOverview] = useState(() => {
    try {
      return monitoringService.getOverviewSync();
    } catch {
      return null;
    }
  });
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [busy, setBusy] = useState(null);
  const simulator = useRef(null);
  const timeouts = useRef(new Set());

  if (!simulator.current) simulator.current = createSimulator();

  const refresh = useCallback(() => {
    try {
      setOverview(monitoringService.getOverviewSync());
    } catch {
      /* signed out */
    }
  }, []);

  useEffect(() => subscribe('monitoring', refresh), [refresh]);
  useEffect(() => installAudioUnlock(), []);
  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  const later = useCallback((fn, ms) => {
    const t = setTimeout(() => {
      timeouts.current.delete(t);
      fn();
    }, ms);
    timeouts.current.add(t);
  }, []);

  const announce = useCallback((slot) => {
    const prefs = userService.getPreferencesSync().notifications;
    if (prefs.dashboard !== false) setAlerts((list) => [slot, ...list.filter((a) => a.id !== slot.id)].slice(0, 3));
    if (prefs.sound) playAlertChime();
    if (prefs.browser) {
      showBrowserNotification('New Slot Found', {
        body: `${slot.centre?.name} · ${formatDate(slot.date)} · ${formatTimeString(slot.time)}`,
        tag: slot.id,
      });
    }
  }, []);

  const runTick = useCallback(
    (opts) => {
      let result;
      try {
        result = simulator.current.tick(opts);
      } catch {
        return;
      }
      const [first, ...rest] = result.events;
      if (first) setEvents((list) => [first, ...list].slice(0, MAX_EVENTS));
      rest.forEach((evt) =>
        later(() => {
          setEvents((list) => [evt, ...list].slice(0, MAX_EVENTS));
          if (evt.kind === 'match' && result.slot) announce(result.slot);
        }, 1200),
      );
    },
    [later, announce],
  );

  const isActive = overview?.status === 'active';
  useEffect(() => {
    if (!isActive) return undefined;
    const t = setInterval(() => runTick(), SIMULATION.tickMs);
    return () => clearInterval(t);
  }, [isActive, runTick]);

  const control = useCallback(
    async (kind) => {
      const fn = { start: monitoringService.startAll, pause: monitoringService.pauseAll, stop: monitoringService.stopAll }[kind];
      setBusy(kind);
      try {
        const next = await fn();
        setOverview(next);
        const msg = { start: 'Monitoring started', pause: 'Monitoring paused', stop: 'Monitoring stopped' }[kind];
        toast.success(msg, {
          description: kind === 'start' ? 'We will alert you as soon as a matching slot appears.' : 'Your preferences are saved — resume at any time.',
        });
        if (kind !== 'start') setEvents((list) => [{ id: `evt_${Date.now()}`, at: new Date().toISOString(), kind: 'system', message: msg }, ...list].slice(0, MAX_EVENTS));
        return next;
      } catch (err) {
        toast.error('Could not update monitoring', { description: err.message });
        return null;
      } finally {
        setBusy(null);
      }
    },
    [toast],
  );

  const dismissAlert = useCallback((id) => setAlerts((list) => list.filter((a) => a.id !== id)), []);

  /** Demo helper: force the next check to find a match. */
  const simulateMatch = useCallback(() => {
    if (!isActive) {
      toast.warning('Monitoring is not active', { description: 'Start monitoring to run a simulated check.' });
      return;
    }
    runTick({ forceMatch: true });
  }, [isActive, runTick, toast]);

  const value = useMemo(
    () => ({
      overview,
      status: overview?.status ?? 'stopped',
      isActive,
      events,
      alerts,
      busy,
      start: () => control('start'),
      pause: () => control('pause'),
      stop: () => control('stop'),
      refresh,
      dismissAlert,
      simulateMatch,
    }),
    [overview, isActive, events, alerts, busy, control, refresh, dismissAlert, simulateMatch],
  );

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export function useMonitoring() {
  const ctx = useContext(MonitoringContext);
  if (!ctx) throw new Error('useMonitoring must be used inside MonitoringProvider');
  return ctx;
}
