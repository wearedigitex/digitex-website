"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Stars, Environment, Instance, Instances } from "@react-three/drei"
import * as THREE from "three"

// Reusable shape component for the plexus effect
function Shard({ position, rotation, scale, color }: any) {
    return (
        <Instance
            position={position}
            rotation={rotation}
            scale={scale}
            color={color}
        />
    )
}

function PlexusField() {
    const count = 30 // Reduced from 60 for cleaner look

    // Generate random data for shards
    const data = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 28,
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 12
            ],
            rotation: [
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            ],
            scale: Math.random() * 1.8 + 0.5,
            // Balanced Palette: Bright but not neon. Teal, Soft Purple, Cyan.
            color: Math.random() > 0.7 ? "#06B6D4" : Math.random() > 0.5 ? "#C084FC" : Math.random() > 0.3 ? "#818CF8" : "#2DD4BF"
        }))
    }, [])

    return (
        <group>
            {/* Wireframe Triangles/Tetrahedrons */}
            <Instances range={count}>
                <tetrahedronGeometry args={[1.2, 0]} />
                <meshBasicMaterial
                    wireframe
                    transparent
                    opacity={0.5} // Balanced visibility
                    toneMapped={false}
                    color="#ffffff"
                />
                {data.map((props, i) => (
                    <Shard key={i} {...props} />
                ))}
            </Instances>

            {/* Solid Glowing Shapes */}
            <Instances range={count / 2}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    emissive="#0EA5E9"
                    emissiveIntensity={1} // Balanced glow
                    toneMapped={false}
                    transparent
                    opacity={0.4}
                />
                {data.slice(0, count / 2).map((props, i) => (
                    <Shard key={`glass-${i}`} {...props} scale={props.scale * 0.7} />
                ))}
            </Instances>
        </group>
    )
}

function ConnectingLines() {
    return (
        <group>
            <mesh rotation={[0.5, 0.5, 0]} scale={[25, 25, 25]}>
                <icosahedronGeometry args={[1, 2]} />
                <meshBasicMaterial
                    color="#A855F7" // Purple tint
                    wireframe
                    transparent
                    opacity={0.12} // Balanced
                    toneMapped={false}
                />
            </mesh>
            <mesh rotation={[0.5, -0.5, 0]} scale={[18, 18, 18]}>
                <icosahedronGeometry args={[1, 1]} />
                <meshBasicMaterial
                    color="#0EA5E9" // Cyan tint
                    wireframe
                    transparent
                    opacity={0.12}
                    toneMapped={false}
                />
            </mesh>
        </group>
    )
}

export function PlexusScene() {
    return (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 12], fov: 60 }} gl={{ antialias: true, alpha: true }}>
                <Environment preset="city" />

                {/* Balanced Lighting */}
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={3} color="#06B6D4" distance={50} />
                <pointLight position={[-10, -10, 5]} intensity={3} color="#C084FC" distance={50} />
                <pointLight position={[0, 5, 0]} intensity={2} color="#ffffff" />

                {/* Floating Field */}
                <Float speed={1.8} rotationIntensity={0.9} floatIntensity={0.9} floatingRange={[-2, 2]}>
                    <PlexusField />
                    <ConnectingLines />
                </Float>

                {/* Background */}
                <Stars radius={100} depth={50} count={1500} factor={4} saturation={0.5} fade speed={1.5} />
            </Canvas>
        </div>
    )
}
