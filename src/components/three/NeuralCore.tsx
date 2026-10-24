"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const PARTICLES = 900;

// Детерминированный ГПСЧ: чистая функция рендера и одинаковая картинка при каждой загрузке
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Core() {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    // Вращение следует за курсором и прогрессом скролла
    const scroll = window.scrollY / Math.max(window.innerHeight, 1);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.6 + scroll * 1.2, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.4 + scroll * 0.4, 3, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, scroll * 0.9, 3, delta);
    if (mesh.current) mesh.current.rotation.z += delta * 0.15;
  });

  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh ref={mesh}>
          <icosahedronGeometry args={[1.35, 24]} />
          <MeshDistortMaterial
            color="#8b6cff"
            emissive="#2a1590"
            emissiveIntensity={0.35}
            roughness={0.08}
            metalness={0.9}
            envMapIntensity={1.6}
            distort={0.42}
            speed={1.8}
          />
        </mesh>
        <mesh scale={1.75}>
          <icosahedronGeometry args={[1, 2]} />
          <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.18} />
        </mesh>
      </Float>
      <Orbiters />
    </group>
  );
}

function Orbiters() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = mulberry32(42);
    const arr = new Float32Array(PARTICLES * 3);
    for (let i = 0; i < PARTICLES; i++) {
      // Точки на сфере с разбросом по радиусу
      const r = 2.2 + rand() * 1.6;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.08;
      points.current.rotation.x += delta * 0.03;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#ff4ecd" transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  );
}

interface NeuralCoreProps {
  /** false — рендер на паузе (сцена вне экрана) */
  active?: boolean;
}

export default function NeuralCore({ active = true }: NeuralCoreProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 4, 5]} intensity={60} color="#22d3ee" />
      <pointLight position={[-5, -3, 3]} intensity={50} color="#ff4ecd" />
      {/* Студийное окружение из светящихся панелей: даёт блики на металле без внешних HDR-файлов */}
      <Environment resolution={256} frames={Infinity}>
        <Lightformer form="rect" intensity={4} color="#22d3ee" position={[-4, 2, 3]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={3.5} color="#ff4ecd" position={[4, -2, 2]} scale={[5, 3, 1]} />
        <Lightformer form="ring" intensity={3} color="#ffffff" position={[0, 4, -3]} scale={4} />
      </Environment>
      <Core />
    </Canvas>
  );
}
