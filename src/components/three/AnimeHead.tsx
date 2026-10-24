"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const SKIN = "#ffd2b4";
const SKIN_SHADE = "#f0a98c";
const HAIR = "#6a47f5";
const HAIR_STREAK = "#22d3ee";
const OUTLINE = "#14093a";
const IRIS = "#22d3ee";
const SPARKS = 380;
const OUTLINE_SCALE = 1.045;

// ---------- вспомогательное ----------

/** Детерминированный ГПСЧ: чистый рендер и одинаковая картинка при каждой загрузке */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Vec3 = [number, number, number];

const GEO = {
  face: new THREE.SphereGeometry(1, 48, 32),
  eye: new THREE.SphereGeometry(1, 24, 16),
  hairCap: new THREE.SphereGeometry(1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.5),
  cone: new THREE.ConeGeometry(1, 1, 10),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 20),
  box: new THREE.BoxGeometry(1, 1, 1),
  circle: new THREE.CircleGeometry(1, 24),
  smile: new THREE.TorusGeometry(1, 0.1, 8, 20, Math.PI),
};

const outlineMaterial = new THREE.MeshBasicMaterial({ color: OUTLINE, side: THREE.BackSide });

interface PartProps {
  geometry: THREE.BufferGeometry;
  color: string;
  position?: Vec3;
  scale?: Vec3 | number;
  rotation?: Vec3;
  /** Рисовать контур (инвертированная оболочка) */
  outline?: boolean;
  children?: ReactNode;
}

/** Мультяшная деталь: тоновая заливка + тёмный контур. */
function Part({ geometry, color, position, scale = 1, rotation, outline = true, children }: PartProps) {
  const s: Vec3 = typeof scale === "number" ? [scale, scale, scale] : scale;
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} scale={s}>
        <meshToonMaterial color={color} />
      </mesh>
      {outline && (
        <mesh geometry={geometry} scale={s.map((v) => v * OUTLINE_SCALE) as Vec3} material={outlineMaterial} />
      )}
      {children}
    </group>
  );
}

// ---------- управление взглядом ----------

interface Look {
  x: number;
  y: number;
}

/** Нормированное положение курсора относительно центра сцены (−1…1), по всему экрану. */
function useCursorLook() {
  const gl = useThree((s) => s.gl);
  const look = useRef<Look>({ x: 0, y: 0 });
  const lastMove = useRef(-10);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.4;
      look.current.x = THREE.MathUtils.clamp((e.clientX - cx) / (window.innerWidth * 0.5), -1, 1);
      look.current.y = THREE.MathUtils.clamp(-(e.clientY - cy) / (window.innerHeight * 0.5), -1, 1);
      lastMove.current = performance.now() / 1000;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  return { look, lastMove };
}

// ---------- сама голова ----------

function Eye({ side, irisRef, lidRef }: { side: 1 | -1; irisRef: React.RefObject<THREE.Group | null>; lidRef: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={lidRef} position={[side * 0.37, -0.02, 0.8]} rotation={[0, side * 0.32, 0]}>
      <Part geometry={GEO.eye} color="#ffffff" scale={[0.21, 0.26, 0.08]} />
      <group ref={irisRef} position={[0, 0, 0.05]}>
        <Part geometry={GEO.eye} color={IRIS} scale={[0.15, 0.21, 0.04]} outline={false} />
        <Part geometry={GEO.eye} color="#0b1030" scale={[0.075, 0.12, 0.05]} outline={false} position={[0, -0.01, 0.02]} />
        <Part geometry={GEO.eye} color="#ffffff" scale={[0.04, 0.05, 0.05]} outline={false} position={[-0.05, 0.08, 0.04]} />
        <Part geometry={GEO.eye} color="#ffffff" scale={[0.02, 0.025, 0.05]} outline={false} position={[0.05, -0.08, 0.04]} />
      </group>
      {/* верхнее веко-ресницы */}
      <Part geometry={GEO.box} color={OUTLINE} scale={[0.27, 0.035, 0.03]} position={[side * 0.01, 0.255, 0.05]} rotation={[0, 0, side * -0.18]} outline={false} />
    </group>
  );
}

