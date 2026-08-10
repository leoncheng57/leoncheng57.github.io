import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { routeBulletStyle } from '../data/routeColors'
import { STATIONS } from '../data/stations'
import { buildProjection } from '../utils/mapProjection'
import styles from '../sub-wait.module.css'

const MAP_WIDTH = 900
const MAP_PADDING = 30
const MIN_SCALE = 1
const MAX_SCALE = 14
const LABEL_SCALE_THRESHOLD = 6

type Transform = { x: number; y: number; scale: number }

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
}

export default function MapRoute(): ReactElement {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gestureStart = useRef<{
    transform: Transform
    centroid: { x: number; y: number }
    spread: number
  } | null>(null)
  const movedRef = useRef(false)

  const projection = useMemo(
    () => buildProjection(STATIONS, MAP_WIDTH, MAP_PADDING),
    [],
  )
  const points = useMemo(
    () =>
      STATIONS.map((station) => ({
        station,
        point: projection.project(station.lat, station.lon),
        color: routeBulletStyle(station.routes[0]).background,
      })),
    [projection],
  )

  const applyZoom = (factor: number, originX: number, originY: number) => {
    setTransform((current) => {
      const nextScale = clampScale(current.scale * factor)
      const ratio = nextScale / current.scale
      return {
        scale: nextScale,
        x: originX - (originX - current.x) * ratio,
        y: originY - (originY - current.y) * ratio,
      }
    })
  }

  const localPoint = (event: { clientX: number; clientY: number }) => {
    const rect = containerRef.current?.getBoundingClientRect()
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    }
  }

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const { x, y } = localPoint(event)
    applyZoom(Math.exp(-event.deltaY * 0.002), x, y)
  }

  const centroidAndSpread = () => {
    const list = [...pointers.current.values()]
    const centroid = {
      x: list.reduce((sum, p) => sum + p.x, 0) / list.length,
      y: list.reduce((sum, p) => sum + p.y, 0) / list.length,
    }
    let spread = 0
    if (list.length >= 2) {
      spread = Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y)
    }
    return { centroid, spread }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    containerRef.current?.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, localPoint(event))
    gestureStart.current = { transform, ...centroidAndSpread() }
    movedRef.current = false
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, localPoint(event))
    const start = gestureStart.current
    if (!start) return

    const { centroid, spread } = centroidAndSpread()
    const dx = centroid.x - start.centroid.x
    const dy = centroid.y - start.centroid.y
    if (Math.hypot(dx, dy) > 4) movedRef.current = true

    let scale = start.transform.scale
    if (spread > 0 && start.spread > 0) {
      scale = clampScale(start.transform.scale * (spread / start.spread))
    }
    const ratio = scale / start.transform.scale
    setTransform({
      scale,
      x: centroid.x - (start.centroid.x - start.transform.x) * ratio,
      y: centroid.y - (start.centroid.y - start.transform.y) * ratio,
    })
  }

  const onPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    gestureStart.current =
      pointers.current.size > 0
        ? { transform, ...centroidAndSpread() }
        : null
  }

  const showLabels = transform.scale >= LABEL_SCALE_THRESHOLD

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>System map</h1>
      <p className={styles.pageLede}>
        An experiment: every station plotted from its real coordinates. Drag
        to pan, scroll or pinch to zoom, and tap a station to open its
        arrivals.
      </p>
      <div
        ref={containerRef}
        className={styles.mapViewport}
        data-testid="map-viewport"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <svg
          className={styles.mapSvg}
          viewBox={`0 0 ${projection.width} ${projection.height}`}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
          role="presentation"
        >
          {points.map(({ station, point, color }) => (
            <g key={station.id}>
              <circle
                className={styles.mapStation}
                cx={point.x}
                cy={point.y}
                r={2.6 / Math.sqrt(transform.scale)}
                fill={color}
                data-station-id={station.id}
                role="button"
                tabIndex={-1}
                aria-label={`${station.name} station`}
                onClick={() => {
                  if (!movedRef.current) {
                    navigate(`/sub-wait/station/${station.id}`)
                  }
                }}
              />
              {showLabels ? (
                <text
                  className={styles.mapLabel}
                  x={point.x + 3.4 / Math.sqrt(transform.scale)}
                  y={point.y + 1}
                  fontSize={10 / transform.scale}
                >
                  {station.name}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
        <div className={styles.mapControls}>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => {
              const rect = containerRef.current?.getBoundingClientRect()
              applyZoom(1.5, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2)
            }}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => {
              const rect = containerRef.current?.getBoundingClientRect()
              applyZoom(1 / 1.5, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2)
            }}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Reset view"
            onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          >
            ⟲
          </button>
        </div>
      </div>
    </main>
  )
}
