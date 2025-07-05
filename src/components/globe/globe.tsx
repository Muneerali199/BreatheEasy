
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

  const intersectedPointRef = useRef<THREE.Object3D | null>(null);

  // Effect to update data points when forecast changes
  useEffect(() => {
      const dataPoints = dataPointsRef.current;
      if (!dataPoints) return;

      // Clear existing points
      while (dataPoints.children.length) {
          dataPoints.remove(dataPoints.children[0]);
      }
      
      const dataPointGeometry = new THREE.SphereGeometry(0.01, 16, 16);
      const pointCount = forecast ? 500 : 300;

      for (let i = 0; i < pointCount; i++) {
          const color = getRandomColor(forecast?.currentAqi);
          const dataPointMaterial = new THREE.MeshBasicMaterial({ color });
          const dataPoint = new THREE.Mesh(dataPointGeometry, dataPointMaterial);
          
          // Set random position on the sphere's surface
          dataPoint.position.setFromSphericalCoords(1.001, Math.random() * Math.PI, Math.random() * 2 * Math.PI);
          
          // Store original scale for hover effect
          dataPoint.userData.originalScale = dataPoint.scale.clone();

          dataPoints.add(dataPoint);
      }
  }, [forecast]);

  // Effect for initial setup and animation loop
  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;

    const currentMount = mountRef.current;

    // --- Basic Setup ---
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
    controls.enableZoom = false; // Zoom can interfere with hover
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI - Math.PI / 4;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;

    // --- Globe Mesh ---
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
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.9,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Add the data points group to the globe
    globe.add(dataPointsRef.current);

    // --- Atmosphere ---
    const atmosphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vertexNormal;
            void main() {
                vertexNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vertexNormal;
            void main() {
                float intensity = pow(0.4 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.scale.set(1.15, 1.15, 1.15);
    scene.add(atmosphere);
    
    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100); // Initialize off-screen
    
    const handleMouseMove = (event: MouseEvent) => {
        if (!currentMount) return;
        const rect = currentMount.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    currentMount.addEventListener('mousemove', handleMouseMove);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);

        // Interaction logic
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(dataPointsRef.current.children);

        if (intersects.length > 0) {
            const newIntersected = intersects[0].object;
            if (intersectedPointRef.current !== newIntersected) {
                // Reset old point
                if (intersectedPointRef.current) {
                    intersectedPointRef.current.scale.copy(intersectedPointRef.current.userData.originalScale);
                }
                // Scale up new point
                intersectedPointRef.current = newIntersected;
            }
        } else {
             // Reset if no intersection
            if (intersectedPointRef.current) {
                intersectedPointRef.current.scale.copy(intersectedPointRef.current.userData.originalScale);
                intersectedPointRef.current = null;
            }
        }

        // Apply smooth scaling to intersected point
        dataPointsRef.current.children.forEach(point => {
            if (point === intersectedPointRef.current) {
                point.scale.lerp(new THREE.Vector3(3, 3, 3), 0.2);
            } else {
                point.scale.lerp(point.userData.originalScale, 0.2);
            }
        });


        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    // --- Resize Handling ---
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(currentMount);

    // --- Cleanup ---
    return () => {
      resizeObserver.unobserve(currentMount);
      currentMount.removeEventListener('mousemove', handleMouseMove);
      if (currentMount && renderer.domElement) {
          currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" data-ai-hint="earth map" />;
}