/** Шипы волос, расходящиеся от макушки назад и в стороны. */
function HairSpikes() {
  const spikes = useMemo(() => {
    const rand = mulberry32(7);
    return Array.from({ length: 14 }, (_, i) => {
      // направление в верхней задней полусфере (спереди остаётся чёлка)
      const theta = rand() * Math.PI * 2;
      const phi = 0.15 + rand() * 1.0;
      const dir = new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi) + 0.15, Math.sin(phi) * Math.sin(theta) - 0.35).normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      const position = dir.clone().multiplyScalar(0.95).toArray() as Vec3;
      return { quaternion, position, length: 0.7 + rand() * 0.55, radius: 0.2 + rand() * 0.08, streak: i % 5 === 0 };
    });
  }, []);

  return (
    <>
      {spikes.map((s, i) => (
        <group key={i} position={s.position} quaternion={s.quaternion}>
          <Part geometry={GEO.cone} color={s.streak ? HAIR_STREAK : HAIR} scale={[s.radius, s.length, s.radius]} position={[0, s.length * 0.35, 0]} />
        </group>
      ))}
    </>
  );
}

/** Чёлка: острые пряди, свисающие на лоб. */
function Bangs() {
  const strands: { x: number; len: number; tilt: number; streak?: boolean }[] = [
    { x: -0.62, len: 0.42, tilt: 0.3 },
    { x: -0.38, len: 0.55, tilt: 0.14 },
    { x: -0.12, len: 0.4, tilt: 0.03, streak: true },
    { x: 0.14, len: 0.56, tilt: -0.1 },
    { x: 0.4, len: 0.46, tilt: -0.22 },
    { x: 0.64, len: 0.38, tilt: -0.34 },
  ];
  return (
    <>
      {strands.map((b, i) => {
        // нижний край пряди держим над бровями, z — по поверхности лба
        const y = 0.46 + b.len / 2;
        const z = 0.9 * Math.sqrt(Math.max(0, 1 - (b.x / 0.92) ** 2 - y ** 2)) + 0.06;
        return (
          <Part
            key={i}
            geometry={GEO.cone}
            color={b.streak ? HAIR_STREAK : HAIR}
            scale={[0.17, b.len, 0.09]}
            position={[b.x, y, z]}
            rotation={[0.25, 0, Math.PI + b.tilt]}
          />
        );
      })}
    </>
  );
}

