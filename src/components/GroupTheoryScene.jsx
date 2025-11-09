import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function createRobotCharacter() {
  const robot = new THREE.Group()

  // Head - sphere
  const headGeometry = new THREE.SphereGeometry(0.3, 16, 16)
  const headMaterial = new THREE.MeshPhongMaterial({ color: 0x00ccff })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 1.5
  robot.add(head)

  // Face - simple eyes and smile
  const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8)
  const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 })

  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  leftEye.position.set(-0.1, 1.55, 0.25)
  robot.add(leftEye)

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  rightEye.position.set(0.1, 1.55, 0.25)
  robot.add(rightEye)

  // Smile - curved line
  const smileCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.15, 1.4, 0.25),
    new THREE.Vector3(0, 1.35, 0.25),
    new THREE.Vector3(0.15, 1.4, 0.25)
  )
  const smilePoints = smileCurve.getPoints(20)
  const smileGeometry = new THREE.BufferGeometry().setFromPoints(smilePoints)
  const smileMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
  const smile = new THREE.Line(smileGeometry, smileMaterial)
  robot.add(smile)

  // Body - cylinder
  const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 16)
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x00ccff })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 0.8
  robot.add(body)

  // Arms with hand signs
  const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8)
  const armMaterial = new THREE.MeshPhongMaterial({ color: 0x00ccff })

  // Left arm with "L" sign
  const leftArm = new THREE.Mesh(armGeometry, armMaterial)
  leftArm.position.set(-0.3, 0.9, 0)
  leftArm.rotation.z = Math.PI / 6
  robot.add(leftArm)

  // L sign on left hand
  const lSignGeometry = new THREE.CircleGeometry(0.12, 16)
  const lSignMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b9d, side: THREE.DoubleSide })
  const lSign = new THREE.Mesh(lSignGeometry, lSignMaterial)
  lSign.position.set(-0.42, 0.65, 0)
  robot.add(lSign)

  // L text (using a simple shape)
  const lTextGeometry = new THREE.BoxGeometry(0.02, 0.12, 0.01)
  const lTextMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const lText = new THREE.Mesh(lTextGeometry, lTextMaterial)
  lText.position.set(-0.42, 0.65, 0.01)
  robot.add(lText)

  // Right arm with "R" sign
  const rightArm = new THREE.Mesh(armGeometry, armMaterial)
  rightArm.position.set(0.3, 0.9, 0)
  rightArm.rotation.z = -Math.PI / 6
  robot.add(rightArm)

  // R sign on right hand
  const rSignGeometry = new THREE.CircleGeometry(0.12, 16)
  const rSignMaterial = new THREE.MeshBasicMaterial({ color: 0x6bff9d, side: THREE.DoubleSide })
  const rSign = new THREE.Mesh(rSignGeometry, rSignMaterial)
  rSign.position.set(0.42, 0.65, 0)
  robot.add(rSign)

  // R text (using a simple shape)
  const rTextGeometry = new THREE.BoxGeometry(0.02, 0.12, 0.01)
  const rTextMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const rText = new THREE.Mesh(rTextGeometry, rTextMaterial)
  rText.position.set(0.42, 0.65, 0.01)
  robot.add(rText)

  // Legs
  const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 8)
  const legMaterial = new THREE.MeshPhongMaterial({ color: 0x00ccff })

  const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
  leftLeg.position.set(-0.1, 0.05, 0)
  robot.add(leftLeg)
  robot.userData.leftLeg = leftLeg

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
  rightLeg.position.set(0.1, 0.05, 0)
  robot.add(rightLeg)
  robot.userData.rightLeg = rightLeg

  return robot
}

function createNumberLine() {
  const group = new THREE.Group()

  // Main line
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-10, 0, 0),
    new THREE.Vector3(10, 0, 0)
  ])
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
  const line = new THREE.Line(lineGeometry, lineMaterial)
  group.add(line)

  // Tick marks and labels
  for (let i = -10; i <= 10; i++) {
    const tickGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -0.1, 0),
      new THREE.Vector3(i, 0.1, 0)
    ])
    const tick = new THREE.Line(tickGeometry, lineMaterial)
    group.add(tick)
  }

  return group
}

