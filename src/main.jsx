import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import '@fontsource-variable/caveat/wght.css'
import '@fontsource-variable/cormorant-garamond/wght.css'
import '@fontsource-variable/cormorant-garamond/wght-italic.css'
import '@fontsource-variable/nunito/wght.css'
import { dedications } from './dedications'
import './styles.css'

const HEART = 'M200 350C174 330 35 234 15 144C-1 75 39 22 96 19C143 16 182 41 200 80C218 41 257 16 304 19C361 22 401 75 385 144C365 234 226 330 200 350Z'
const STAR = 'M12 0.8 15.2 8.1 23.2 8.8 17.2 14.1 19 22 12 17.9 5 22 6.8 14.1 0.8 8.8 8.8 8.1Z'
const MINI_HEART = 'M12 21C10 19.5 1.2 13.5 1.2 7.6 1.2 2 8.1.8 12 5.8 15.9.8 22.8 2 22.8 7.6c0 5.9-8.8 11.9-10.8 13.4Z'
const GLINT = 'M12 0Q13.7 10.3 24 12Q13.7 13.7 12 24Q10.3 13.7 0 12Q10.3 10.3 12 0Z'
const CARD_EASE = [0.22, 0.8, 0.26, 1]
const FULL_TRANSITION = 660
const SHORT_TRANSITION = 210

const accents = [
  [12, 22, 22, 'star', 'gold'], [22, 12, 13, 'heart', 'pink'],
  [30, 24, 12, 'glint', 'cream'], [6, 49, 9, 'glint', 'pink'],
  [20, 43, 25, 'heart', 'pink'], [9, 68, 18, 'star', 'gold'],
  [24, 75, 12, 'heart', 'gold'], [17, 87, 9, 'glint', 'cream'],
  [33, 82, 14, 'star', 'gold'], [45, 91, 9, 'heart', 'pink'],
  [58, 9, 10, 'glint', 'cream'], [69, 18, 14, 'star', 'gold'],
  [79, 11, 17, 'heart', 'pink'], [88, 22, 19, 'glint', 'cream'],
  [84, 37, 24, 'star', 'gold'], [93, 46, 12, 'heart', 'rose'],
  [77, 60, 18, 'heart', 'pink'], [89, 69, 14, 'glint', 'cream'],
  [77, 81, 23, 'star', 'gold'], [85, 89, 13, 'heart', 'gold'],
  [65, 87, 10, 'glint', 'cream'], [6, 13, 11, 'heart', 'rose'],
  [95, 77, 8, 'star', 'gold'], [52, 84, 12, 'star', 'gold'],
  [31, 37, 10, 'heart', 'cream'], [68, 33, 13, 'heart', 'gold'],
]
const dots = Array.from({ length: 102 }, (_, index) => ({
  x: (index * 0.61803398875 % 1) * 100,
  y: ((index + 1) * 0.754877666 % 1) * 100,
  size: index % 8 === 0 ? 3 : 1 + (index % 3) * 0.48,
})).filter(({ x, y }, index) =>
  x < 32 || x > 68 || y < 25 || y > 75 || index % 4 === 0,
)

function Symbol({ kind, ...props }) {
  const shape = kind === 'heart' ? MINI_HEART : kind === 'glint' ? GLINT : STAR
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d={shape} fill="currentColor" />
    </svg>
  )
}

function SkyLayer({ depth, children }) {
  return (
    <div className={'sky-depth sky-depth--' + depth}>
      <div className="sky-track">
        <div className="sky-tile">{children}</div>
        <div className="sky-tile">{children}</div>
      </div>
    </div>
  )
}

function Sky({ skyRef }) {
  return (
    <div className="sky" ref={skyRef} aria-hidden="true">
      <div className="sky-grain" />
      <SkyLayer depth="far">
        {dots.map(({ x, y, size }, i) => (
          <i className="sky-dot" key={i} style={{
            '--x': x + '%', '--y': y + '%', '--size': size + 'px',
            '--duration': 5 + i % 9 + 's', '--delay': -(i % 14) + 's',
          }} />
        ))}
      </SkyLayer>
      <SkyLayer depth="near">
        {accents.map(([x, y, size, kind, color], i) => (
          <span className="sky-position" key={i} style={{
            '--x': x + '%', '--y': y + '%', '--size': size + 'px',
            '--turn': (i % 2 ? 1 : -1) * (i % 5 + 1) * 5 + 'deg',
            '--duration': 8 + i % 8 + 's', '--delay': -(i % 15) + 's',
          }}>
            <Symbol className={'sky-charm ' + color} kind={kind} />
          </span>
        ))}
      </SkyLayer>
      <div className="frame" />
    </div>
  )
}

