"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface FeatureShapeProps {
  shape: "cube" | "sphere" | "torus";
}

function FeatureShape({ shape }: FeatureShapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    let geometry: THREE.BufferGeometry;
    if (shape === "cube") {
      geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    } else if (shape === "sphere") {
      geometry = new THREE.IcosahedronGeometry(1.2, 1);
    } else {
      geometry = new THREE.TorusGeometry(1.0, 0.4, 16, 50);
    }

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x7dd3fc,
      emissive: 0x0a4c6e,
      emissiveIntensity: 0.3,
      metalness: 0.3,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.8,
      transparent: true,
      opacity: 0.9,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7dd3fc, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x00f0ff, 1);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;
      const time = Date.now() * 0.001;
      mesh.position.y = Math.sin(time) * 0.1;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      if (container.clientWidth && container.clientHeight) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [shape]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[200px] bg-transparent mb-6 transition-transform duration-500 group-hover:scale-105"
    />
  );
}

const features = [
  {
    shape: "cube" as const,
    title: "Standard LUTs",
    description:
      "Access a vast library of cinematic looks or import your own .cube files for instant styling.",
  },
  {
    shape: "sphere" as const,
    title: "Auto White Balance",
    description:
      "Intelligent temperature and tint adjustments to correct your footage with a single click.",
  },
  {
    shape: "torus" as const,
    title: "Contrast & Saturation",
    description:
      "Fine-tune tonal ranges and color intensity with precision curves and color wheels.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-32 px-5 md:px-12 lg:px-16 max-w-screen-2xl mx-auto relative z-10">
      {/* Section Header */}
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-[clamp(1.8rem,4vw,3rem)] md:text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-gradient mb-4">
          Everything You Need to Grade Like a Pro
        </h2>
        <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          Advanced color grading tools, reimagined for a fluid, creative workflow.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="glacier-card rounded-2xl p-6 flex flex-col items-center text-center group"
          >
            <FeatureShape shape={feature.shape} />
            <h3 className="text-xl md:text-2xl text-[var(--accent-teal)] mb-3 font-semibold">
              {feature.title}
            </h3>
            <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
