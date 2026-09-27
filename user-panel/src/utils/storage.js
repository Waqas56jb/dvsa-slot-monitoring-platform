/** Safe web-storage wrapper — never throws (private mode, blocked storage). */
const PREFIX = 'sp.';

function read(area, key, fallback) {
  try {
    const raw = window[area].getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(area, key, value) {
  try {
    window[area].setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable — state stays in memory only */
  }
}

function remove(area, key) {
  try {
    window[area].removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

export const storage = {
  get: (key, fallback = null) => read('localStorage', key, fallback),
  set: (key, value) => write('localStorage', key, value),
  remove: (key) => remove('localStorage', key),
  getSession: (key, fallback = null) => read('sessionStorage', key, fallback),
  setSession: (key, value) => write('sessionStorage', key, value),
  removeSession: (key) => remove('sessionStorage', key),
};