function GroupTheoryScene({ spinEnabled = false }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const robotRef = useRef(null)

  const [position, setPosition] = useState(0)
  const [moveSequence, setMoveSequence] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isFacingBackward, setIsFacingBackward] = useState(false)

  useEffect(() => {
    const mountElement = mountRef.current
    if (!mountElement) return

    let cleanupFunctions = []
    let sceneInitialized = false

    // Listen for group theory animation events from chat
    const handleGroupTheoryAnimation = (event) => {
      console.log('🎬 Animation event received from chat:', event.detail)
      const { moves } = event.detail
      if (moves && Array.isArray(moves)) {
        animateSequence(moves)
      } else {
        console.log('⚠️ Invalid moves in event:', moves)
      }
    }

    // Listen for reset events from chat
    const handleGroupTheoryReset = () => {
      setPosition(0)
      setMoveSequence([])
      setIsFacingBackward(false)
      if (robotRef.current) {
        robotRef.current.position.x = 0
        robotRef.current.rotation.y = 0
      }
    }

    window.addEventListener('hypatia-group-theory-animate', handleGroupTheoryAnimation)
    window.addEventListener('hypatia-group-theory-reset', handleGroupTheoryReset)

    // Initialize the scene
    const initScene = () => {
      if (sceneInitialized) return

      const width = mountElement.clientWidth
      const height = mountElement.clientHeight

      console.log('Attempting to initialize scene:', { width, height })

      if (width === 0 || height === 0) {
        console.log('Container has no dimensions yet, waiting...')
        return
      }

      sceneInitialized = true
      console.log('✓ Initializing Three.js scene with dimensions:', width, height)

      // Scene setup
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1a1a2e)
      sceneRef.current = scene

      // Camera
      const camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        100
      )
      camera.position.set(0, 3, 8)
      camera.lookAt(0, 1, 0)
      console.log('✓ Camera created:', camera.position)

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(width, height)
      mountElement.appendChild(renderer.domElement)
      console.log('✓ Renderer created and canvas appended to DOM')
      console.log('  Canvas size:', renderer.domElement.width, 'x', renderer.domElement.height)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)

    // Number line
    const numberLine = createNumberLine()
    numberLine.position.y = -0.35
    scene.add(numberLine)

    // Robot
    const robot = createRobotCharacter()
    robot.position.set(0, 0, 0)
    scene.add(robot)
    robotRef.current = robot
    console.log('✓ Robot created and added to scene:', robot)
    console.log('  Robot position:', robot.position)
    console.log('  Robot children count:', robot.children.length)
    console.log('  Scene children count:', scene.children.length)

    // Animation loop
    let frameId = null
    let frameCount = 0
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      renderer.render(scene, camera)

      // Log first few frames to confirm animation is running
      if (frameCount < 3) {
        console.log(`Frame ${frameCount} rendered`)
        frameCount++
      }
    }
    animate()
    console.log('✓ Animation loop started')

      // Resize handler
      const handleResize = () => {
        const { clientWidth, clientHeight } = mountElement
        camera.aspect = clientWidth / clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(clientWidth, clientHeight)
      }

      window.addEventListener('resize', handleResize)

      // Store cleanup functions
      cleanupFunctions.push(() => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId)
        }
        window.removeEventListener('resize', handleResize)
        if (mountElement.contains(renderer.domElement)) {
          mountElement.removeChild(renderer.domElement)
        }
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        })
        renderer.dispose()
      })
    }

    // Use ResizeObserver to detect when container gets dimensions
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        console.log('ResizeObserver triggered:', entry.contentRect.width, entry.contentRect.height)
        initScene()
      }
    })

    resizeObserver.observe(mountElement)

    // Also try to initialize immediately in case container already has dimensions
    initScene()

    // Cleanup
    return () => {
      window.removeEventListener('hypatia-group-theory-animate', handleGroupTheoryAnimation)
      window.removeEventListener('hypatia-group-theory-reset', handleGroupTheoryReset)
      resizeObserver.disconnect()
      cleanupFunctions.forEach(fn => fn())
    }
  }, [])

  const animateStep = (move, currentOrientation, onComplete) => {
    if (!robotRef.current) return

    const robot = robotRef.current
    const startTime = Date.now()
    const duration = 500 // ms

    // Normalize move to lowercase
    const normalizedMove = move.toLowerCase()

    // Handle spin move
    if (normalizedMove === 's') {
      const startRotation = robot.rotation.y
      const endRotation = startRotation + Math.PI

      const spin = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Smooth rotation
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2

        robot.rotation.y = startRotation + (endRotation - startRotation) * eased

        if (progress < 1) {
          requestAnimationFrame(spin)
        } else {
          // Normalize rotation to 0 or π
          robot.rotation.y = robot.rotation.y % (Math.PI * 2)
          if (onComplete) onComplete()
        }
      }

      spin()
      return
    }

    // Handle a/b moves with orientation
    const startX = robot.position.x
    let direction = 0

    // When facing backward, a and b are reversed
    if (normalizedMove === 'a') {
      direction = currentOrientation ? 1 : -1 // backward: +1, forward: -1
    } else if (normalizedMove === 'b') {
      direction = currentOrientation ? -1 : 1 // backward: -1, forward: +1
    }

    const endX = startX + direction

    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Smooth movement
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      robot.position.x = startX + (endX - startX) * eased

      // Walking animation - alternate leg swing
      const walkCycle = Math.sin(progress * Math.PI * 4)
      if (robot.userData.leftLeg) {
        robot.userData.leftLeg.rotation.x = walkCycle * 0.3
      }
      if (robot.userData.rightLeg) {
        robot.userData.rightLeg.rotation.x = -walkCycle * 0.3
      }

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        // Reset leg positions
        if (robot.userData.leftLeg) robot.userData.leftLeg.rotation.x = 0
        if (robot.userData.rightLeg) robot.userData.rightLeg.rotation.x = 0
        if (onComplete) onComplete()
      }
    }

    step()
  }

  const animateSequence = (moves) => {
    if (!Array.isArray(moves) || moves.length === 0) {
      console.log('⚠️ animateSequence called with invalid moves:', moves)
      return
    }

    if (isAnimating) {
      console.log('⚠️ Animation already in progress, ignoring new sequence:', moves)
      return
    }

    console.log('▶️ Starting animation sequence:', moves.join(''), `(${moves.length} moves)`)
    setIsAnimating(true)
    let currentIndex = 0
    let currentOrientation = isFacingBackward

    const animateNext = () => {
      if (currentIndex >= moves.length) {
        console.log('✅ Animation sequence complete')
        setIsAnimating(false)
        return
      }

      const move = moves[currentIndex].toLowerCase()
      console.log(`  Move ${currentIndex + 1}/${moves.length}: ${move}`)
      currentIndex++

      if (move === 's') {
        // Spin doesn't change position, only orientation
        setMoveSequence(seq => [...seq, 's'])
        currentOrientation = !currentOrientation
        setIsFacingBackward(currentOrientation)
        animateStep('s', currentOrientation, animateNext)
      } else if (move === 'a') {
        // a direction depends on orientation
        const posChange = currentOrientation ? 1 : -1
        console.log(`    Position change: ${posChange} (orientation: ${currentOrientation ? 'backward' : 'forward'})`)
        setPosition(pos => {
          console.log(`    Position: ${pos} → ${pos + posChange}`)
          return pos + posChange
        })
        setMoveSequence(seq => [...seq, 'a'])
        animateStep('a', currentOrientation, animateNext)
      } else if (move === 'b') {
        // b direction depends on orientation
        const posChange = currentOrientation ? -1 : 1
        console.log(`    Position change: ${posChange} (orientation: ${currentOrientation ? 'backward' : 'forward'})`)
        setPosition(pos => {
          console.log(`    Position: ${pos} → ${pos + posChange}`)
          return pos + posChange
        })
        setMoveSequence(seq => [...seq, 'b'])
        animateStep('b', currentOrientation, animateNext)
      } else {
        // Skip invalid moves
        console.log(`    Skipping invalid move: ${move}`)
        animateNext()
      }
    }

    animateNext()
  }


  return (
    <div className="w-full h-full flex flex-col">
      {/* Status display at top */}
      <div className="p-3 bg-gray-900 flex gap-2 border-b border-gray-800 shrink-0">
        <div className="flex-1 bg-gray-800/90 rounded-lg p-2">
          <div className="text-xs text-gray-400 mb-1">Current Sequence:</div>
          <div className="flex gap-1 flex-wrap min-h-[24px]">
            {moveSequence.length === 0 ? (
              <span className="text-xs text-gray-500 italic">e (identity)</span>
            ) : (
              moveSequence.map((move, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-mono text-xs"
                >
                  {move === 'b' ? 'a⁻¹' : move}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-800/90 rounded-lg p-2 min-w-[100px]">
          <div className="text-xs text-gray-400 mb-1">Position:</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{position}</div>
        </div>

        {/* Orientation indicator (only show when spin enabled) */}
        {spinEnabled && (
          <div className="bg-gray-800/90 rounded-lg p-2">
            <div className="text-xs text-gray-400 mb-1">Facing:</div>
            <div className="text-sm font-bold" style={{ color: isFacingBackward ? '#ff6b9d' : '#6bff9d' }}>
              {isFacingBackward ? 'Backward ←' : 'Forward →'}
            </div>
          </div>
        )}
      </div>

      {/* 3D Canvas */}
      <div ref={mountRef} className="flex-1 w-full overflow-hidden" style={{
        background: 'linear-gradient(180deg, #050b18 0%, #10203a 60%, #0a1628 100%)'
      }} />
    </div>
  )
}

export default GroupTheoryScene
