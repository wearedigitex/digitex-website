"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Stars, Environment, Sparkles, TorusKnot, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

function CyberWing({ position, rotationDirection = 1 }: { position: [number, number, number], rotationDirection?: number }) {
    const groupRef = useRef<THREE.Group>(null!)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        // Gentle floating and rotation
        groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.5
        groupRef.current.rotation.y = t * 0.2 * rotationDirection
    })

    return (
        <group ref={groupRef} position={position}>
            {/* Core Tech Shape */}
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <TorusKnot args={[0.8, 0.2, 100, 16]} scale={[1, 2, 1]}>
                    <MeshDistortMaterial
                        color="#28829E"
                        emissive="#0EA5E9"
                        emissiveIntensity={0.5}
                        roughness={0.1}
                        metalness={1}
                        distort={0.4}
                        speed={2}
                    />
                </TorusKnot>
            </Float>

            {/* Vertical Data Stream */}
            <Sparkles
                count={50}
                scale={[2, 10, 2]}
                size={4}
                speed={0.4}
                opacity={0.8}
                color="#00FFFF"
            />

            {/* Outer Wireframe Structure */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[1.5, 8, 1.5]} />
                <meshBasicMaterial color="#28829E" wireframe transparent opacity={0.05} />
            </mesh>
        </group>
    )
}

export function SideScene() {
    return (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                <Environment preset="city" />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00FFFF" />

                {/* Left Wing */}
                <CyberWing position={[-7, 0, 0]} rotationDirection={1} />

                {/* Right Wing */}
                <CyberWing position={[7, 0, 0]} rotationDirection={-1} />

                {/* Background Depth - sparse to keep focus on wings and center text */}
                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            </Canvas>
        </div>
    )
}
