import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function PythagoreanScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mountElement = mountRef.current
    if (!mountElement) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(
      45,
      mountElement.clientWidth / mountElement.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(mountElement.clientWidth, mountElement.clientHeight)
    mountElement.appendChild(renderer.domElement)

    const boxGroup = new THREE.Group()

    const boxGeometry = new THREE.BoxGeometry(3, 4, 5)
    const boxEdges = new THREE.EdgesGeometry(boxGeometry)
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff })
    const boxWireframe = new THREE.LineSegments(boxEdges, edgeMaterial)
    boxGroup.add(boxWireframe)

    const diagonalGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.5, -2, -2.5),
      new THREE.Vector3(1.5, 2, 2.5),
    ])
    const diagonalMaterial = new THREE.LineBasicMaterial({ color: 0xffd700 })
    const diagonalLine = new THREE.Line(diagonalGeometry, diagonalMaterial)
    boxGroup.add(diagonalLine)

    scene.add(boxGroup)

    let frameId = null
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      boxGroup.rotation.x += 0.002
      boxGroup.rotation.y += 0.002
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      const { clientWidth, clientHeight } = mountElement
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
      window.removeEventListener('resize', handleResize)
      mountElement.removeChild(renderer.domElement)

      boxGeometry.dispose()
      boxEdges.dispose()
      edgeMaterial.dispose()
      diagonalGeometry.dispose()
      diagonalMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full bg-black" />
}

export default PythagoreanScene


