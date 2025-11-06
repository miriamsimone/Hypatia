import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const STAR_COUNT = 420

export default function Scene3D() {
  const containerRef = useRef(null)
  const threeStateRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    )
    camera.position.set(0, 0, 20)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    container.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
    scene.add(ambientLight)

    const starField = createStarField()
    scene.add(starField.points)

    const gridSystem = createDynamicGrid()
    gridSystem.group.visible = false
    scene.add(gridSystem.group)

    const orbTimeline = createOrbTimeline()
    orbTimeline.group.visible = false
    scene.add(orbTimeline.group)

    const goldenPath = createGoldenPath(orbTimeline)
    goldenPath.group.visible = false
    scene.add(goldenPath.group)

    const clock = new THREE.Clock()
    let frameId

    const animate = () => {
      frameId = window.requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()
      updateStarField(starField, elapsed)
      updateGrid(gridSystem, elapsed)
      updateOrbTimeline(orbTimeline, elapsed)
      updateGoldenPath(goldenPath, orbTimeline, elapsed)
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      const { clientWidth, clientHeight } = containerRef.current
      renderer.setSize(clientWidth, clientHeight)
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    threeStateRef.current = {
      scene,
      camera,
      renderer,
      clock,
      frameId,
      objects: { starField, gridSystem, orbTimeline, goldenPath },
      controls: createSceneControls(gridSystem, orbTimeline),
    }

    const triggerOrbSequence = () => {
      const now = clock.getElapsedTime()

      if (!gridSystem.group.visible) {
        gridSystem.group.visible = true
        gridSystem.state.phase = 'fadeIn'
        gridSystem.state.timeline = now
      }

      if (!orbTimeline.group.visible) {
        orbTimeline.group.visible = true
      }

      const { state } = orbTimeline
      state.sequenceTriggered = true
      if (state.phase === 'idle') {
        state.phase = 'fadeIn'
        state.timeline = now
      }
      if (state.sequenceStart === null) {
        state.sequenceStart = now + state.sequenceLeadIn
      }
    }

    window.addEventListener('hypatia-orb-sequence', triggerOrbSequence)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('hypatia-orb-sequence', triggerOrbSequence)
      scene.remove(starField.points)
      starField.geometry.dispose()
      starField.material.dispose()
      scene.remove(gridSystem.group)
      gridSystem.dispose()
      scene.remove(orbTimeline.group)
      orbTimeline.dispose()
      scene.remove(goldenPath.group)
      goldenPath.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #050b18 0%, #10203a 60%, #0a1628 100%)',
        overflow: 'hidden',
      }}
    />
  )
}

function createSceneControls(gridSystem, orbTimeline) {
  return {
    showGrid: () => {
      const now = window.performance.now() / 1000
      gridSystem.state.timeline = now
      gridSystem.state.phase = 'fadeIn'
      gridSystem.group.visible = true
    },
    triggerOrbSequence: () => {
      window.dispatchEvent(new Event('hypatia-orb-sequence'))
    },
  }
}

function createStarField() {
  const geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(STAR_COUNT * 3)
  const colors = new Float32Array(STAR_COUNT * 3)
  const sizes = new Float32Array(STAR_COUNT)
  const phases = new Float32Array(STAR_COUNT)
  const speeds = new Float32Array(STAR_COUNT)
  const baseIntensities = new Float32Array(STAR_COUNT)

  const direction = new THREE.Vector3()

  for (let i = 0; i < STAR_COUNT; i++) {
    direction.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
    direction.normalize().multiplyScalar(THREE.MathUtils.randFloat(18, 45))

    const idx = i * 3
    positions[idx] = direction.x
    positions[idx + 1] = direction.y
    positions[idx + 2] = direction.z

    const base = THREE.MathUtils.randFloat(0.4, 0.8)
    baseIntensities[i] = base
    colors[idx] = base
    colors[idx + 1] = Math.min(1, base + 0.08)
    colors[idx + 2] = Math.min(1, base + 0.2)

     sizes[i] = THREE.MathUtils.randFloat(0.45, 1.8)

    phases[i] = Math.random() * Math.PI * 2
    speeds[i] = THREE.MathUtils.randFloat(0.35, 1.1)
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
  geometry.setAttribute(
    'opacity',
    new THREE.Float32BufferAttribute(baseIntensities.slice(), 1)
  )

  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {},
    vertexShader: `
      attribute float size;
      attribute float opacity;
      varying vec3 vColor;
      varying float vOpacity;

      void main() {
        vColor = color;
        vOpacity = opacity;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        float attenuatedSize = size * (60.0 / -mvPosition.z);
        gl_PointSize = max(0.5, attenuatedSize);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vOpacity;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.0, dist);
        gl_FragColor = vec4(vColor, alpha * vOpacity);
      }
    `,
  })

  const points = new THREE.Points(geometry, material)

  return { points, geometry, material, phases, speeds, baseIntensities }
}

