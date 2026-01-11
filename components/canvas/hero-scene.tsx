"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Stars, MeshDistortMaterial, Environment, Sparkles } from "@react-three/drei"
import * as THREE from "three"

function TechShape() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.x = Math.cos(t / 4) / 2
    meshRef.current.rotation.y = Math.sin(t / 4) / 2
    meshRef.current.rotation.z = Math.sin(t / 1.5) / 2
    meshRef.current.position.y = Math.sin(t / 1.5) / 10
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 15]} />
      <MeshDistortMaterial
        color="#28829E"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={1}
        emissive="#0EA5E9" // Glow effect
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

function WireframeWrapper() {
   const meshRef = useRef<THREE.Mesh>(null!)
   
   useFrame((state) => {
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.x = Math.cos(t / 4) / 2
    meshRef.current.rotation.y = Math.sin(t / 4) / 2
    meshRef.current.rotation.z = Math.sin(t / 1.5) / 2
   })

   return (
     <mesh ref={meshRef} scale={[1.2, 1.2, 1.2]}>
       <icosahedronGeometry args={[1, 1]} />
       <meshBasicMaterial color="#00FFFF" wireframe transparent opacity={0.1} />
     </mesh>
   )
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 4] }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* Brighter Lights */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} color="#0EA5E9" intensity={15} distance={20} />
        
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
           <TechShape />
           <WireframeWrapper />
        </Float>
        
        {/* Floating Particles for Depth */}
        <Sparkles count={100} scale={5} size={2} speed={0.4} opacity={0.5} color="#0EA5E9" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  )
}
