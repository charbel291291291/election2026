
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';


const ParticleField = () => {
  const ref = useRef<THREE.Points>(null!);
  
  const positions = useMemo(() => {
    const count = 2000; // Number of particles
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360); 
      const phi = THREE.MathUtils.randFloatSpread(360); 
      
      const r = 15 + Math.random() * 30; // Radius spread

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      // Rotation
      ref.current.rotation.x -= delta / 30;
      ref.current.rotation.y -= delta / 40;
      
      // Mouse interaction (Parallax)
      const x = state.pointer.x * 0.2;
      const y = state.pointer.y * 0.2;
      ref.current.rotation.x += (y - ref.current.rotation.x) * 0.02;
      ref.current.rotation.y += (x - ref.current.rotation.y) * 0.02;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.1}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
};

const ThreeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <ParticleField />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
};

export default React.memo(ThreeBackground);