function updateStarField(starField, elapsed) {
  const { geometry, phases, speeds, baseIntensities } = starField
  const colors = geometry.attributes.color.array
  const opacities = geometry.attributes.opacity.array

  for (let i = 0; i < baseIntensities.length; i++) {
    const idx = i * 3
    const twinkle = Math.pow(Math.sin(elapsed * speeds[i] + phases[i]) * 0.5 + 0.5, 2)
    const intensity = THREE.MathUtils.clamp(baseIntensities[i] * (0.3 + 0.7 * twinkle), 0.25, 1)

    colors[idx] = intensity
    colors[idx + 1] = Math.min(1, intensity + 0.12)
    colors[idx + 2] = Math.min(1, intensity + 0.28)

    opacities[i] = intensity
  }

  geometry.attributes.color.needsUpdate = true
  geometry.attributes.opacity.needsUpdate = true
}

function createDynamicGrid() {
  const group = new THREE.Group()
  group.visible = false
  group.position.set(0, 0, -3)
  group.rotation.set(THREE.MathUtils.degToRad(-12), THREE.MathUtils.degToRad(36), 0)

  const size = 18
  const divisions = 18
  const halfSize = size / 2
  const step = size / divisions

  const positions = []

  for (let yi = 0; yi <= divisions; yi++) {
    const y = -halfSize + yi * step
    for (let zi = 0; zi <= divisions; zi++) {
      const z = -halfSize + zi * step
      positions.push(-halfSize, y, z, halfSize, y, z)
    }
  }

  for (let xi = 0; xi <= divisions; xi++) {
    const x = -halfSize + xi * step
    for (let zi = 0; zi <= divisions; zi++) {
      const z = -halfSize + zi * step
      positions.push(x, -halfSize, z, x, halfSize, z)
    }
  }

  for (let xi = 0; xi <= divisions; xi++) {
    const x = -halfSize + xi * step
    for (let yi = 0; yi <= divisions; yi++) {
      const y = -halfSize + yi * step
      positions.push(x, y, -halfSize, x, y, halfSize)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  const lineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(0x5ed9ff),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const gridLines = new THREE.LineSegments(geometry, lineMaterial)
  gridLines.name = 'gridLines'
  group.add(gridLines)

  const state = {
    group,
    gridLines,
    timeline: 0,
    phase: 'idle',
  }

  return {
    group,
    gridLines,
    state,
    dispose: () => {
      geometry.dispose()
      lineMaterial.dispose()
    },
  }
}

function updateGrid(gridSystem, elapsed) {
  const { state, gridLines } = gridSystem

  if (state.phase === 'idle') {
    return
  }

  const localTime = elapsed - state.timeline

  if (state.phase === 'fadeIn') {
    const progress = THREE.MathUtils.clamp(localTime / 1.2, 0, 1)
    gridLines.material.opacity = THREE.MathUtils.lerp(0, 0.58, progress)
    gridLines.material.needsUpdate = true

    if (progress >= 1) {
      state.phase = 'pulse'
      state.timeline = elapsed
    }
  } else if (state.phase === 'pulse') {
    const pulse = (Math.sin(localTime * 1.4) + 1) / 2
    gridLines.material.opacity = THREE.MathUtils.lerp(0.45, 0.6, pulse)
  }
}

function createOrbTimeline() {
  const group = new THREE.Group()
  group.position.set(0, 0.4, -2.2)
  group.rotation.set(THREE.MathUtils.degToRad(-8), THREE.MathUtils.degToRad(38), 0)

  const timeline = new THREE.Group()
  timeline.name = 'orbTimeline'
  group.add(timeline)

  const orbGeometry = new THREE.SphereGeometry(0.22, 32, 32)
  const baseMaterials = {
    red: new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xff4d6d),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      emissive: new THREE.Color(0x44111a),
      emissiveIntensity: 0.35,
    }),
    blue: new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x4da6ff),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      emissive: new THREE.Color(0x122445),
      emissiveIntensity: 0.35,
    }),
  }

  const timeSlices = 3
  const sliceSpacing = 3.2
  const orbSeparation = 1.45
  const sliceScales = [1.8, 1.1, 0.55]

  const orbs = []

  for (let i = 0; i < timeSlices; i++) {
    const timeGroup = new THREE.Group()
    timeGroup.position.set(0, 0, -sliceSpacing * i)
    timeline.add(timeGroup)

    const redOrb = new THREE.Mesh(orbGeometry, baseMaterials.red.clone())
    const sliceScale = sliceScales[i]
    const separation = orbSeparation * sliceScale

    redOrb.position.set(-separation / 2, 0, 0)
    redOrb.scale.setScalar(sliceScale)
    timeGroup.add(redOrb)
    redOrb.userData.baseColor = redOrb.material.color.clone()
    redOrb.userData.baseEmissive = redOrb.material.emissive?.clone()
    redOrb.userData.baseEmissiveIntensity = redOrb.material.emissiveIntensity
    orbs.push({
      mesh: redOrb,
      basePosition: redOrb.position.clone(),
      phase: Math.random() * Math.PI * 2,
      baseScale: sliceScales[i],
      sliceIndex: i,
      color: 'red',
    })

    const blueOrb = new THREE.Mesh(orbGeometry, baseMaterials.blue.clone())
    blueOrb.position.set(separation / 2, 0, 0)
    blueOrb.scale.setScalar(sliceScale)
    timeGroup.add(blueOrb)
    blueOrb.userData.baseColor = blueOrb.material.color.clone()
    blueOrb.userData.baseEmissive = blueOrb.material.emissive?.clone()
    blueOrb.userData.baseEmissiveIntensity = blueOrb.material.emissiveIntensity
    orbs.push({
      mesh: blueOrb,
      basePosition: blueOrb.position.clone(),
      phase: Math.random() * Math.PI * 2 + Math.PI / 3,
      baseScale: sliceScales[i],
      sliceIndex: i,
      color: 'blue',
    })
  }

  const sequenceTargets = [
    orbs.find((orb) => orb.color === 'red' && orb.sliceIndex === 0),
    orbs.find((orb) => orb.color === 'blue' && orb.sliceIndex === 1),
    orbs.find((orb) => orb.color === 'red' && orb.sliceIndex === 2),
  ].filter(Boolean)

  const state = {
    orbs,
    floatAmplitude: 0.25,
    pulseStrength: 0.2,
    phase: 'idle',
    timeline: 0,
    fadeDuration: 2.4,
    sequenceTargets,
    sequenceStart: null,
    sequenceLeadIn: 2.4,
    activeDuration: 2.8,
    pauseDuration: 4,
    activeIndex: -1,
    sequenceTriggered: false,
  }

  return {
    group,
    timeline,
    state,
    dispose: () => {
      orbGeometry.dispose()
      timeline.traverse((child) => {
        if (child.isMesh) {
          child.material.dispose()
        }
      })
    },
  }
}

