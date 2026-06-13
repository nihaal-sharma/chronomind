import { useEffect, useRef } from 'react';

export default function ParticleField({ count = 40 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 2 + 1;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: #efffe3;
        border-radius: 50%;
        opacity: 0.3;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        animation: float-particle ${Math.random() * 15 + 10}s linear infinite;
        animation-delay: ${Math.random() * -20}s;
      `;
      container.appendChild(particle);
    }

    return () => { container.innerHTML = ''; };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    />
  );
}
