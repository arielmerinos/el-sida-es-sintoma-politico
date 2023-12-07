import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { gsap } from 'gsap'

/**
 * Debug
 */
// const gui = new GUI()

const parameters = {
    materialColor: '#d71414'
}

// gui
//     .addColor(parameters, 'materialColor').onFinishChange(() => {
//         material.color.set(parameters.materialColor)
//     })
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * load texture
 */

const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('/textures/gradients/3.jpg')
// Might need to change the filter to NearestFilter or not
texture.magFilter = THREE.NearestFilter

const objLoader = new GLTFLoader()
objLoader.load(
    '/models/ribbon.glb',
    (gltf) => {
        gltf.scene.scale.set(1.2, 1.2, 1.2)
        gltf.scene.position.set(0, -1.5, -1)
        gltf.scene.children[0].material = material
        scene.add(gltf.scene)

    }
)

/**
 * Objects
 */

const material = new THREE.MeshToonMaterial({ color: parameters.materialColor, gradientMap: texture })


const objectsDistance = 4

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60), 
    material    
)

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32), 
    material  
)

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8,0.35, 100, 16), 
    material
)

/**
 * Positon
 */

mesh1.position.y = - objectsDistance * 0
mesh1.visible = false
mesh2.position.y = - objectsDistance * 1
mesh2.position.x = 1.5

mesh3.position.y = - objectsDistance * 2
mesh3.position.x = - 1.5
 

/**
 * Light
 */

const directionalLight = new THREE.DirectionalLight("#fffff", 5)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [mesh1, mesh2, mesh3]

// Particles
const particlesGeometry = new THREE.BufferGeometry()
const particlesCount = 8000
const positionArray = new Float32Array(particlesCount * 3)
for(let i = 0; i < particlesCount * 3; i++) {
    positionArray[i] = (Math.random() - 0.5) * 17
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
const particlesMaterial = new THREE.PointsMaterial({ size: 0.03, sizeAttenuation: true, color: parameters.materialColor, transparent: true, alphaMap: texture, alphaTest: 0.001 })

// Points

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock( )

console.log(scene)


/**
 * Scroll view
 */

let scrollY = window.scrollY

window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    console.log('scroll', scrollY)
})

/**
 * Cursor
 * 
 */
const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (event) => {
    console.log('the mouse just moved')
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
    console.log(event.clientX / sizes.width, event.clientY / sizes.height)
})

/**
 * Cursor section
 */

let previousTime = 0
let currentSection = 0

window.addEventListener('scroll', (event) => {
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)

    if(newSection !== currentSection) {
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation, 
            { 
                duration: 1.5, 
                ease: 'power1.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=3'
            }
        )

    }

})

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    
    // Animate camera

    camera.position.y = - scrollY / sizes.height * objectsDistance
    const parallaxX = cursor.x * 0.2
    const parallaxY = cursor.y * 0.2
    cameraGroup.position.x += ( parallaxX - cameraGroup.position.x ) * 2 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y ) * 2 * deltaTime
    camera.position.z = 6 + parallaxY
    camera.rotation.y = - parallaxX * 0.1
    camera.rotation.x = - parallaxY * 0.1


    for(const mesh of sectionMeshes) {
        mesh.rotation.y += deltaTime * 0.1
        mesh.rotation.x += deltaTime * 0.12
    }

    // Rotation of the ribbon mesh but applied to the whole group/camera
    // scene.children[4].rotation.z =  -  elapsedTime * 0.04
    // scene.children[4].rotation.x =  - Math.sin(elapsedTime * 0.01 * Math.PI) * 0.4
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()