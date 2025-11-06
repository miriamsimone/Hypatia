import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { TorusGeometry, BufferGeometry, Float32BufferAttribute } from 'three'

export default function GlowingCircle() {
  const meshRef = useRef()
  const particleSystemRef = useRef()
  
  // Create particle trail
  const particleCount = 100
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(positions, 3))
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Rotate the circle
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.5
      meshRef.current.rotation.y = time * 0.3
    }
    
    // Update particle trail
    if (particleSystemRef.current) {
      const positions = particleSystemRef.current.geometry.attributes.position.array
      const radius = 2
      const angle = time * 2
      
      // Shift particles back
      for (let i = particleCount - 1; i > 0; i--) {
        positions[i * 3] = positions[(i - 1) * 3]
        positions[i * 3 + 1] = positions[(i - 1) * 3 + 1]
        positions[i * 3 + 2] = positions[(i - 1) * 3 + 2]
      }
      
      // Add new particle at current position
      positions[0] = Math.cos(angle) * radius
      positions[1] = Math.sin(angle) * radius
      positions[2] = Math.sin(time) * 0.5
      
      particleSystemRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <>
      {/* Glowing circle (torus) */}
      <mesh ref={meshRef}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Particle trail */}
      <points ref={particleSystemRef} geometry={particles}>
        <pointsMaterial 
          size={0.1} 
          color="#ffff00" 
          transparent 
          opacity={0.8}
        />
      </points>
    </>
  )
}




