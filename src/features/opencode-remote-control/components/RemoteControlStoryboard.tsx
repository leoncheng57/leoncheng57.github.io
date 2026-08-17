import { motion, useReducedMotion } from 'framer-motion'
import type { ReactElement } from 'react'

/**
 * Animated storyboard of the two private loops on the remote-control guide,
 * in the style of the blog's SessionStoryboard.
 *
 * Control plane: a green command dot rides the Tailscale tunnel from the
 * phone into the Mac. Notification plane: an amber event dot leaves the
 * ntfy-notify plugin, passes through the ntfy relay, and lands on the phone
 * with a ping ripple; tapping it rides the tunnel back into the exact
 * session. The Mac hub shows the agent at work as green dots tracing a
 * figure-eight.
 *
 * All loops are SMIL animateMotion (calcMode="paced") or framer-motion
 * keyframes, and every loop is disabled under prefers-reduced-motion; the
 * entrance stagger still settles into the full static composition.
 */

interface RemoteControlStoryboardProps {
  ariaLabel: string
}

const SURFACE = '#111312'
const TEXT_MUTED = '#9ca3a0'
const LINE = '#2a2e2c'
const GREEN = '#3ecf8e'
const GREEN_SOFT = 'rgba(62, 207, 142, 0.45)'
const AMBER = '#e0af68'

// Control tunnel: phone (right edge) → Mac (left edge), a gentle arc.
const TUNNEL = 'M 370 240 C 520 170, 710 170, 860 240'
// Tap return ride: the same arc, reversed.
const TUNNEL_BACK = 'M 860 250 C 710 180, 520 180, 370 250'
// Notification spokes: Mac (bottom edge) → ntfy relay → phone (bottom edge).
const EVENT_TO_NTFY = 'M 930 400 C 890 460, 830 500, 760 512'
const NTFY_TO_PHONE = 'M 520 512 C 420 500, 330 440, 250 372'
// The composite push ride: plugin → relay → phone, one paced SMIL path.
const PUSH_PATH =
  'M 930 400 C 890 460, 830 500, 760 512 L 520 512 C 420 500, 330 440, 250 372'

// Agent-at-work figure-eight inside the Mac hub.
const HUB_CX = 985
const HUB_CY = 300
const INFINITY_PATH =
  `M ${HUB_CX} ${HUB_CY} ` +
  `C ${HUB_CX + 15} ${HUB_CY - 17}, ${HUB_CX + 34} ${HUB_CY - 17}, ${HUB_CX + 34} ${HUB_CY} ` +
  `C ${HUB_CX + 34} ${HUB_CY + 17}, ${HUB_CX + 15} ${HUB_CY + 17}, ${HUB_CX} ${HUB_CY} ` +
  `C ${HUB_CX - 15} ${HUB_CY - 17}, ${HUB_CX - 34} ${HUB_CY - 17}, ${HUB_CX - 34} ${HUB_CY} ` +
  `C ${HUB_CX - 34} ${HUB_CY + 17}, ${HUB_CX - 15} ${HUB_CY + 17}, ${HUB_CX} ${HUB_CY} Z`
const INFINITY_DOTS = [
  { r: 6.5, opacity: 1, dur: '4.2s' },
  { r: 4.5, opacity: 0.75, dur: '2.9s' },
  { r: 3.5, opacity: 0.55, dur: '6.1s' },
]

