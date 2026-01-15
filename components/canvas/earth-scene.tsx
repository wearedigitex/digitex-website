"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Stars, Environment, Sparkles, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function Earth() {
    const earthRef = useRef<THREE.Group>(null!)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        // Slow rotation
        earthRef.current.rotation.y = t * 0.1
        // Slight tilt wobble
        earthRef.current.rotation.z = Math.sin(t * 0.2) * 0.1
    })

    return (
        <group ref={earthRef}>
            {/* Main Wireframe Globe */}
            <mesh>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial
                    color="#00FFFF"
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </mesh>

            {/* Inner Glowing Core (Solid but dark) */}
            <mesh>
                <sphereGeometry args={[1.95, 32, 32]} />
                <meshStandardMaterial
                    color="#000000"
                    emissive="#28829E"
                    emissiveIntensity={0.2}
                    roughness={0.7}
                />
            </mesh>

            {/* Electrical/Data Lines (Outer shell) */}
            <mesh>
                <sphereGeometry args={[2.05, 16, 16]} />
                <meshBasicMaterial
                    color="#0EA5E9"
                    wireframe
                    transparent
                    opacity={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Moving lights (simulate data traffic) */}
            <Sparkles count={50} scale={5} size={3} speed={0.4} opacity={1} color="#ffffff" />
        </group>
    )
}

function Atmosphere() {
    return (
        <mesh scale={[2.2, 2.2, 2.2]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
                color="#28829E"
                transparent
                opacity={0.05}
                side={THREE.BackSide}
            />
        </mesh>
    )
}

export function EarthScene() {
    return (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                <Environment preset="city" />

                {/* Cinematic Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00FFFF" />
                <DirectionalLight />

                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Earth />
                    <Atmosphere />
                </Float>

                {/* Background Depth */}
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={150} scale={10} size={1} speed={0.2} opacity={0.5} color="#28829E" />
            </Canvas>
        </div>
    )
}

function DirectionalLight() {
    return <directionalLight position={[-5, 5, 5]} intensity={2} color="#ffffff" />
}
