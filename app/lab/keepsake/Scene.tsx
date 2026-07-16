"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";

export type Stage = "gate" | "opening" | "ring" | "closing";

export const MEMORY_IMAGES = [
  "/lab/images/coffee.jpg",
  "/lab/images/road.jpg",
  "/lab/images/rain.jpg",
  "/lab/images/night.jpg",
  "/lab/images/candle.jpg",
];

export const MEMORY_CAPTIONS = [
  "morning coffee, slightly burnt",
  "the long drive nowhere",
  "monsoon, no umbrella",
  "2 a.m., still laughing",
  "five first anniversaries",
];

interface SceneProps {
  stage: Stage;
  sealBroken: boolean;
  selectedIndex: number | null;
  onBreakSeal: () => void;
  onSelectCard: (index: number | null) => void;
  reduced: boolean;
}

function CameraRig({ stage }: { stage: Stage }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    let ty = 0.2;
    let tz = 4.4;
    if (stage === "gate") {
      ty = 0.2;
      tz = 4.4;
    } else if (stage === "opening") {
      ty = 0.15;
      tz = 2.7;
    } else if (stage === "ring") {
      ty = 0.35;
      tz = 6.4;
    } else if (stage === "closing") {
      ty = 0.15;
      tz = 3.1;
    }
    target.set(0, ty, tz);
    const t = 1 - Math.pow(0.001, delta);
    camera.position.lerp(target, t);
    if (stage !== "ring") {
      camera.lookAt(0, 0.1, 0);
    }
  });

  return null;
}