function Head() {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const irisL = useRef<THREE.Group>(null);
  const irisR = useRef<THREE.Group>(null);
  const lidL = useRef<THREE.Group>(null);
  const lidR = useRef<THREE.Group>(null);
  const { look, lastMove } = useCursorLook();
  const nextBlink = useRef(2);
  const blinkAt = useRef(-1);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const idle = performance.now() / 1000 - lastMove.current > 3;
    // Курсор давно не двигался (или касание): голова плавно «осматривается» сама
    const tx = idle ? Math.sin(t * 0.55) * 0.55 : look.current.x;
    const ty = idle ? Math.sin(t * 0.4) * 0.3 : look.current.y;

    const h = head.current;
    if (h) {
      h.rotation.y = THREE.MathUtils.damp(h.rotation.y, tx * 0.75, 5, delta);
      h.rotation.x = THREE.MathUtils.damp(h.rotation.x, -ty * 0.5, 5, delta);
      h.rotation.z = THREE.MathUtils.damp(h.rotation.z, -tx * 0.1, 4, delta);
    }
    if (body.current) body.current.rotation.y = THREE.MathUtils.damp(body.current.rotation.y, tx * 0.25, 3, delta);
    if (root.current) root.current.position.y = 0.15 + Math.sin(t * 1.3) * 0.04;

    // Глаза опережают голову: смотрят точно на курсор
    for (const iris of [irisL.current, irisR.current]) {
      if (!iris) continue;
      iris.position.x = THREE.MathUtils.damp(iris.position.x, tx * 0.075, 14, delta);
      iris.position.y = THREE.MathUtils.damp(iris.position.y, ty * 0.075, 14, delta);
    }

    // Моргание
    if (t > nextBlink.current) {
      blinkAt.current = t;
      nextBlink.current = t + 2.5 + Math.random() * 3;
    }
    const k = t - blinkAt.current;
    const lid = k >= 0 && k < 0.16 ? 1 - Math.sin((k / 0.16) * Math.PI) * 0.92 : 1;
    if (lidL.current) lidL.current.scale.y = lid;
    if (lidR.current) lidR.current.scale.y = lid;
  });

  return (
    <group ref={root}>
      {/* тело */}
      <group ref={body}>
        <Part geometry={GEO.face} color="#2a1f6e" scale={[1.55, 0.85, 0.85]} position={[0, -2.15, -0.1]} />
        <Part geometry={GEO.cylinder} color={SKIN_SHADE} scale={[0.26, 0.7, 0.26]} position={[0, -1.25, 0]} />
        <Part geometry={GEO.box} color={HAIR_STREAK} scale={[0.5, 0.06, 0.06]} position={[0, -1.62, 0.55]} outline={false} />
      </group>

      <group ref={head}>
        {/* лицо с заострённым подбородком */}
        <Part geometry={GEO.face} color={SKIN} scale={[0.92, 1, 0.9]} />
        <Part geometry={GEO.face} color={SKIN} scale={[0.6, 0.55, 0.6]} position={[0, -0.62, 0.3]} />
        {/* уши */}
        <Part geometry={GEO.face} color={SKIN} scale={[0.1, 0.17, 0.12]} position={[-0.9, -0.02, 0]} />
        <Part geometry={GEO.face} color={SKIN} scale={[0.1, 0.17, 0.12]} position={[0.9, -0.02, 0]} />

        <Eye side={-1} irisRef={irisL} lidRef={lidL} />
        <Eye side={1} irisRef={irisR} lidRef={lidR} />

        {/* брови */}
        <Part geometry={GEO.box} color={OUTLINE} scale={[0.26, 0.04, 0.03]} position={[-0.37, 0.34, 0.82]} rotation={[0, -0.3, 0.12]} outline={false} />
        <Part geometry={GEO.box} color={OUTLINE} scale={[0.26, 0.04, 0.03]} position={[0.37, 0.34, 0.82]} rotation={[0, 0.3, -0.12]} outline={false} />
        {/* нос, рот, румянец */}
        <Part geometry={GEO.eye} color={SKIN_SHADE} scale={0.035} position={[0, -0.24, 0.9]} outline={false} />
        <Part geometry={GEO.smile} color="#c2455f" scale={[0.1, 0.07, 0.05]} position={[0, -0.4, 0.86]} rotation={[0, 0, Math.PI]} outline={false} />
        <mesh geometry={GEO.circle} scale={[0.1, 0.06, 1]} position={[-0.52, -0.2, 0.72]} rotation={[0, -0.6, 0]}>
          <meshBasicMaterial color="#ff4ecd" transparent opacity={0.4} />
        </mesh>
        <mesh geometry={GEO.circle} scale={[0.1, 0.06, 1]} position={[0.52, -0.2, 0.72]} rotation={[0, 0.6, 0]}>
          <meshBasicMaterial color="#ff4ecd" transparent opacity={0.4} />
        </mesh>

        {/* волосы: шапка, шипы, чёлка */}
        <Part geometry={GEO.hairCap} color={HAIR} scale={[1.0, 1.06, 1.0]} position={[0, 0.1, -0.02]} rotation={[-0.5, 0, 0]} />
        <HairSpikes />
        <Bangs />
      </group>
    </group>
  );
}

/** Звёздная пыль вокруг персонажа. */
function Sparks() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = mulberry32(42);
    const arr = new Float32Array(SPARKS * 3);
    for (let i = 0; i < SPARKS; i++) {
      const r = 2.6 + rand() * 1.8;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi) - 1.5;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.06;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ff4ecd" transparent opacity={0.8} sizeAttenuation depthWrite={false} />
    </points>
  );
}

interface AnimeHeadProps {
  /** false — рендер на паузе (сцена вне экрана) */
  active?: boolean;
}

export default function AnimeHead({ active = true }: AnimeHeadProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.4], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      frameloop={active ? "always" : "never"}
    >
      <ambientLight intensity={2.1} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} />
      <directionalLight position={[-4, 1, 2]} intensity={1.1} color="#22d3ee" />
      <Head />
      <Sparks />
    </Canvas>
  );
}
