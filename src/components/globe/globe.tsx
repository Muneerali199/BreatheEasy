"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;

    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI - Math.PI / 3;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      'https://placehold.co/2048x1024.png',
      (texture) => {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
    );
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      color: 0xcccccc,
      metalness: 0.2,
      roughness: 0.8,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    const dataPointGeometry = new THREE.SphereGeometry(0.015, 16, 16);
    const colors = [new THREE.Color(0xA5D6A7), new THREE.Color(0xFFD54F), new THREE.Color(0xEF5350)];
    for (let i = 0; i < 300; i++) {
        const phi = Math.acos(-1 + (2 * i) / 300);
        const theta = Math.sqrt(300 * Math.PI) * phi;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dataPointMaterial = new THREE.MeshBasicMaterial({ color });
        const dataPoint = new THREE.Mesh(dataPointGeometry, dataPointMaterial);
        dataPoint.position.setFromSphericalCoords(1.001, Math.random() * Math.PI, Math.random() * 2 * Math.PI);
        globe.add(dataPoint);
    }
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(currentMount);

    return () => {
      resizeObserver.unobserve(currentMount);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" data-ai-hint="earth map" />;
}