function updateOrbTimeline(orbTimeline, elapsed) {
  const state = orbTimeline.state
  const {
    orbs,
    floatAmplitude,
    pulseStrength,
    fadeDuration,
    sequenceTargets,
    sequenceLeadIn,
    activeDuration,
    pauseDuration,
    sequenceTriggered,
  } = state

  if (state.phase === 'idle' && sequenceTriggered) {
    state.phase = 'fadeIn'
    state.timeline = elapsed
  }

  let fadeAlpha = 0

  if (state.phase === 'fadeIn') {
    const progress = THREE.MathUtils.clamp((elapsed - state.timeline) / fadeDuration, 0, 1)
    fadeAlpha = progress

    if (progress >= 1) {
      state.phase = 'pulse'
      state.timeline = elapsed
      fadeAlpha = 1
    }
  } else if (state.phase === 'pulse') {
    fadeAlpha = 1
  }

  let activeMesh = null
  if (state.phase === 'pulse' && sequenceTargets.length > 0 && sequenceTriggered) {
    if (state.sequenceStart === null) {
      state.sequenceStart = elapsed + sequenceLeadIn
    }

    const sequenceElapsed = elapsed - state.sequenceStart
    if (sequenceElapsed >= 0) {
      const sequenceActiveSpan = sequenceTargets.length * activeDuration
      const cycleDuration = sequenceActiveSpan + pauseDuration
      const cycleTime = ((sequenceElapsed % cycleDuration) + cycleDuration) % cycleDuration

      if (cycleTime < sequenceActiveSpan) {
        const index = Math.floor(cycleTime / activeDuration)
        state.activeIndex = index
        activeMesh = sequenceTargets[index]?.mesh ?? null
      } else {
        state.activeIndex = -1
      }
    } else {
      state.activeIndex = -1
    }
  }

  const floatSpeed = 0.55
  const pulseSpeed = 1.0

  for (let i = 0; i < orbs.length; i++) {
    const { mesh, basePosition, phase, baseScale } = orbs[i]
    const floatOffset = Math.sin(elapsed * floatSpeed + phase)
    const pulse = THREE.MathUtils.lerp(0.5, 1, (Math.sin(elapsed * pulseSpeed + phase) + 1) / 2)

    mesh.position.y = basePosition.y + floatOffset * floatAmplitude
    const pulseScale = baseScale * (1 + pulse * pulseStrength * 0.5)
    const easedScale = THREE.MathUtils.lerp(baseScale * 0.7, pulseScale, fadeAlpha)
    const isActive = activeMesh === mesh
    const activeScale = isActive ? easedScale * 1.6 : easedScale
    mesh.scale.setScalar(activeScale)

    const baseOpacity = fadeAlpha * THREE.MathUtils.lerp(0.35, 0.7, pulse)

    if (isActive) {
      mesh.material.color.setHex(0xffcc66)
      mesh.material.emissive?.setHex(0xffcc66)
      mesh.material.emissiveIntensity = 2.2
      mesh.material.opacity = 1
    } else {
      const targetColor = mesh.userData.baseColor
      if (targetColor) {
        mesh.material.color.copy(targetColor)
      }
      if (mesh.userData.baseEmissive) {
        mesh.material.emissive.copy(mesh.userData.baseEmissive)
      }
      mesh.material.emissiveIntensity = mesh.userData.baseEmissiveIntensity ?? 0
      mesh.material.opacity = THREE.MathUtils.clamp(baseOpacity, 0, 1)
    }
  }
}