export default function RemoteControlStoryboard({
  ariaLabel,
}: RemoteControlStoryboardProps): ReactElement {
  const reducedMotion = useReducedMotion()

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  }

  return (
    <motion.div
      role="img"
      aria-label={ariaLabel}
      initial={reducedMotion ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ staggerChildren: 0.12 }}
      style={{ width: '100%' }}
    >
      <svg
        viewBox="0 0 1200 640"
        width="100%"
        style={{ display: 'block', background: '#0b0d0c', borderRadius: 12 }}
        fontFamily="'DM Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        <defs>
          <marker
            id="rc-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M 0 0 L 7 3 L 0 6 Z" fill="context-stroke" />
          </marker>
        </defs>

        {/* Control tunnel (marching dashes) */}
        <motion.g variants={cardVariants}>
          <motion.path
            d={TUNNEL}
            fill="none"
            stroke={GREEN_SOFT}
            strokeWidth={2.5}
            strokeDasharray="10 9"
            strokeLinecap="round"
            markerEnd="url(#rc-arrow)"
            {...(reducedMotion
              ? {}
              : {
                  animate: { strokeDashoffset: [0, -19] },
                  transition: { duration: 1.3, repeat: Infinity, ease: 'linear' },
                })}
          />
          <text x={600} y={140} textAnchor="middle" fontSize={14} fill={GREEN}>
            CONTROL PLANE · Tailscale (WireGuard)
          </text>
          <text x={600} y={163} textAnchor="middle" fontSize={12.5} fill={TEXT_MUTED}>
            http://100.x.y.z:4096 — no Funnel, no LAN bind
          </text>
          <text x={600} y={262} textAnchor="middle" fontSize={12.5} fill={TEXT_MUTED}>
            tap a push → back in the exact session
          </text>
        </motion.g>

        {/* Notification spokes */}
        <motion.g variants={cardVariants}>
          <path
            d={EVENT_TO_NTFY}
            fill="none"
            stroke={AMBER}
            strokeWidth={2}
            strokeDasharray="5 6"
            markerEnd="url(#rc-arrow)"
          />
          <path
            d={NTFY_TO_PHONE}
            fill="none"
            stroke={AMBER}
            strokeWidth={2}
            strokeDasharray="5 6"
            markerEnd="url(#rc-arrow)"
          />
          <text
            x={873}
            y={492}
            textAnchor="middle"
            fontSize={12.5}
            fill={AMBER}
            transform="rotate(24 873 492)"
          >
            idle · approval · question
          </text>
          <text
            x={368}
            y={432}
            textAnchor="middle"
            fontSize={12.5}
            fill={AMBER}
            transform="rotate(28 368 432)"
          >
            push
          </text>
          {/* Ping ripple where the push lands on the phone */}
          {!reducedMotion &&
            [0, 1].map((i) => (
              <motion.circle
                key={i}
                cx={250}
                cy={370}
                fill="none"
                stroke={AMBER}
                strokeWidth={2}
                animate={{ r: [5, 20], opacity: [0.7, 0] }}
                transition={{
                  duration: 1.8,
                  delay: i * 0.9,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
        </motion.g>

        {/* PHONE card */}
        <motion.g variants={cardVariants}>
          <rect
            x={90}
            y={230}
            width={280}
            height={140}
            rx={12}
            fill={SURFACE}
            stroke={LINE}
            strokeWidth={2}
          />
          <text x={116} y={280} fontSize={26}>
            📱
          </text>
          <text x={156} y={276} fontSize={16} fontWeight={700} fill={GREEN} letterSpacing={1}>
            PHONE
          </text>
          <text x={116} y={314} fontSize={12} fill={TEXT_MUTED}>
            OpenCode Web UI in the browser,
          </text>
          <text x={116} y={336} fontSize={12} fill={TEXT_MUTED}>
            ntfy app for pushes
          </text>
        </motion.g>

        {/* MAC card (the hub) */}
        <motion.g variants={cardVariants}>
          <rect
            x={860}
            y={200}
            width={260}
            height={200}
            rx={12}
            fill={SURFACE}
            stroke={GREEN}
            strokeWidth={2}
          />
          <text x={886} y={250} fontSize={26}>
            💻
          </text>
          <text x={926} y={246} fontSize={16} fontWeight={700} fill={GREEN} letterSpacing={1}>
            MAC
          </text>
          <text x={886} y={340} fontSize={12} fill={TEXT_MUTED}>
            oc-remote web · tailnet-only
          </text>
          <text x={886} y={360} fontSize={12} fill={TEXT_MUTED}>
            repo · Docker · MCPs
          </text>
          <text x={886} y={380} fontSize={12} fill={TEXT_MUTED}>
            credentials stay local
          </text>
          {/* Agent at work: figure-eight dots */}
          {reducedMotion ? (
            <circle cx={HUB_CX} cy={HUB_CY} r={6.5} fill={GREEN} />
          ) : (
            INFINITY_DOTS.map((dot) => (
              <circle key={dot.dur} r={dot.r} fill={GREEN} opacity={dot.opacity}>
                <animateMotion
                  dur={dot.dur}
                  repeatCount="indefinite"
                  rotate="0"
                  calcMode="paced"
                  path={INFINITY_PATH}
                />
              </circle>
            ))
          )}
        </motion.g>

        {/* NTFY relay card */}
        <motion.g variants={cardVariants}>
          <rect
            x={520}
            y={460}
            width={240}
            height={110}
            rx={12}
            fill={SURFACE}
            stroke={AMBER}
            strokeWidth={2}
          />
          <text x={546} y={502} fontSize={24}>
            🔔
          </text>
          <text x={584} y={498} fontSize={15} fontWeight={700} fill={AMBER} letterSpacing={1}>
            NTFY
          </text>
          <text x={546} y={530} fontSize={12} fill={TEXT_MUTED}>
            only the title, a snippet,
          </text>
          <text x={546} y={550} fontSize={12} fill={TEXT_MUTED}>
            and the session link
          </text>
        </motion.g>

        {/* Footnote */}
        <text x={600} y={618} textAnchor="middle" fontSize={12} fill={TEXT_MUTED} opacity={0.7}>
          The launcher exits without a tailnet address; self-host ntfy to keep even
          push metadata inside the tailnet.
        </text>

        {/* Riding dots, drawn last so they pass in front of the cards. */}
        {!reducedMotion && (
          <g>
            {/* Command riding the tunnel into the Mac */}
            <circle r={8} fill={GREEN} opacity={0.25}>
              <animateMotion
                dur="5.5s"
                repeatCount="indefinite"
                rotate="0"
                calcMode="paced"
                path={TUNNEL}
              />
            </circle>
            <circle r={4.5} fill={GREEN}>
              <animateMotion
                dur="5.5s"
                repeatCount="indefinite"
                rotate="0"
                calcMode="paced"
                path={TUNNEL}
              />
            </circle>
            {/* The tap riding back into the exact session */}
            <circle r={4.5} fill={GREEN} opacity={0.7}>
              <animateMotion
                dur="7s"
                repeatCount="indefinite"
                rotate="0"
                calcMode="paced"
                path={TUNNEL_BACK}
              />
            </circle>
            {/* The event → push riding plugin → relay → phone */}
            <circle r={4.5} fill={AMBER}>
              <animateMotion
                dur="6s"
                repeatCount="indefinite"
                rotate="0"
                calcMode="paced"
                path={PUSH_PATH}
              />
            </circle>
          </g>
        )}
      </svg>
    </motion.div>
  )
}
