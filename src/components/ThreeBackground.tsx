"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x7dd3fc, 2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0x00f0ff, 2);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    // Ethereal Ribbons
    const ribbons: {
      mesh: THREE.Mesh;
      curve: THREE.CatmullRomCurve3;
      offset: number;
    }[] = [];
    const ribbonCount = 7;
    const colors = [0x7dd3fc, 0x00f0ff, 0x0ea5e9, 0x38bdf8, 0x7dd3fc, 0xbae6fd, 0x0284c7];

    for (let i = 0; i < ribbonCount; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-25, Math.random() * 15 - 7.5, Math.random() * 8 - 4),
        new THREE.Vector3(-12, Math.random() * 15 - 7.5, Math.random() * 8 - 4),
        new THREE.Vector3(0, Math.random() * 15 - 7.5, Math.random() * 8 - 4),
        new THREE.Vector3(12, Math.random() * 15 - 7.5, Math.random() * 8 - 4),
        new THREE.Vector3(25, Math.random() * 15 - 7.5, Math.random() * 8 - 4),
      ]);

      const geometry = new THREE.TubeGeometry(curve, 120, 0.15, 8, false);
      const material = new THREE.MeshPhysicalMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.6,
        metalness: 0.8,
        roughness: 0.1,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      ribbons.push({ mesh, curve, offset: Math.random() * Math.PI * 2 });
    }

    camera.position.z = 15;

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * -2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      ribbons.forEach((ribbon) => {
        ribbon.mesh.rotation.x = Math.sin(time * 0.5 + ribbon.offset) * 0.2;
        ribbon.mesh.rotation.y = Math.cos(time * 0.3 + ribbon.offset) * 0.2;
        ribbon.mesh.position.x += (mouseX * 3 - ribbon.mesh.position.x) * 0.02;
        ribbon.mesh.position.y += (mouseY * 3 - ribbon.mesh.position.y) * 0.02;
      });

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
    />
  );
}
