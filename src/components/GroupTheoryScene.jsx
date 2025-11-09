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

  // Arms
  const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8)
  const armMaterial = new THREE.MeshPhongMaterial({ color: 0x00ccff })

  const leftArm = new THREE.Mesh(armGeometry, armMaterial)
  leftArm.position.set(-0.3, 0.9, 0)
  leftArm.rotation.z = Math.PI / 6
  robot.add(leftArm)

  const rightArm = new THREE.Mesh(armGeometry, armMaterial)
  rightArm.position.set(0.3, 0.9, 0)
  rightArm.rotation.z = -Math.PI / 6
  robot.add(rightArm)

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

function GroupTheoryScene() {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const robotRef = useRef(null)

  const [position, setPosition] = useState(0)
  const [moveSequence, setMoveSequence] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const mountElement = mountRef.current
    if (!mountElement) return

    // Listen for group theory animation events from chat
    const handleGroupTheoryAnimation = (event) => {
      const { moves } = event.detail
      if (moves && Array.isArray(moves)) {
        animateSequence(moves)
      }
    }

    // Listen for reset events from chat
    const handleGroupTheoryReset = () => {
      setPosition(0)
      setMoveSequence([])
      if (robotRef.current) {
        robotRef.current.position.x = 0
      }
    }

    window.addEventListener('hypatia-group-theory-animate', handleGroupTheoryAnimation)
    window.addEventListener('hypatia-group-theory-reset', handleGroupTheoryReset)

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountElement.clientWidth / mountElement.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 3, 8)
    camera.lookAt(0, 1, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(mountElement.clientWidth, mountElement.clientHeight)
    mountElement.appendChild(renderer.domElement)

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

    // Animation loop
    let frameId = null
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const handleResize = () => {
      const { clientWidth, clientHeight } = mountElement
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('hypatia-group-theory-animate', handleGroupTheoryAnimation)
      window.removeEventListener('hypatia-group-theory-reset', handleGroupTheoryReset)
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
    }
  }, [])

  const animateStep = (direction, onComplete) => {
    if (!robotRef.current) return

    const robot = robotRef.current
    const startX = robot.position.x
    const endX = startX + direction
    const startTime = Date.now()
    const duration = 500 // ms

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
    if (!Array.isArray(moves) || moves.length === 0 || isAnimating) return

    setIsAnimating(true)
    let currentIndex = 0

    const animateNext = () => {
      if (currentIndex >= moves.length) {
        setIsAnimating(false)
        return
      }

      const move = moves[currentIndex].toUpperCase()
      currentIndex++

      if (move === 'L') {
        setPosition(pos => pos - 1)
        setMoveSequence(seq => [...seq, 'L'])
        animateStep(-1, animateNext)
      } else if (move === 'R') {
        setPosition(pos => pos + 1)
        setMoveSequence(seq => [...seq, 'R'])
        animateStep(1, animateNext)
      } else {
        // Skip invalid moves
        animateNext()
      }
    }

    animateNext()
  }

  const handleLeft = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setPosition(pos => pos - 1)
    setMoveSequence(seq => [...seq, 'L'])
    animateStep(-1, () => setIsAnimating(false))
  }

  const handleRight = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setPosition(pos => pos + 1)
    setMoveSequence(seq => [...seq, 'R'])
    animateStep(1, () => setIsAnimating(false))
  }

  const handleReset = () => {
    if (isAnimating) return
    setPosition(0)
    setMoveSequence([])
    if (robotRef.current) {
      robotRef.current.position.x = 0
    }
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full bg-gray-900" />

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-col gap-4">
        {/* Move sequence */}
        <div className="bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm text-gray-400 mb-2">Move Sequence:</div>
          <div className="flex gap-2 flex-wrap">
            {moveSequence.length === 0 ? (
              <span className="text-gray-500 italic">No moves yet</span>
            ) : (
              moveSequence.map((move, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded font-mono"
                >
                  {move}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Current position */}
        <div className="bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm text-gray-400 mb-1">Current Position:</div>
          <div className="text-3xl font-bold text-cyan-400 font-mono">{position}</div>
        </div>

        {/* Control buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleLeft}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
            disabled={isAnimating}
          >
            L (Step Left)
          </button>
          <button
            onClick={handleRight}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
            disabled={isAnimating}
          >
            R (Step Right)
          </button>
          <button
            onClick={handleReset}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            disabled={isAnimating}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupTheoryScene
