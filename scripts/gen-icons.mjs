// Generates simple PWA icons using canvas
import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const dir = join(process.cwd(), 'public/icons')
mkdirSync(dir, { recursive: true })

function makeIcon(size) {
  const c = createCanvas(size, size)
  const ctx = c.getContext('2d')
  const r = size * 0.26

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#7C3BFF')
  grad.addColorStop(1, '#9B27AF')
  ctx.fillStyle = grad

  // Rounded rect
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, r)
  ctx.fill()

  // T letter
  ctx.fillStyle = 'white'
  const sw = size * 0.08
  const vx = size * 0.46, vy = size * 0.22, vh = size * 0.56
  const hx = size * 0.22, hy = size * 0.34, hw = size * 0.56
  ctx.beginPath(); ctx.roundRect(vx, vy, sw, vh, sw/2); ctx.fill()
  ctx.beginPath(); ctx.roundRect(hx, hy, hw, sw, sw/2); ctx.fill()

  // Accent dot
  ctx.fillStyle = '#0DD9B8'
  ctx.beginPath(); ctx.arc(size*0.75, size*0.75, size*0.07, 0, Math.PI*2); ctx.fill()

  return c.toBuffer('image/png')
}

writeFileSync(join(dir, 'icon-192.png'), makeIcon(192))
writeFileSync(join(dir, 'icon-512.png'), makeIcon(512))
console.log('Icons generated.')