function HeartArt({ id, tone = 'front', interactive = false }) {
  return (
    <svg className={'heart-art heart-art--' + tone} viewBox="0 0 400 366"
      aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="15%" x2="85%" y1="0%" y2="100%">
          <stop stopColor={tone === 'front' ? '#fff3be' : '#ffe3a5'} />
          <stop offset=".48" stopColor={tone === 'front' ? '#ffdf8e' : '#f9c474'} />
          <stop offset="1" stopColor={tone === 'front' ? '#ffc56e' : '#eaa15d'} />
        </linearGradient>
        <linearGradient id={id + '-rim'} x2="45%" y2="100%">
          <stop stopColor="#fff9df" />
          <stop offset=".5" stopColor="#ffe4a1" />
          <stop offset="1" stopColor="#ffd890" />
        </linearGradient>
      </defs>
      <path className={interactive ? 'heart-hit' : undefined} d={HEART}
        fill={'url(#' + id + ')'} stroke={'url(#' + id + '-rim)'} strokeWidth="2.2" />
      <path d={HEART} className="heart-stitch" transform="translate(11 10) scale(.945)"
        fill="none" strokeWidth="1.2" strokeDasharray={tone === 'front' ? '2 4' : undefined}
        strokeLinecap="round" />
    </svg>
  )
}

function Dedication({ index }) {
  const phrase = dedications[index]
  const last = index === dedications.length - 1
  return (
    <span className={'dedication dedication--' + (index + 1)} lang={index === 8 ? 'en' : undefined}>
      {last && phrase.endsWith('per sempre') ? <>
        {phrase.slice(0, -10)}<em>per sempre</em>
      </> : phrase}
    </span>
  )
}

function HeartLetter({ index, id, interactive = false }) {
  return <>
    <HeartArt id={id} interactive={interactive} />
    <span className="letter-ornament" aria-hidden="true">
      <i /><Symbol kind="star" /><i />
    </span>
    <Dedication index={index} />
    <Symbol className="letter-seal" kind="heart" />
  </>
}

const layers = [
  { x: '4.5%', y: '5.5%', rotate: 6, scale: 0.98 },
  { x: '8.4%', y: '9%', rotate: 10, scale: 0.955 },
  { x: '11.1%', y: '12%', rotate: 14, scale: 0.925 },
]

function Sparks({ finale = false }) {
  const count = finale ? 32 : 11
  return (
    <span className="sparks" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i * 137.51 + (finale ? 0 : 20)) * Math.PI / 180
        const distance = finale ? 34 + i % 7 * 6 : 14 + i % 6 * 6
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        return (
          <motion.span key={i} className={'spark ' + (finale && i % 3 === 0 ? 'spark--pink' : '')}
            style={{ '--spark-size': 7 + i % 5 * 2 + 'px' }}
            initial={{ left: finale ? '50%' : '57%', top: '40%', opacity: 0, scale: 0.3 }}
            animate={{
              left: finale ? ['50%', 50 + x + '%', 50 + x * 1.15 + '%'] : [57 + i % 4 * 4 + '%', 71 + x + '%'],
              top: finale ? ['40%', 38 + y + '%', 60 + y + '%'] : [39 + i % 5 * 3 + '%', 32 + y + '%'],
              opacity: [0, 1, 0], scale: [0.3, 1, 0.7], rotate: i % 2 ? 85 : -65,
            }}
            transition={{ duration: finale ? 1.22 + i % 4 * 0.07 : 0.52, delay: i % 6 * 0.018, ease: 'easeOut' }}>
            <Symbol kind={finale && i % 3 === 0 ? 'heart' : 'star'} />
          </motion.span>
        )
      })}
    </span>
  )
}

