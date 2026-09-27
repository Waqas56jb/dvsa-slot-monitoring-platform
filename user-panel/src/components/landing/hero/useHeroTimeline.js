import { useEffect, useRef, useState } from 'react';

/**
 * Detection loop shared by the 3D scene (via ref, no re-renders) and the DOM
 * overlay (via state): scan → detect → alert, then the next centre.
 */
const PHASES = [
  ['scan', 1900],
  ['detect', 1000],
  ['alert', 2900],
];

export function useHeroTimeline(count, running = true) {
  const ref = useRef({ index: 0, phase: 'scan' });
  const [state, setState] = useState(ref.current);

  useEffect(() => {
    if (!running) return undefined;
    let phaseIdx = PHASES.findIndex(([p]) => p === ref.current.phase);
    let timer;
    const step = () => {
      timer = setTimeout(() => {
        phaseIdx = (phaseIdx + 1) % PHASES.length;
        const index = phaseIdx === 0 ? (ref.current.index + 1) % count : ref.current.index;
        ref.current = { index, phase: PHASES[phaseIdx][0], at: Date.now() };
        setState(ref.current);
        step();
      }, PHASES[phaseIdx][1]);
    };
    step();
    return () => clearTimeout(timer);
  }, [count, running]);

  return { ref, state };
}
