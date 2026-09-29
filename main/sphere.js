import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('earth');

if (canvas) {
    const scene = new THREE.Scene();

    const getDimensions = () => {
        const parent = canvas.parentElement;
        const width = parent ? parent.clientWidth : window.innerWidth;
        const height = parent ? parent.clientHeight : window.innerHeight;
        return { width, height };
    };

    const initialDim = getDimensions();

    const camera = new THREE.PerspectiveCamera(
        45,
        initialDim.width / initialDim.height,
        0.1,
        100
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(initialDim.width, initialDim.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('./asset/earth.png');
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
        map: earthTexture
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    window.addEventListener('resize', () => {
        const { width, height } = getDimensions();
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    function animate() {
        requestAnimationFrame(animate);
        earth.rotation.y += 0.005;
        renderer.render(scene, camera);
    }

    animate();
}
