import { useEffect, useRef } from 'react'

const palettes = [
  ['#fff2bc', '#ffda75', '#ffad75'],
  ['#fff1f7', '#ffb3da', '#ff70b1'],
  ['#fff8e0', '#ffd0df', '#ffc878'],
]
const positions = [
  [.20, .22], [.79, .26], [.13, .63], [.86, .70],
  [.51, .16], [.67, .83], [.31, .80], [.88, .44], [.12, .40],
]
const interval = 0.4
const launchTime = 0.45
const gravity = 46
const maximumLife = 1.65

const random = (min, max) => min + Math.random() * (max - min)

function createBurst(sequence, start, width, height) {
  const [column, row] = positions[sequence % positions.length]
  const colors = palettes[sequence % palettes.length]
  const size = Math.min(width, height, 780)
  const particles = Array.from({ length: 52 }, (_, index) => {
    const angle = index * 2.39996 + random(-0.14, 0.14)
    const speed = size * random(0.19, 0.58)
    return {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: colors[index % colors.length],
      life: random(0.9, maximumLife),
      phase: random(0, Math.PI * 2),
      size: random(0.85, 2.2),
    }
  })

  return {
    x: width * (column + random(-0.045, 0.045)),
    y: height * (row + random(-0.045, 0.045)),
    launchHeight: size * random(0.14, 0.25),
    drift: size * random(-0.07, 0.07),
    start,
    color: colors[0],
    particles,
  }
}

function drawBurst(context, burst, now) {
  const { x, y, launchHeight, drift, color, particles } = burst
  const age = now - burst.start

  if (age < 0) {
    const progress = 1 + age / launchTime
    for (let point = 0; point < 12; point++) {
      const trail = Math.max(0, progress - point * 0.032)
      context.globalAlpha = (1 - point / 12) * trail
      context.fillStyle = color
      context.beginPath()
      context.arc(x - drift * (1 - trail), y + launchHeight * (1 - trail), 2.4 - point * 0.13, 0, Math.PI * 2)
      context.fill()
    }
    return
  }

  const speed = Math.exp(-age * 2.5)
  const distance = (1 - speed) / 2.5
  const tail = Math.min(age, 0.115)
  for (const particle of particles) {
    if (age >= particle.life) continue
    const fade = Math.sqrt(1 - age / particle.life)
    const twinkle = 0.65 + 0.35 * Math.cos(age * 44 + particle.phase)
    const px = x + particle.vx * distance
    const py = y + particle.vy * distance + gravity * age ** 2

    context.strokeStyle = particle.color
    context.globalAlpha = fade * twinkle * 0.82
    context.lineWidth = particle.size
    context.beginPath()
    context.moveTo(px - particle.vx * speed * tail, py - (particle.vy * speed + 2 * gravity * age) * tail)
    context.lineTo(px, py)
    context.stroke()

    context.fillStyle = particle.color
    context.globalAlpha = fade * twinkle
    context.beginPath()
    context.arc(px, py, particle.size, 0, Math.PI * 2)
    context.fill()
  }
}

export function Fireworks() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    let width
    let height
    let frame
    let nextLaunch
    let sequence = 0
    let bursts = []

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.lineCap = 'round'
      bursts = []
      nextLaunch = undefined
    }

    function draw(timestamp) {
      const now = timestamp / 1000
      context.clearRect(0, 0, width, height)
      if (nextLaunch === undefined || now - nextLaunch > maximumLife) {
        bursts.push(createBurst(sequence++, now, width, height))
        nextLaunch = now + 0.12
      }
      if (now >= nextLaunch) {
        bursts.push(createBurst(sequence++, now + launchTime, width, height))
        nextLaunch = now + interval
      }
      bursts = bursts.filter(({ start }) => now - start < maximumLife)
      for (const burst of bursts) drawBurst(context, burst, now)
      context.globalAlpha = 1
      frame = window.requestAnimationFrame(draw)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    frame = window.requestAnimationFrame(draw)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas className="fireworks" ref={canvasRef} aria-hidden="true" />
}
