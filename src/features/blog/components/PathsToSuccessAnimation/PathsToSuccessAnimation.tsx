import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import styles from './PathsToSuccessAnimation.module.css'

type PathId = 'wrong' | 'found' | 'steady' | 'small' | 'luck'

interface PathSpec {
  id: PathId
  label: string
  subLabel?: string
  buttonLabel: string
  color: string
  d: string
  labelX: number
  labelY: number
  reachesGoal: boolean
  durationMs: number
  dotted?: boolean
}

const PATHS: PathSpec[] = [
  {
    id: 'wrong',
    label: 'Hard work, wrong path',
    subLabel: 'lots of effort, pointed away',
    buttonLabel: 'Wrong path',
    color: '#d0475f',
    d: 'M90 400 C 100 350, 70 310, 96 270 S 80 190, 108 150 S 92 90, 124 38',
    labelX: 140,
    labelY: 46,
    reachesGoal: false,
    durationMs: 2300,
  },
  {
    id: 'found',
    label: 'Hard work, found the right path',
    subLabel: 'a detour, then a turn',
    buttonLabel: 'Found the path',
    color: '#c47f10',
    d: 'M90 400 C 150 350, 165 280, 205 240 S 260 150, 315 162 S 345 240, 335 300 S 350 335, 420 333 S 600 334, 710 336',
    labelX: 352,
    labelY: 146,
    reachesGoal: true,
    durationMs: 2300,
  },
  {
    id: 'steady',
    label: 'Steady work, right path',
    buttonLabel: 'Steady',
    color: '#2f6fd6',
    d: 'M90 400 C 260 384, 480 364, 710 356',
    labelX: 430,
    labelY: 396,
    reachesGoal: true,
    durationMs: 2300,
  },
  {
    id: 'small',
    label: 'Small work, right path',
    subLabel: 'right way, stops short',
    buttonLabel: 'Small work',
    color: '#8a55d0',
    d: 'M90 400 C 150 422, 220 436, 290 432',
    labelX: 302,
    labelY: 446,
    reachesGoal: false,
    durationMs: 1300,
  },
  {
    id: 'luck',
    label: 'Luck and chance',
    buttonLabel: 'Luck',
    color: '#0e8fa8',
    d: 'M90 406 Q 330 570, 772 386',
    labelX: 350,
    labelY: 520,
    reachesGoal: true,
    durationMs: 2300,
    dotted: true,
  },
]

const ALL_IDS = PATHS.map((path) => path.id)

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export interface PathsToSuccessAnimationProps {
  ariaLabel?: string
}

/**
 * Animated redraw of the "factors to success" notebook sketch: each path
 * draws itself from the shared starting dot, with a walker dot riding along
 * it. Replay plays every path in turn; a path button plays just that one.
 *
 * Embedded from markdown via `![alt](component:paths-to-success-animation)` —
 * see BLOG_EMBEDS in BlogPostRoute.
 */
