import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const InteractiveCanvas3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 280;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 2. Lighting setup
    const ambientLight = new THREE.AmbientLight(0xfff4d8, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xF6DFA6, 2.5, 30);
    pointLight1.position.set(5, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xc9833b, 3, 25);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    // 3. Central Morphing Geometric Sculpture (Spline / Peachweb style)
    // Core Icosahedron with wireframe accent & particle swarm
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner smooth glass-like crystal
    const crystalGeo = new THREE.IcosahedronGeometry(1.65, 1);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xF6DFA6,
      emissive: 0xc9833b,
      emissiveIntensity: 0.22,
      roughness: 0.18,
      metalness: 0.35,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.88,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    coreGroup.add(crystalMesh);

    // Outer orbiting floating wireframe ring
    const torusGeo = new THREE.TorusGeometry(2.4, 0.04, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xF6DFA6,
      emissive: 0xc9833b,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.2,
    });
    const torus1 = new THREE.Mesh(torusGeo, torusMat);
    torus1.rotation.x = Math.PI / 3;
    torus1.rotation.y = Math.PI / 4;
    coreGroup.add(torus1);

    const torus2 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.025, 16, 100), new THREE.MeshStandardMaterial({
      color: 0xa89f94,
      emissive: 0xF6DFA6,
      emissiveIntensity: 0.15,
      metalness: 0.7,
      roughness: 0.3,
    }));
    torus2.rotation.x = -Math.PI / 4;
    coreGroup.add(torus2);

    // 4. Floating glowing particle constellation
    const particleCount = 75;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0xF6DFA6);
    const color2 = new THREE.Color(0xc9833b);
    const color3 = new THREE.Color(0xfff4d8);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.2 + Math.random() * 3.5;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      const chosenColor = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3;
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse parallax tracking
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = -(y / rect.height) * 2;
      targetRotationY = mouseX * 0.7;
      targetRotationX = -mouseY * 0.5;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight || 280;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop (Theatre.js style smooth easing)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth lerp to mouse targets
      coreGroup.rotation.y += (targetRotationY - coreGroup.rotation.y) * 0.05 + 0.003;
      coreGroup.rotation.x += (targetRotationX - coreGroup.rotation.x) * 0.05 + Math.sin(elapsedTime * 0.6) * 0.001;

      // Orbit individual rings
      torus1.rotation.z += 0.006;
      torus2.rotation.y -= 0.004;

      // Pulsing crystal vertices
      const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.04;
      crystalMesh.scale.set(scale, scale, scale);

      // Rotate particle constellation
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
    />
  );
};