function Envelope({
  stage,
  sealBroken,
  onBreakSeal,
}: {
  stage: Stage;
  sealBroken: boolean;
  onBreakSeal: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const flapGroupRef = useRef<THREE.Group>(null);
  const sealRef = useRef<THREE.Mesh>(null);
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const flapMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const flapAngleRef = useRef(0);
  const sealScaleRef = useRef(1);
  const opacityRef = useRef(1);

  useFrame((_, delta) => {
    const flapTarget = sealBroken ? -2.4 : 0;
    flapAngleRef.current += (flapTarget - flapAngleRef.current) * Math.min(1, delta * 2.4);
    if (flapGroupRef.current) flapGroupRef.current.rotation.x = flapAngleRef.current;

    const sealTarget = sealBroken ? 0 : 1;
    sealScaleRef.current += (sealTarget - sealScaleRef.current) * Math.min(1, delta * 3.2);
    if (sealRef.current) sealRef.current.scale.setScalar(Math.max(0.001, sealScaleRef.current));

    const opTarget = stage === "ring" || stage === "closing" ? 0 : 1;
    opacityRef.current += (opTarget - opacityRef.current) * Math.min(1, delta * 2.2);
    if (groupRef.current) groupRef.current.visible = opacityRef.current > 0.01;
    if (bodyMatRef.current) bodyMatRef.current.opacity = opacityRef.current;
    if (flapMatRef.current) flapMatRef.current.opacity = opacityRef.current;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[1.7, 1.05]} />
        <meshStandardMaterial ref={bodyMatRef} color="#242850" transparent />
      </mesh>
      <group ref={flapGroupRef} position={[0, 0.525, 0.01]}>
        <mesh position={[0, -0.31, 0]}>
          <planeGeometry args={[1.7, 0.62]} />
          <meshStandardMaterial ref={flapMatRef} color="#2f335f" side={THREE.DoubleSide} transparent />
        </mesh>
        <mesh
          ref={sealRef}
          position={[0, -0.62, 0.02]}
          onClick={(e) => {
            e.stopPropagation();
            onBreakSeal();
          }}
        >
          <circleGeometry args={[0.14, 32]} />
          <meshStandardMaterial color="#f0a83a" emissive="#f0a83a" emissiveIntensity={0.35} />
        </mesh>
      </group>
    </group>
  );
}

function MemoryCard({
  position,
  rotationY,
  texture,
  index,
  selected,
  anySelected,
  targetScale,
  onSelect,
}: {
  position: [number, number, number];
  rotationY: number;
  texture: THREE.Texture;
  index: number;
  selected: boolean;
  anySelected: boolean;
  targetScale: number;
  onSelect: (i: number | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const scaleRef = useRef(0.001);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    const boost = selected ? targetScale * 1.35 : hovered ? targetScale * 1.08 : targetScale;
    scaleRef.current += (boost - scaleRef.current) * Math.min(1, delta * 4);
    if (meshRef.current) meshRef.current.scale.setScalar(Math.max(0.001, scaleRef.current));

    const opTarget = anySelected && !selected ? 0.3 : 1;
    if (matRef.current) {
      matRef.current.opacity += (opTarget - matRef.current.opacity) * Math.min(1, delta * 5);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(selected ? null : index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial ref={matRef} map={texture} transparent opacity={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function MemoryRing({
  stage,
  selectedIndex,
  onSelectCard,
  reduced,
}: {
  stage: Stage;
  selectedIndex: number | null;
  onSelectCard: (i: number | null) => void;
  reduced: boolean;
}) {
  const textures = useTexture(MEMORY_IMAGES);
  const ringRef = useRef<THREE.Group>(null);

  const items = useMemo(() => {
    const radius = 2.6;
    return MEMORY_IMAGES.map((_, i) => {
      const angle = (i / MEMORY_IMAGES.length) * Math.PI * 2;
      const position: [number, number, number] = [
        Math.sin(angle) * radius,
        0,
        Math.cos(angle) * radius,
      ];
      return { position, rotationY: angle };
    });
  }, []);

  useFrame((_, delta) => {
    if (ringRef.current && stage === "ring" && selectedIndex === null && !reduced) {
      ringRef.current.rotation.y += delta * 0.06;
    }
  });

  const visible = stage === "ring" || stage === "closing";
  const targetScale = stage === "closing" ? 0.001 : visible ? 1 : 0.001;

  return (
    <group ref={ringRef}>
      {items.map((item, i) => (
        <MemoryCard
          key={i}
          position={item.position}
          rotationY={item.rotationY}
          texture={textures[i]}
          index={i}
          selected={selectedIndex === i}
          anySelected={selectedIndex !== null}
          targetScale={targetScale}
          onSelect={onSelectCard}
        />
      ))}
    </group>
  );
}

export default function Scene({
  stage,
  sealBroken,
  selectedIndex,
  onBreakSeal,
  onSelectCard,
  reduced,
}: SceneProps) {
  return (
    <>
      <color attach="background" args={["#0d0e1f"]} />
      <fog attach="fog" args={["#0d0e1f", 6, 15]} />
      <ambientLight intensity={0.35} color="#8b86a3" />
      <pointLight position={[2, 2, 3]} intensity={1.1} color="#f0a83a" distance={12} decay={2} />
      <pointLight position={[-2, -1, -2]} intensity={0.4} color="#e2896a" distance={10} decay={2} />

      <Stars
        radius={60}
        depth={30}
        count={reduced ? 700 : 2200}
        factor={2.2}
        saturation={0}
        fade
        speed={reduced ? 0 : 0.4}
      />

      <CameraRig stage={stage} />

      <Envelope stage={stage} sealBroken={sealBroken} onBreakSeal={onBreakSeal} />

      <Suspense fallback={null}>
        <MemoryRing stage={stage} selectedIndex={selectedIndex} onSelectCard={onSelectCard} reduced={reduced} />
      </Suspense>

      {stage === "ring" && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2 - 0.35}
          maxPolarAngle={Math.PI / 2 + 0.25}
          minAzimuthAngle={-Math.PI / 2.3}
          maxAzimuthAngle={Math.PI / 2.3}
          enableDamping
          dampingFactor={0.08}
        />
      )}
    </>
  );
}
