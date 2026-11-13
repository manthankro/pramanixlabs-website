import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BLUE = '#3f8cff'
const ICE = '#e6f0ff'
const ORANGE = '#ff8a5c'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

/** A soft round sprite, so particles read as light rather than squares. */
function createParticleTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.32, 'rgba(255,255,255,0.62)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

type Cloud = {
  positions: Float32Array
  colors: Float32Array
}

/**
 * Three particle populations on one spiral: a dense luminous core, three
 * logarithmic arms and a sparse halo that gives the scene depth.
 */
function buildSpiral(count: number): Cloud {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const blue = new THREE.Color(BLUE)
  const ice = new THREE.Color(ICE)
  const orange = new THREE.Color(ORANGE)
  const arms = 3
  const turns = 2.55

  for (let i = 0; i < count; i++) {
    const halo = i % 11 === 0
    const angleSeed = Math.random()
    let radius: number
    let theta: number
    let lift: number

    if (halo) {
      radius = 5.2 + Math.random() * 3.4
      theta = Math.random() * Math.PI * 2
      lift = (Math.random() - 0.5) * 3.2
    } else {
      // Denser toward the core, thin and loose toward the rim.
      const t = Math.pow(angleSeed, 1.45)
      radius = 0.34 + t * 4.85
      theta = (i % arms) * ((Math.PI * 2) / arms) + t * turns * Math.PI * 2 + (Math.random() - 0.5) * 0.55
      lift = (Math.random() - 0.5) * (0.16 + radius * 0.09)
    }

    positions[i * 3] = Math.cos(theta) * radius + (Math.random() - 0.5) * 0.06
    positions[i * 3 + 1] = Math.sin(theta) * radius + (Math.random() - 0.5) * 0.06
    positions[i * 3 + 2] = lift

    const core = 1 - Math.min(radius / 3.1, 1)
    const color = radius < 1.05 ? ice.clone().lerp(blue, 0.25) : blue.clone().lerp(ice, core * 0.34)
    if (!halo && radius > 1.5 && Math.random() < 0.045) color.lerp(orange, 0.72)
    else if (Math.random() < 0.08) color.lerp(ice, 0.45)

    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  return { positions, colors }
}

function Spiral({ paused }: { paused: boolean }) {
  const group = useRef<THREE.Group>(null)
  const texture = useMemo(() => createParticleTexture(), [])
  const pointer = useRef({ x: 0, y: 0 })
  const compact = useMemo(
    () => typeof window !== 'undefined' && (window.innerWidth < 760 || (navigator.hardwareConcurrency ?? 8) < 4),
    [],
  )
  const count = compact ? 7200 : 13800
  const { positions, colors } = useMemo(() => buildSpiral(count), [count])

  useEffect(() => () => texture?.dispose(), [texture])

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state, delta) => {
    if (paused || !group.current) return
    const time = state.clock.elapsedTime
    const step = Math.min(delta, 0.05)
    group.current.rotation.z += step * 0.035
    group.current.rotation.x = -0.32 + Math.sin(time * 0.17) * 0.045
    group.current.rotation.y = Math.sin(time * 0.11) * 0.06

    const targetX = pointer.current.x * 0.45
    const targetY = 0.4 - pointer.current.y * 0.3
    state.camera.position.x += (targetX - state.camera.position.x) * 0.03
    state.camera.position.y += (targetY - state.camera.position.y) * 0.03
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <group ref={group} rotation={[-0.32, 0, 0]}>
      <sprite scale={[20, 20, 1]} position={[0, 0, -2.4]}>
        <spriteMaterial
          map={texture}
          color="#1f66d6"
          transparent
          opacity={0.34}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={texture}
          size={compact ? 0.085 : 0.072}
          vertexColors
          transparent
          opacity={0.92}
          sizeAttenuation
          depthWrite={false}
          alphaTest={0.001}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

export default function Vortex() {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [available] = useState(supportsWebGL)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const node = host.current
    if (!node || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '120px',
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Reduced motion and WebGL-less browsers get the still, designed composition.
  if (!available || reduced) {
    return (
      <div className="vortex" aria-hidden="true">
        <div className="vortex-fallback">
          <span className="vortex-ring ring-1" />
          <span className="vortex-ring ring-2" />
          <span className="vortex-ring ring-3" />
          <span className="vortex-core" />
        </div>
      </div>
    )
  }

  return (
    <div className="vortex" ref={host} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        flat
        camera={{ position: [0, 0.4, 12.2], fov: 44 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        frameloop={visible ? 'always' : 'demand'}
        performance={{ min: 0.5 }}
      >
        <Spiral paused={!visible} />
      </Canvas>
    </div>
  )
}
