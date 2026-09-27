/**
 * Test-centre directory.
 * Future: GET /centres?search=&region= (served from Supabase via the API).
 */
import { centres, centreRegions } from '@/data/centres';
import { delay, clone } from './mockDb';

const byId = new Map(centres.map((c) => [c.id, c]));

export const getCentreSync = (id) => byId.get(id) || null;
export const getCentreName = (id) => byId.get(id)?.name ?? 'Unknown centre';

export const centreService = {
  async list({ search = '', region = '' } = {}) {
    await delay(80, 180);
    const q = search.trim().toLowerCase();
    return clone(
      centres.filter(
        (c) =>
          (!region || c.region === region) &&
          (!q || c.name.toLowerCase().includes(q) || c.area.toLowerCase().includes(q) || c.postcode.toLowerCase().startsWith(q)),
      ),
    );
  },
  async get(id) {
    await delay(60, 120);
    return clone(byId.get(id) || null);
  },
  /** Synchronous access for selectors and pickers (static reference data). */
  all: () => centres,
  regions: () => centreRegions,
};
