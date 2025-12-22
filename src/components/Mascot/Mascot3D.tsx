'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// MASCOT MODEL
// ═══════════════════════════════════════════════════════════════════════════
interface MascotModelProps {
    scale?: number;
}

function MascotModel({ scale = 1 }: MascotModelProps) {
    const { scene } = useGLTF('/mascot/Normal.glb');
    const meshRef = useRef<THREE.Group>(null);

    // Subtle idle animation - gentle sway
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <Float
            speed={2}
            rotationIntensity={0.1}
            floatIntensity={0.2}
        >
            <primitive
                ref={meshRef}
                object={scene}
                scale={scale}
                position={[0, -1, 0]}
            />
        </Float>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// HEXAGON PLATFORM - Sci-Fi Base
// ═══════════════════════════════════════════════════════════════════════════
function HexagonPlatform() {
    const meshRef = useRef<THREE.Mesh>(null);

    // Pulsing glow animation
    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
        }
    });

    return (
        <group position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Main hexagon */}
            <mesh ref={meshRef}>
                <circleGeometry args={[1.2, 6]} />
                <meshBasicMaterial
                    color="#00E676"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Inner hexagon */}
            <mesh position={[0, 0, 0.01]}>
                <ringGeometry args={[0.8, 1.1, 6]} />
                <meshBasicMaterial
                    color="#00E676"
                    transparent
                    opacity={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Outer glow ring */}
            <mesh position={[0, 0, -0.01]}>
                <ringGeometry args={[1.15, 1.25, 6]} />
                <meshBasicMaterial
                    color="#00E676"
                    transparent
                    opacity={0.7}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT - 3D Mascot with Environment
// ═══════════════════════════════════════════════════════════════════════════
interface Mascot3DProps {
    scale?: number;
    className?: string;
    showPlatform?: boolean;
}

export function Mascot3D({ scale = 2.5, className = '', showPlatform = true }: Mascot3DProps) {
    return (
        <div className={`w-full h-full ${className}`}>
            <Canvas
                camera={{ position: [0, 0.5, 5], fov: 45 }}
                style={{ background: 'transparent' }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <pointLight position={[-3, 2, -3]} intensity={0.6} color="#00E676" />
                <pointLight position={[3, 2, -3]} intensity={0.4} color="#00E676" />

                <Suspense fallback={null}>
                    {/* THE BEAST */}
                    <MascotModel scale={scale} />

                    {/* HEXAGON PLATFORM */}
                    {showPlatform && <HexagonPlatform />}

                    <Environment preset="night" />
                </Suspense>
            </Canvas>
        </div>
    );
}

// Preload the model
useGLTF.preload('/mascot/Normal.glb');

export default Mascot3D;
