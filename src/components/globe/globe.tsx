"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useForecast } from '@/context/ForecastContext';

// Helper function to create weighted random color based on AQI
const getRandomColor = (aqi: number | undefined): THREE.Color => {
    const colors = [new THREE.Color(0x81C784), new THREE.Color(0xFFD54F), new THREE.Color(0xEF5350)]; // Good, Moderate, Poor
    if (aqi === undefined) {
        // Default random distribution if no forecast is available
        return colors[Math.floor(Math.random() * colors.length)];
    }

    let weights: number[];
    if (aqi <= 50) { // Good
        weights = [0.8, 0.15, 0.05]; // 80% green, 15% yellow, 5% red
    } else if (aqi <= 100) { // Moderate
        weights = [0.15, 0.7, 0.15]; // 15% green, 70% yellow, 15% red
    } else { // Unhealthy
        weights = [0.05, 0.15, 0.8]; // 5% green, 15% yellow, 80% red
    }

    const random = Math.random();
    let cumulativeWeight = 0;

    for (let i = 0; i < colors.length; i++) {
        cumulativeWeight += weights[i];
        if (random < cumulativeWeight) {
            return colors[i];
        }
    }
    return colors[0]; // Fallback
}


export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const dataPointsRef = useRef<THREE.Group>(new THREE.Group());
  const { forecast } = useForecast();

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

    globe.add(dataPointsRef.current);
    
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

  useEffect(() => {
    const dataPoints = dataPointsRef.current;
    if (!dataPoints) return;

    while (dataPoints.children.length) {
        dataPoints.remove(dataPoints.children[0]);
    }
    
    const dataPointGeometry = new THREE.SphereGeometry(0.015, 16, 16);
    const pointCount = forecast ? 500 : 300;

    for (let i = 0; i < pointCount; i++) {
        const color = getRandomColor(forecast?.currentAqi);
        const dataPointMaterial = new THREE.MeshBasicMaterial({ color });
        const dataPoint = new THREE.Mesh(dataPointGeometry, dataPointMaterial);
        dataPoint.position.setFromSphericalCoords(1.001, Math.random() * Math.PI, Math.random() * 2 * Math.PI);
        dataPoints.add(dataPoint);
    }

  }, [forecast]);

  return <div ref={mountRef} className="w-full h-full" data-ai-hint="earth map" />;
}
