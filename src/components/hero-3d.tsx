import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Icosahedron, Stars, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { Mesh } from "three";

function Core() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.12;
      ref.current.rotation.y += delta * 0.18;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <Icosahedron ref={ref} args={[1.35, 4]}>
        <MeshDistortMaterial
          color="#5ad7e0"
          emissive="#0a4a55"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.85}
          distort={0.42}
          speed={1.6}
        />
      </Icosahedron>
    </Float>
  );
}

function Orbit({ radius, speed, color, size }: { radius: number; speed: number; color: string; size: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed;
    ref.current.position.set(Math.cos(t) * radius, Math.sin(t * 0.7) * 0.6, Math.sin(t) * radius);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  );
}

export function Hero3D() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="absolute inset-0" aria-hidden />;
  }
  return (
    <div className="absolute inset-0 -z-[1]" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.45} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#7ee8f2" />
        <pointLight position={[-5, -3, -3]} intensity={0.9} color="#f0b964" />
        <Suspense fallback={null}>
          <Core />
          <Orbit radius={2.4} speed={0.6} color="#7ee8f2" size={0.05} />
          <Orbit radius={2.8} speed={-0.4} color="#f0b964" size={0.04} />
          <Orbit radius={3.2} speed={0.3} color="#a78bfa" size={0.035} />
          <Stars radius={40} depth={30} count={1200} factor={3} fade speed={0.8} />
        </Suspense>
        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={0.45} luminanceThreshold={0.55} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.15} darkness={0.55} />
        </EffectComposer>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} enableRotate={false} />
      </Canvas>
    </div>
  );
}
