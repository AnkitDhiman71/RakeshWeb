import React, { useEffect, useRef } from 'react';

const STAR_COUNT = 80;
const STAR_COLORS = ['#fff', '#b3e5fc', '#e1bee7'];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

const StarBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('div');
      const size = randomBetween(1, 3);
      const left = randomBetween(0, 100);
      const top = randomBetween(0, 100);
      star.style.position = 'absolute';
      star.style.left = `${left}vw`;
      star.style.top = `${top}vh`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.borderRadius = '50%';
      star.style.background = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      star.style.opacity = randomBetween(0.5, 1);
      star.style.boxShadow = `0 0 ${randomBetween(4, 12)}px ${star.style.background}`;
      star.style.animation = `twinkle ${randomBetween(2, 6)}s infinite ease-in-out`;
      container.appendChild(star);
      stars.push({
        el: star,
        x: left,
        y: top,
        speed: randomBetween(0.01, 0.05),
        size
      });
    }

    let running = true;
    function animate() {
      for (const star of stars) {
        star.x += star.speed; // move right
        star.y += star.speed; // move down
        if (star.x > 100) star.x = -2; // reset to left
        if (star.y > 100) star.y = -2; // reset to top
        star.el.style.left = `${star.x}vw`;
        star.el.style.top = `${star.y}vh`;
      }
      if (running) requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
};

export default StarBackground;

// Add this to your global CSS (App.css or index.css):
// @keyframes twinkle {
//   0%, 100% { opacity: 0.7; }
//   50% { opacity: 1; }
// }