function App() {
  const [index, setIndex] = useState(0)
  const [departing, setDeparting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [replayCount, setReplayCount] = useState(0)
  const reduced = useReducedMotion()
  const lock = useRef(false)
  const timer = useRef(null)
  const sky = useRef(null)
  const active = useRef(null)
  const replay = useRef(null)
  const focusTarget = useRef(null)
  const last = index === dedications.length - 1
  const rearCount = Math.min(layers.length, dedications.length - index - 1)

  useEffect(() => () => window.clearTimeout(timer.current), [])
  useLayoutEffect(() => {
    focusTarget.current?.current?.focus({ preventScroll: true })
    focusTarget.current = null
  }, [index])

  function parallax(event) {
    if (reduced || event.pointerType !== 'mouse') return
    sky.current.style.setProperty('--pointer-x', (event.clientX / window.innerWidth - 0.5) * 22 + 'px')
    sky.current.style.setProperty('--pointer-y', (event.clientY / window.innerHeight - 0.5) * 22 + 'px')
  }

  function resetParallax() {
    sky.current.style.setProperty('--pointer-x', '0px')
    sky.current.style.setProperty('--pointer-y', '0px')
  }

  function startTransition() {
    lock.current = true
    setBusy(true)
    timer.current = window.setTimeout(() => {
      setDeparting(null)
      setBusy(false)
      lock.current = false
    }, reduced ? SHORT_TRANSITION : FULL_TRANSITION)
  }

  function advance() {
    if (lock.current || last) return
    startTransition()
    setDeparting(index)
    if (index === dedications.length - 2 && document.activeElement === active.current) {
      focusTarget.current = replay
    }
    setIndex(index + 1)
  }

  function restart() {
    if (lock.current) return
    startTransition()
    focusTarget.current = active
    setReplayCount((count) => count + 1)
    setIndex(0)
  }

  function guardKeyboard(event) {
    if ((event.key === 'Enter' || event.key === ' ') && (event.repeat || lock.current)) {
      event.preventDefault()
    }
  }

  const incoming = !reduced && (index > 0 || replayCount > 0)
  const face = (
    <motion.span className="heart-face" key={index + '-' + replayCount}
      initial={incoming ? { opacity: 0.5, y: '6%', rotate: 5, scale: 0.94 } : false}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ duration: reduced ? 0.13 : 0.47, delay: incoming ? 0.1 : 0, ease: CARD_EASE }}>
      <HeartArt id="active" interactive={!last} />
      <motion.span className="letter-copy"
        initial={index > 0 ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: index > 0 && !reduced ? 0.28 : 0, duration: reduced ? 0.14 : 0.25 }}>
        <span className="letter-ornament" aria-hidden="true"><i /><Symbol kind="star" /><i /></span>
        <Dedication index={index} />
        <Symbol className="letter-seal" kind="heart" />
      </motion.span>
    </motion.span>
  )

  return (
    <main className="page" onPointerMove={parallax} onPointerLeave={resetParallax}>
      <Sky skyRef={sky} />
      <section className="experience" aria-labelledby="site-title">
        <header className="masthead">
          <span aria-hidden="true" className="masthead-mark"><i /><Symbol kind="glint" /><i /></span>
          <h1 id="site-title">Stellina mia</h1>
        </header>
        <div className="deck">
          <AnimatePresence>
            {last && <motion.div className="final-glow" aria-hidden="true"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.15 : 0.75 }} />}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {layers.slice(0, rearCount).map((layer, i) => (
              <motion.span className="rear-card" key={i} aria-hidden="true"
                style={{ zIndex: layers.length - i }}
                initial={reduced ? { opacity: 0, ...layer } : { opacity: 0, x: 0, y: 0, rotate: 0 }}
                animate={{ opacity: 1, ...layer }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.14 : 0.44, ease: CARD_EASE }}>
                <HeartArt id={'rear-' + i} tone="rear" />
              </motion.span>
            ))}
          </AnimatePresence>
          {last ? (
            <div className="active-card">{face}</div>
          ) : (
            <button className="active-card heart-button" type="button" ref={active}
              aria-label={dedications[index] + ' — dedica successiva'}
              aria-disabled={busy || undefined} onClick={advance} onKeyDown={guardKeyboard}>
              {face}
            </button>
          )}
          {departing !== null && (
            <motion.span className="departing-card" aria-hidden="true"
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={reduced ? { opacity: 0 } : {
                x: ['0%', '5%', '36%'], y: ['0%', '-12%', '-18%'],
                rotate: [0, -5, 13], opacity: [1, 1, 0],
              }}
              transition={{ duration: reduced ? 0.15 : 0.56, ease: CARD_EASE }}>
              <HeartLetter index={departing} id="departing" />
            </motion.span>
          )}
          {!reduced && departing !== null && <Sparks key={departing} />}
          {!reduced && last && <Sparks finale />}
        </div>
        <div className="controls">
          {last ? (
            <button className="prompt replay" type="button" ref={replay}
              aria-disabled={busy || undefined} onClick={restart} onKeyDown={guardKeyboard}>
              Rileggi da capo <span aria-hidden="true">♡</span>
            </button>
          ) : index === 0 ? (
            <p className="prompt">Tocca il cuore <span aria-hidden="true">♡</span></p>
          ) : (
            <p className="counter" aria-label={'Dedica ' + (index + 1) + ' di ' + dedications.length}>
              {index + 1} <span>/</span> {dedications.length}
            </p>
          )}
          <div className="progress" aria-hidden="true">
            {dedications.map((_, i) => (
              <i key={i} className={i === index ? 'current' : i < index ? 'read' : undefined} />
            ))}
          </div>
        </div>
        <div className="sr-only" role="status" aria-atomic="true">
          {index > 0 && dedications[index]}
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
