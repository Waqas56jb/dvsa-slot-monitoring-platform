import { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hero WebGL scene — a night-time "digital twin" of a city being monitored:
 * roads with flowing traffic, a learner car on its route, a radar sweep and
 * test-centre beacons. `timeline` is a ref shared with the DOM overlay:
 *   timeline.current = { index, phase: 'scan' | 'detect' | 'alert' }
 * so the beacon that lights up matches the alert card on screen.
 *
 * Purely decorative (aria-hidden by the parent). Lazy-loaded.
 */

const BRAND = new THREE.Color('#5b7cff');
const GREEN = new THREE.Color('#34d399');
const NIGHT = '#070b14';

// Road network (x/z on the ground plane)
const ROUTES = [
  { closed: true, pts: [[-6.5, 2.2], [-3.4, -0.6], [-0.4, 0.8], [2.6, -1.8], [6.2, -0.6], [5.2, 2.8], [1.2, 3.6], [-3.2, 4.4]] },
  { closed: false, pts: [[-9, -3.4], [-4, -2.6], [0.2, -3.2], [4.8, -3.6], [9.5, -2.8]] },
  { closed: false, pts: [[-1.6, 7], [-0.9, 3.4], [0.6, 0], [0.2, -3.4], [1.4, -7]] },
];

export const BEACONS = [[-3.4, -0.6], [2.6, -1.8], [-0.4, 0.8], [5.2, 2.8], [-3.2, 4.4], [4.8, -3.6]];

function makeCurves() {
  return ROUTES.map((r) => new THREE.CatmullRomCurve3(r.pts.map(([x, z]) => new THREE.Vector3(x, 0.02, z)), r.closed, 'catmullrom', 0.5));
}

/* ---------------------------------- Roads --------------------------------- */

function Roads({ curves }) {
  return curves.map((c, i) => (
    <group key={i}>
      {/* asphalt ribbon: a tube squashed flat */}
      <mesh scale={[1, 0.06, 1]} position={[0, 0.005, 0]}>
        <tubeGeometry args={[c, 320, 0.2, 8, c.closed]} />
        <meshStandardMaterial color="#121a2c" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* glowing centre line */}
      <mesh position={[0, 0.02, 0]}>
        <tubeGeometry args={[c, 320, 0.012, 4, c.closed]} />
        <meshBasicMaterial color={BRAND} transparent opacity={i === 0 ? 0.9 : 0.5} toneMapped={false} />
      </mesh>
    </group>
  ));
}

/* --------------------------------- Traffic -------------------------------- */

function Traffic({ curves, count }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cars = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      curve: curves[i % curves.length],
      offset: Math.random(),
      speed: 0.018 + Math.random() * 0.03,
      dir: Math.random() > 0.5 ? 1 : -1,
      warm: Math.random() > 0.55,
    })),
    [curves, count],
  );

  useLayoutEffect(() => {
    const warm = new THREE.Color('#ffb86b');
    const cool = new THREE.Color('#e6ecff');
    cars.forEach((c, i) => ref.current.setColorAt(i, c.warm ? warm : cool));
    ref.current.instanceColor.needsUpdate = true;
  }, [cars]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    cars.forEach((c, i) => {
      let u = (c.offset + t * c.speed * c.dir) % 1;
      if (u < 0) u += 1;
      c.curve.getPointAt(u, dummy.position);
      c.curve.getTangentAt(u, tmp);
      dummy.position.y = 0.05;
      dummy.lookAt(dummy.position.x + tmp.x * c.dir, dummy.position.y, dummy.position.z + tmp.z * c.dir);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.035, 0.03, 0.22]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/* ------------------------------- City blocks ------------------------------ */

function City({ curves, density }) {
  const ref = useRef();
  const blocks = useMemo(() => {
    const samples = curves.flatMap((c) => c.getSpacedPoints(160));
    const nearRoad = (x, z) => samples.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < 0.36);
    const nearBeacon = (x, z) => BEACONS.some(([bx, bz]) => (bx - x) ** 2 + (bz - z) ** 2 < 0.5);
    const out = [];
    for (let x = -10; x <= 10; x += 0.72) {
      for (let z = -7; z <= 8; z += 0.72) {
        const jx = x + (Math.random() - 0.5) * 0.2;
        const jz = z + (Math.random() - 0.5) * 0.2;
        if (Math.random() > density || nearRoad(jx, jz) || nearBeacon(jx, jz)) continue;
        const dist = Math.hypot(jx, jz);
        const h = 0.08 + Math.random() ** 2.4 * (dist < 5 ? 1.4 : 0.7);
        out.push({ x: jx, z: jz, h, w: 0.34 + Math.random() * 0.22, d: 0.34 + Math.random() * 0.22, lit: Math.random() > 0.86 });
      }
    }
    return out;
  }, [curves, density]);

  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    const base = new THREE.Color('#131b2e');
    const lit = new THREE.Color('#223463');
    blocks.forEach((b, i) => {
      m.position.set(b.x, b.h / 2, b.z);
      m.scale.set(b.w, b.h, b.d);
      m.updateMatrix();
      ref.current.setMatrixAt(i, m.matrix);
      ref.current.setColorAt(i, b.lit ? lit : base);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
  }, [blocks]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, blocks.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.55} metalness={0.35} />
    </instancedMesh>
  );
}