export default function PathsToSuccessAnimation({
  ariaLabel = 'Paths to success animation',
}: PathsToSuccessAnimationProps): ReactElement {
  const routeRefs = useRef<Partial<Record<PathId, SVGPathElement | null>>>({})
  const revealRefs = useRef<Partial<Record<PathId, SVGPathElement | null>>>({})
  const walkerRef = useRef<SVGCircleElement | null>(null)
  const runIdRef = useRef(0)
  const [labelled, setLabelled] = useState<Set<PathId>>(new Set(ALL_IDS))
  const [soloId, setSoloId] = useState<PathId | null>(null)
  const [goalLit, setGoalLit] = useState(true)

  const drawPath = useCallback((id: PathId, progress: number) => {
    const revealPath = revealRefs.current[id]
    if (!revealPath || typeof revealPath.getTotalLength !== 'function') return
    const length = revealPath.getTotalLength()
    revealPath.style.strokeDasharray = `${length}`
    revealPath.style.strokeDashoffset = `${length * (1 - progress)}`
  }, [])

  const animateOne = useCallback(
    (spec: PathSpec, runId: number) =>
      new Promise<boolean>((resolve) => {
        const revealPath = revealRefs.current[spec.id]
        const walker = walkerRef.current
        if (!revealPath || !walker || typeof revealPath.getTotalLength !== 'function') {
          resolve(false)
          return
        }
        const length = revealPath.getTotalLength()
        const startedAt = performance.now()
        walker.setAttribute('fill', spec.color)
        walker.setAttribute('opacity', '1')

        const frame = (now: number) => {
          if (runId !== runIdRef.current) {
            resolve(false)
            return
          }
          const t = Math.min(1, (now - startedAt) / spec.durationMs)
          const eased = easeInOut(t)
          drawPath(spec.id, eased)
          const point = revealPath.getPointAtLength(length * eased)
          walker.setAttribute('cx', String(point.x))
          walker.setAttribute('cy', String(point.y))
          if (t < 1) {
            requestAnimationFrame(frame)
            return
          }
          setLabelled((current) => new Set(current).add(spec.id))
          if (spec.reachesGoal) setGoalLit(true)
          window.setTimeout(() => {
            if (runId === runIdRef.current && spec.reachesGoal) setGoalLit(false)
            resolve(runId === runIdRef.current)
          }, 400)
        }
        requestAnimationFrame(frame)
      }),
    [drawPath]
  )

  const play = useCallback(
    async (ids: PathId[]) => {
      const runId = ++runIdRef.current
      if (prefersReducedMotion()) {
        ALL_IDS.forEach((id) => drawPath(id, 1))
        setLabelled(new Set(ALL_IDS))
        setGoalLit(true)
        return
      }
      ALL_IDS.forEach((id) => drawPath(id, ids.includes(id) ? 0 : 1))
      setLabelled(new Set(ALL_IDS.filter((id) => !ids.includes(id))))
      setGoalLit(false)
      for (const spec of PATHS.filter((path) => ids.includes(path.id))) {
        if (!(await animateOne(spec, runId))) return
      }
      walkerRef.current?.setAttribute('opacity', '0')
      setGoalLit(true)
    },
    [animateOne, drawPath]
  )

  useEffect(() => {
    ALL_IDS.forEach((id) => drawPath(id, 1))
    const timer = window.setTimeout(() => void play(ALL_IDS), 500)
    return () => {
      window.clearTimeout(timer)
      runIdRef.current += 1
    }
  }, [drawPath, play])

  const replayAll = () => {
    setSoloId(null)
    void play(ALL_IDS)
  }

  const playSolo = (id: PathId) => {
    setSoloId(id)
    void play([id])
  }

  return (
    <section className={styles.figure} aria-label={ariaLabel}>
      <div className={styles.stage}>
        <svg className={styles.svg} viewBox="0 0 900 540" role="img" aria-label={ariaLabel}>
          <defs>
            <mask id="paths-to-success-luck-mask" maskUnits="userSpaceOnUse">
              <path
                ref={(element) => {
                  revealRefs.current.luck = element
                }}
                d={PATHS[4].d}
                fill="none"
                stroke="#ffffff"
                strokeWidth={10}
                strokeLinecap="round"
              />
            </mask>
          </defs>

          {PATHS.map((spec) => {
            const dimmed = soloId !== null && soloId !== spec.id
            const showLabel = labelled.has(spec.id)
            return (
              <g key={spec.id} className={dimmed ? styles.dimmed : undefined} data-path={spec.id}>
                <path
                  ref={(element) => {
                    routeRefs.current[spec.id] = element
                    if (!spec.dotted) revealRefs.current[spec.id] = element
                  }}
                  className={styles.route}
                  d={spec.d}
                  stroke={spec.color}
                  strokeDasharray={spec.dotted ? '2 11' : undefined}
                  mask={spec.dotted ? 'url(#paths-to-success-luck-mask)' : undefined}
                />
                <text
                  className={`${styles.label} ${showLabel ? styles.visible : ''}`}
                  x={spec.labelX}
                  y={spec.labelY}
                  fill={spec.color}
                >
                  {spec.label}
                </text>
                {spec.subLabel ? (
                  <text
                    className={`${styles.subLabel} ${showLabel ? styles.visible : ''}`}
                    x={spec.labelX}
                    y={spec.labelY + 22}
                  >
                    {spec.subLabel}
                  </text>
                ) : null}
              </g>
            )
          })}

          <g className={`${styles.goal} ${goalLit ? styles.goalLit : ''}`}>
            <rect x={704} y={306} width={186} height={80} rx={12} />
            <text x={797} y={340} textAnchor="middle">
              Lasting success,
            </text>
            <text x={797} y={366} textAnchor="middle">
              habits &amp; resources
            </text>
          </g>

          <circle ref={walkerRef} r={8} cx={90} cy={400} opacity={0} />
          <circle cx={90} cy={400} r={10} className={styles.start} />
          <text x={90} y={432} textAnchor="middle" className={styles.subLabel + ' ' + styles.visible}>
            start
          </text>
        </svg>
      </div>

      <div className={styles.controls} role="group" aria-label="Animation controls">
        <button type="button" className={styles.replay} onClick={replayAll}>
          ▶ Replay all
        </button>
        {PATHS.map((spec) => (
          <button
            key={spec.id}
            type="button"
            className={styles.pathButton}
            aria-pressed={soloId === spec.id}
            onClick={() => playSolo(spec.id)}
          >
            <span
              className={`${styles.swatch} ${spec.dotted ? styles.swatchDotted : ''}`}
              style={{ color: spec.color }}
            />
            {spec.buttonLabel}
          </button>
        ))}
      </div>
    </section>
  )
}
