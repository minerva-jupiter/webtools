"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OilArtAPI, OilArtPlane } from "./OilArtPlane";
import { useEffect, useRef } from "react";
import * as THREE from "three";
export default function OilArtCanvasWrapper() {
  const apiRef = useRef<OilArtAPI>({} as OilArtAPI);
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (apiRef.current.dropOil) {
        const x = Math.random() * 2 - 1; // -1.0〜1.0
        const y = Math.random() * 2 - 1; // -1.0〜1.0
        const color = new THREE.Color(
          Math.random(),
          Math.random(),
          Math.random(),
        );
        apiRef.current.dropOil({ x, y }, color);
        const tiltX = Math.random() * 0.8 - 0.4;
        const tiltY = Math.random() * 0.8 - 0.4;
        apiRef.current.tilt({ x: tiltX, y: tiltY });
      }
    }, 1500);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <Canvas
      camera={{ position: [0, 0, 1] }}
      style={{ height: "90vh", width: "100vw", backgroundColor: "#0f0f0f" }}
    >
      <color attach="background" args={[0x000000]} />
      <OilArtPlane onTriggerAPI={(api) => (apiRef.current = api)} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </Canvas>
  );
}
