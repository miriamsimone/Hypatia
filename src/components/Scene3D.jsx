import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import GlowingCircle from './GlowingCircle'

export default function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <GlowingCircle />
      <OrbitControls />
    </Canvas>
  )
}

