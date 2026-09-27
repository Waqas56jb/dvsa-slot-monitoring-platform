/**
 * FRONTEND-ONLY monitoring simulation.
 *
 * Produces realistic-looking check events and occasional matches so the UI
 * can be demonstrated end-to-end. It does not contact any external service.
 * In production, monitoring runs in a backend worker and the UI receives
 * events over a realtime channel instead of calling `tick()`.
 */
import { monitoringService } from './monitoringService';
import { slotService } from './slotService';
import { requireUserId } from './session';
import { getCentreName } from './centreService';
import { SIMULATION } from '@/config/app';
import { createId } from '@/utils/id';
import { addDays, toISODate } from '@/utils/format';

const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

function pickSlotFor(criteria) {
  const today = new Date();
  const from = criteria.dateFrom ? new Date(`${criteria.dateFrom}T00:00:00`) : addDays(today, 7);
  const to = criteria.dateTo ? new Date(`${criteria.dateTo}T00:00:00`) : addDays(from, 30);
  const span = Math.max(0, Math.round((to - from) / 86400000));
  let date = addDays(from < today ? today : from, randInt(0, Math.max(0, span)));
  if (date.getDay() === 0) date = addDays(date, 1);

  const [fh, fm] = (criteria.timeFrom || '08:00').split(':').map(Number);
  const [th, tm] = (criteria.timeTo || '16:00').split(':').map(Number);
  const startMin = fh * 60 + fm;
  const endMin = Math.max(startMin + 15, th * 60 + tm - 15);
  const minute = randInt(startMin, endMin);
  const time = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
  return { date: toISODate(date), time };
}

export function createSimulator() {
  let tickCount = 0;
  let cursor = 0;
  let nextMatchAt = SIMULATION.firstMatchAfterTicks;

  return {
    /**
     * Advances the simulation one step.
     * Returns { events: [{ id, at, kind, message }], slot? }
     */
    tick({ forceMatch = false } = {}) {
      requireUserId();
      const targets = monitoringService.getActiveTargets();
      if (!targets.length) return { events: [] };

      tickCount++;
      if (forceMatch) nextMatchAt = tickCount;
      const target = targets[cursor % targets.length];
      cursor++;
      const centre = getCentreName(target.centreId);
      const now = Date.now();
      const events = [
        { id: createId('evt'), at: new Date(now).toISOString(), kind: 'check', message: `Checking ${centre} for ${target.learnerName}…` },
      ];
      monitoringService.recordCheck([...new Set(targets.map((t) => t.sessionId))]);

      if (tickCount >= nextMatchAt) {
        const [lo, hi] = SIMULATION.matchEveryTicks;
        nextMatchAt = tickCount + randInt(lo, hi);
        const { date, time } = pickSlotFor(target.criteria);
        const slot = slotService.recordDetected(requireUserId(), {
          sessionId: target.sessionId,
          learnerId: target.learnerId,
          centreId: target.centreId,
          date,
          time,
          matchScore: randInt(86, 99),
        });
        events.push({ id: createId('evt'), at: new Date(now + 1200).toISOString(), kind: 'match', message: `Matching slot detected at ${centre}`, slotId: slot.id });
        return { events, slot };
      }

      events.push({
        id: createId('evt'),
        at: new Date(now + 1200).toISOString(),
        kind: 'clear',
        message: Math.random() < 0.3 ? `No matching slot · checking next centre…` : `No matching slot at ${centre}`,
      });
      return { events };
    },
  };
}
