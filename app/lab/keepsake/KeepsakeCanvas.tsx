"use client";

import { Canvas } from "@react-three/fiber";
import Scene, { type Stage } from "./Scene";

interface KeepsakeCanvasProps {
  stage: Stage;
  sealBroken: boolean;
  selectedIndex: number | null;
  onBreakSeal: () => void;
  onSelectCard: (index: number | null) => void;
  reduced: boolean;
}

export default function KeepsakeCanvas(props: KeepsakeCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 4.4], fov: 45 }}
      dpr={[1, 2]}
      style={{ position: "fixed", inset: 0, zIndex: 1 }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
