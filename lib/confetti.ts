import confetti from 'canvas-confetti'

const TEMPO_COLORS = ['#7C3BFF', '#0DD9B8', '#FFB347', '#FF6B6B', '#ffffff', '#B4A0FF']

export function celebrateTask() {
  confetti({
    particleCount: 90,
    spread: 65,
    origin: { y: 0.65 },
    colors: TEMPO_COLORS,
    disableForReducedMotion: true,
    gravity: 1.1,
    scalar: 0.9,
  })
}

export function celebrateAllDone() {
  // Dual cannon burst from sides
  confetti({
    particleCount: 70,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    colors: TEMPO_COLORS,
    disableForReducedMotion: true,
  })
  setTimeout(() => {
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: TEMPO_COLORS,
      disableForReducedMotion: true,
    })
  }, 120)
}

export function celebrateBucketItem() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.55 },
    colors: ['#FFB347', '#FF6B6B', '#FFD700', '#FF8C00', '#ffffff'],
    shapes: ['star', 'circle'],
    disableForReducedMotion: true,
  })
}
