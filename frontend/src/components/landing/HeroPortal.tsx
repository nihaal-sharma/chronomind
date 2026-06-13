import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroPortal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Create rotating energy rings
    const createRing = (radius: number, tube: number, color: number, speed: number) => {
      const geometry = new THREE.TorusGeometry(radius, tube, 16, 100);
      const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
      const ring = new THREE.Mesh(geometry, material);
      ring.userData.speed = speed;
      return ring;
    };

    const ring1 = createRing(5, 0.05, 0x50c878, 0.01);
    const ring2 = createRing(5.5, 0.02, 0xd4af37, -0.02);
    ring2.rotation.x = Math.PI / 2;
    const ring3 = createRing(4.5, 0.03, 0x39ff14, 0.015);
    ring3.rotation.y = Math.PI / 4;
    group.add(ring1, ring2, ring3);

    // Neural constellation particles
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }

    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0x50c878,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particleSystem);

    camera.position.z = 12;

    const animate = () => {
      ring1.rotation.z += ring1.userData.speed;
      ring2.rotation.x += ring2.userData.speed;
      ring3.rotation.y += ring3.userData.speed;
      group.rotation.y += 0.005;
      particleSystem.rotation.y += 0.001;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
