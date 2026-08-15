import { motion, useReducedMotion } from 'framer-motion'
import type { ReactElement, ReactNode } from 'react'

/**
 * Animated "day in the life" storyboard for the OpenHands article opener.
 *
 * Six scene cards on a winding dashed road, with small ambient animations:
 * a bobbing rocket, rising coffee steam, a pulsing phone ping, marching
 * road dashes, and a glowing DONE dot. All ambient loops are disabled when
 * the user prefers reduced motion; the entrance stagger still settles into
 * the full static composition.
 *
 * Embedded from markdown via `![alt](component:session-storyboard)` —
 * see the img override in MarkdownArticle.
 */

interface SessionStoryboardProps {
  ariaLabel: string
}

interface SceneCard {
  x: number
  y: number
  accent: string
  emoji: string
  title: string
  lines: string[]
}

const CARD_W = 300
const CARD_H = 158
const CARDS: SceneCard[] = [
  {
    x: 60,
    y: 92,
    accent: '#7aa2f7',
    emoji: '🧑‍💻',
    title: 'CLARIFY',
    lines: ['chat with the agent', 'to shape the idea'],
  },
  {
    x: 450,
    y: 92,
    accent: '#9ece6a',
    emoji: '🚀',
    title: 'LONG RUN',
    lines: ['agent works', 'server-side'],
  },
  {
    x: 840,
    y: 92,
    accent: '#e0af68',
    emoji: '☕',
    title: 'WALK AWAY',
    lines: ['coffee break —', '📱 Slack pings the phone'],
  },
  {
    x: 840,
    y: 352,
    accent: '#f7768e',
    emoji: '🤔',
    title: 'DECIDE',
    lines: ['read the summary:', 'worth going back?'],
  },
  {
    x: 450,
    y: 352,
    accent: '#bb9af7',
    emoji: '🔍',
    title: 'REVIEW & MERGE',
    lines: ['verify the draft MR,', 'merge it in GitLab'],
  },
  {
    x: 60,
    y: 352,
    accent: '#2ac3de',
    emoji: '🧹',
    title: 'CLOSE',
    lines: ['session ends — workspace', 'swept after ~2h idle'],
  },
]

// One smooth serpentine through the card centers, row 1 left→right then
// row 2 right→left, ending at the DONE dot.
const ROAD =
  'M 34 171 H 210 H 990 C 1130 171, 1130 431, 990 431 H 210 C 150 431, 120 466, 116 500'

// Dashed loop-back from DECIDE up to LONG RUN ("steer again").
const LOOP_BACK = 'M 880 352 C 790 285, 700 248, 628 210'

export default function SessionStoryboard({ ariaLabel }: SessionStoryboardProps): ReactElement {
  const reducedMotion = useReducedMotion()

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  }

  return (
    <motion.div
      role="img"
      aria-label={ariaLabel}
      initial={reducedMotion ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      transition={{ staggerChildren: 0.12 }}
      style={{ width: '100%', maxWidth: 980 }}
    >
      <svg
        viewBox="0 0 1200 578"
        width="100%"
        style={{ display: 'block', background: '#1a1b26', borderRadius: 16 }}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {/* Title */}
        <text x={600} y={46} textAnchor="middle" fontSize={22} fontWeight={600} fill="#c0caf5">
          A session, from idea to merged MR
        </text>

        {/* Winding road (marching dashes) */}
        <motion.path
          d={ROAD}
          fill="none"
          stroke="#565f89"
          strokeWidth={3}
          strokeDasharray="12 10"
          strokeLinecap="round"
          {...(reducedMotion
            ? {}
            : {
                animate: { strokeDashoffset: [0, -22] },
                transition: { duration: 1.4, repeat: Infinity, ease: 'linear' },
              })}
        />

        {/* Loop-back branch: decide → long run */}
        <path
          d={LOOP_BACK}
          fill="none"
          stroke="#f7768e"
          strokeWidth={2}
          strokeDasharray="4 6"
          strokeLinecap="round"
          opacity={0.75}
          markerEnd="url(#loop-arrow)"
        />
        <defs>
          <marker id="loop-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M 0 0 L 7 3 L 0 6 Z" fill="#f7768e" />
          </marker>
        </defs>
        <text
          x={718}
          y={303}
          textAnchor="middle"
          fontSize={12}
          fill="#f7768e"
          transform="rotate(-25 718 303)"
        >
          steer again ↩
        </text>

        {/* START dot */}
        <circle cx={34} cy={171} r={7} fill="#9ece6a" />
        <text x={34} y={143} textAnchor="middle" fontSize={12} fontWeight={600} fill="#9ece6a">
          START
        </text>

        {/* DONE dot with glow pulse */}
        <motion.circle
          cx={116}
          cy={514}
          fill="#bb9af7"
          opacity={0.35}
          {...(reducedMotion
            ? { r: 13 }
            : {
                animate: { r: [10, 19, 10], opacity: [0.4, 0.08, 0.4] },
                transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
              })}
        />
        <circle cx={116} cy={514} r={7} fill="#bb9af7" />
        <text x={150} y={519} fontSize={12} fontWeight={600} fill="#bb9af7">
          DONE ✅
        </text>

        {/* Scene cards */}
        {CARDS.map((card) => (
          <motion.g key={card.title} variants={cardVariants}>
            <rect
              x={card.x}
              y={card.y}
              width={CARD_W}
              height={CARD_H}
              rx={14}
              fill="#24283b"
              stroke={card.accent}
              strokeWidth={2}
            />
            {card.emoji === '🚀' && !reducedMotion ? (
              <motion.text
                x={card.x + 24}
                y={card.y + 52}
                fontSize={34}
                animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                {card.emoji}
              </motion.text>
            ) : (
              <text x={card.x + 24} y={card.y + 52} fontSize={34}>
                {card.emoji}
              </text>
            )}
            {card.emoji === '☕' && !reducedMotion && (
              <StoryboardSteam x={card.x + 44} y={card.y + 16} />
            )}
            {card.emoji === '🤔' && !reducedMotion && (
              <>
                {[0, 1].map((i) => (
                  <motion.circle
                    key={i}
                    cx={card.x + CARD_W - 34}
                    cy={card.y + 40}
                    fill="none"
                    stroke="#f7768e"
                    strokeWidth={2}
                    animate={{ r: [6, 20], opacity: [0.7, 0] }}
                    transition={{ duration: 1.8, delay: i * 0.9, repeat: Infinity, ease: 'easeOut' }}
                  />
                ))}
                <text x={card.x + CARD_W - 44} y={card.y + 47} fontSize={18}>
                  📱
                </text>
              </>
            )}
            <text
              x={card.x + 72}
              y={card.y + 46}
              fontSize={17}
              fontWeight={700}
              fill={card.accent}
              letterSpacing={1}
            >
              {card.title}
            </text>
            {card.lines.map((line, i) => (
              <text key={line} x={card.x + 24} y={card.y + 92 + i * 24} fontSize={14.5} fill="#a9b1d6">
                {line}
              </text>
            ))}
          </motion.g>
        ))}
      </svg>
    </motion.div>
  )
}

interface SteamProps {
  x: number
  y: number
}

function StoryboardSteam({ x, y }: SteamProps): ReactNode {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M ${x + i * 9} ${y + 16} q 4 -6 0 -12`}
          fill="none"
          stroke="#e0af68"
          strokeWidth={2}
          strokeLinecap="round"
          animate={{ y: [-2, -12], opacity: [0.7, 0] }}
          transition={{ duration: 1.9, delay: i * 0.55, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}
