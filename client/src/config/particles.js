// src/config/particles.js
export const particlesOptions = {
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: "repulse" },
      onClick: { enable: true, mode: "push" }
    },
    modes: {
      repulse: { distance: 100 },
      push: { quantity: 4 }
    }
  },
  particles: {
    color: { value: "#ffffff" },
    links: { enable: true, distance: 120, opacity: 0.2 },
    collisions: { enable: false },
    move: { enable: true, speed: 1.5, outMode: "bounce" },
    number: { density: { enable: true, area: 800 }, value: 50 },
    opacity: { value: 0.3 },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 4 } }
  },
  detectRetina: true
};