function createGoldenPath(orbTimeline) {
  const group = new THREE.Group()
  group.name = 'goldenPath'
  group.position.set(0, 0.4, -2.2)
  group.rotation.set(THREE.MathUtils.degToRad(-8), THREE.MathUtils.degToRad(38), 0)

  const tubularSegments = 160
  const radius = 0.5
  const radialSegments = 16

  const controlPoints = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
  const curve = new THREE.CatmullRomCurve3(controlPoints.map((p) => p.clone()), false, 'catmullrom', 0.65)

  const geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false)

  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff00ff),
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.frustumCulled = false
  group.add(mesh)

  const targetMeshes = [
    orbTimeline.state.orbs[0]?.mesh ?? null,
    orbTimeline.state.orbs[1]?.mesh ?? null,
    orbTimeline.state.orbs[2]?.mesh ?? null,
  ].filter(Boolean)

  console.log('[Scene3D] Golden path created. Target meshes found:', targetMeshes.length)

  const state = {
    curve,
    tubularSegments,
    radius,
    radialSegments,
    material,
    mesh,
    tempPoints: controlPoints.map((p) => p.clone()),
    targetMeshes,
    phase: 'alwaysOn',
    timeline: 0,
    delay: 0,
    drawDuration: 0,
    progress: 1,
    loggedOnce: false,
  }

  return {
    group,
    state,
    dispose: () => {
      if (state.mesh?.geometry) {
        state.mesh.geometry.dispose()
      } else {
        geometry.dispose()
      }
      material.dispose()
    },
  }
}

function updateGoldenPath(goldenPath, orbTimeline, elapsed) {
  const { state, group } = goldenPath
  const { mesh, curve, tempPoints, tubularSegments, radius, radialSegments, targetMeshes } = state

  if (targetMeshes.length < 3) {
    console.log('[Scene3D] Golden path update skipped. Not enough target meshes:', targetMeshes.length)
    return
  }

  for (let i = 0; i < targetMeshes.length; i++) {
    targetMeshes[i].getWorldPosition(tempPoints[i])
    group.worldToLocal(tempPoints[i])
    curve.points[i].copy(tempPoints[i])
  }

  const oldGeometry = mesh.geometry
  mesh.geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false)
  oldGeometry.dispose()

  state.progress = 1
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
