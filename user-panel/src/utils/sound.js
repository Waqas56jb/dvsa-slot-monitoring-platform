/**
 * Alert chime generated with the Web Audio API (no audio files, no autoplay).
 * Browsers only allow audio after a user gesture, so the context is unlocked on
 * the first interaction and playback is silently skipped until then.
 */
let ctx = null;
let unlocked = false;

function getContext() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function installAudioUnlock() {
  if (typeof window === 'undefined') return () => {};
  const unlock = () => {
    const c = getContext();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
    unlocked = true;
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  return () => {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
}

export const canPlaySound = () => unlocked;

/** Plays a short two-tone chime. Returns false when audio is not yet allowed. */
export function playAlertChime() {
  if (!unlocked) return false;
  const c = getContext();
  if (!c || c.state !== 'running') return false;
  const now = c.currentTime;
  [880, 1318.5].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = now + i * 0.16;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
  return true;
}