/* ---------------------------------- Car ----------------------------------- */

function LearnerCar({ curve }) {
  const ref = useRef();
  const tan = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    const u = (state.clock.elapsedTime * 0.022) % 1;
    curve.getPointAt(u, ref.current.position);
    curve.getTangentAt(u, tan);
    ref.current.position.y = 0.03;
    ref.current.lookAt(ref.current.position.x + tan.x, 0.03, ref.current.position.z + tan.z);
  });
  return (
    <group ref={ref} scale={1.25}>
      {/* body — local +z is forward */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.2, 0.08, 0.38]} />
        <meshStandardMaterial color="#f2f5fb" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.14, -0.03]}>
        <boxGeometry args={[0.17, 0.07, 0.2]} />
        <meshStandardMaterial color="#1c2b4d" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* L-plate hint */}
      <mesh position={[0, 0.185, -0.03]}>
        <boxGeometry args={[0.06, 0.012, 0.06]} />
        <meshBasicMaterial color="#ef4444" toneMapped={false} />
      </mesh>
      {[[-0.1, 0.12], [0.1, 0.12], [-0.1, -0.12], [0.1, -0.12]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.035, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
          <meshStandardMaterial color="#0a0f1a" />
        </mesh>
      ))}
      {/* headlights + beam */}
      {[-0.065, 0.065].map((x) => (
        <mesh key={x} position={[x, 0.075, 0.195]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#fff6d8" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.28, 0.85, 24, 1, true]} />
        <meshBasicMaterial color="#fff2c4" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.075, -0.195]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshBasicMaterial color="#ff3b3b" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------- Beacons --------------------------------- */

function Beacon({ position, index, timeline }) {
  const pillar = useRef();
  const head = useRef();
  const ring = useRef();
  const ring2 = useRef();
  const glow = useRef();
  const mix = useRef(0);
  const color = useMemo(() => new THREE.Color(), []);
  const seed = useMemo(() => Math.random() * 10, []);

  useFrame((state, delta) => {
    const tl = timeline.current;
    const active = tl && tl.index === index && tl.phase !== 'scan';
    mix.current = THREE.MathUtils.damp(mix.current, active ? 1 : 0, 6, delta);
    const m = mix.current;
    color.copy(BRAND).lerp(GREEN, m);
    const t = state.clock.elapsedTime + seed;

    pillar.current.material.color.copy(color);
    pillar.current.material.opacity = 0.35 + m * 0.5;
    pillar.current.scale.y = 1 + m * 0.6;
    pillar.current.position.y = 0.8 * pillar.current.scale.y;
    head.current.material.color.copy(color);
    head.current.position.y = 1.6 * pillar.current.scale.y;
    glow.current.material.color.copy(color);
    glow.current.material.opacity = 0.18 + m * 0.35 + Math.sin(t * 3) * 0.04;

    const speed = 0.5 + m * 0.9;
    for (const [r, off] of [[ring, 0], [ring2, 0.5]]) {
      const p = ((t * speed + off) % 1);
      const s = 1 + p * (3 + m * 4);
      r.current.scale.set(s, s, s);
      r.current.material.opacity = (1 - p) * (0.35 + m * 0.45);
      r.current.material.color.copy(color);
    }
  });

  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh ref={pillar}>
        <cylinderGeometry args={[0.022, 0.05, 1.6, 12, 1, true]} />
        <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={head}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </mesh>
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {[ring, ring2].map((r, i) => (
        <mesh key={i} ref={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
          <ringGeometry args={[0.16, 0.19, 48]} />
          <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------- Radar --------------------------------- */

function Radar() {
  const sweep = useRef();
  const sweepTexture = useMemo(() => {
    // angular gradient so the sweep has a bright leading edge and a soft tail
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createConicGradient ? g.createConicGradient(0, 128, 128) : null;
    if (grad) {
      grad.addColorStop(0, 'rgba(91,124,255,0)');
      grad.addColorStop(0.12, 'rgba(91,124,255,0.55)');
      grad.addColorStop(0.125, 'rgba(160,185,255,0.9)');
      grad.addColorStop(0.13, 'rgba(91,124,255,0)');
      grad.addColorStop(1, 'rgba(91,124,255,0)');
      g.fillStyle = grad;
    } else {
      g.fillStyle = 'rgba(91,124,255,0.25)';
    }
    g.beginPath();
    g.arc(128, 128, 128, 0, Math.PI * 2);
    g.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((_, delta) => { sweep.current.rotation.z -= delta * 0.9; });

  return (
    <group position={[-0.4, 0.04, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={sweep}>
        <circleGeometry args={[7.5, 96]} />
        <meshBasicMaterial map={sweepTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {[2.5, 5, 7.5].map((r) => (
        <mesh key={r}>
          <ringGeometry args={[r - 0.012, r, 128]} />
          <meshBasicMaterial color={BRAND} transparent opacity={0.16} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------- Dust ---------------------------------- */

function Dust({ count }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 22;
      a[i * 3 + 1] = Math.random() * 4;
      a[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return a;
  }, [count]);
  useFrame((state) => { ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15; ref.current.rotation.y = state.clock.elapsedTime * 0.01; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#9db4ff" transparent opacity={0.55} depthWrite={false} sizeAttenuation />
    </points>
  );
}

/* --------------------------------- Camera --------------------------------- */

function CameraRig({ compact }) {
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const base = compact ? new THREE.Vector3(0.6, 9.5, 11.5) : new THREE.Vector3(1.2, 6.4, 9.6);
  const target = compact ? new THREE.Vector3(0.2, 0, 0.6) : new THREE.Vector3(-2.4, 0, 0.4);
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const px = state.pointer.x;
    const py = state.pointer.y;
    const x = base.x + Math.sin(t * 0.08) * 0.9 + px * 0.9;
    const y = base.y + Math.sin(t * 0.11) * 0.25 + py * 0.5;
    const z = base.z + Math.cos(t * 0.08) * 0.4;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, x, 2.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y, 2.2, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 2.2, delta);
    look.set(target.x + px * 0.3, target.y, target.z);
    camera.lookAt(look);
  });
  return null;
}

/* ---------------------------------- Root ---------------------------------- */

export default function HeroScene({ timeline, compact = false, running = true, onReady, eventSource }) {
  const curves = useMemo(makeCurves, []);
  return (
    <Canvas
      eventSource={eventSource}
      eventPrefix="client"
      frameloop={running ? 'always' : 'never'}
      dpr={[1, compact ? 1.5 : 1.8]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: compact ? 46 : 38, near: 0.1, far: 60, position: compact ? [0.6, 9.5, 11.5] : [1.2, 6.4, 9.6] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(NIGHT);
        scene.fog = new THREE.Fog(NIGHT, compact ? 12 : 9, compact ? 24 : 21);
        onReady?.();
      }}
    >
      <ambientLight intensity={0.55} color="#8aa2ff" />
      <directionalLight position={[-6, 8, 4]} intensity={1.1} color="#b8c8ff" />
      <pointLight position={[0, 3, 1]} intensity={14} distance={12} color="#5b7cff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0a1020" roughness={1} />
      </mesh>
      <gridHelper args={[60, 84, '#1c2a4f', '#131d36']} position={[0, 0.001, 0]} />

      <City curves={curves} density={compact ? 0.42 : 0.55} />
      <Roads curves={curves} />
      <Traffic curves={curves} count={compact ? 26 : 54} />
      <LearnerCar curve={curves[0]} />
      <Radar />
      {BEACONS.map((p, i) => <Beacon key={i} index={i} position={p} timeline={timeline} />)}
      <Dust count={compact ? 160 : 360} />
      <CameraRig compact={compact} />
    </Canvas>
  );
}
