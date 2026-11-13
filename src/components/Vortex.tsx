import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Particles() {
  const points = useRef<THREE.Points>(null)
  const count = 15000
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const blue = new THREE.Color('#3987ff')
    const orange = new THREE.Color('#ff773f')
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 12
      const radius = 0.25 + Math.random() * 4.4
      const depth = (Math.random() - 0.5) * 2.3
      positions[i * 3] = Math.cos(t) * radius
      positions[i * 3 + 1] = Math.sin(t) * radius * 0.53 + depth * 0.25
      positions[i * 3 + 2] = depth + Math.sin(t * 0.6) * radius * 0.12
      const color = blue.clone().lerp(orange, THREE.MathUtils.smoothstep(Math.sin(t + radius), 0.15, 0.9) * 0.74)
      colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b
    }
    return { positions, colors }
  }, [])
  useFrame((state, delta) => {
    if (points.current) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      points.current.rotation.z += delta * 0.025
      points.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.12
      points.current.position.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.08
    }
  })
  return <points ref={points}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /><bufferAttribute attach="attributes-color" args={[colors, 3]} /></bufferGeometry>
    <pointsMaterial size={0.012} vertexColors transparent opacity={0.82} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
  </points>
}

export default function Vortex() {
  return <div className="vortex" aria-hidden="true"><Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 8], fov: 48 }} gl={{ alpha: true, antialias: false }}><Particles /></Canvas></div>
}
