import { motion, useReducedMotion } from 'framer-motion'
import type { ReactElement } from 'react'

/**
 * Animated hub-and-spoke storyboard for the OpenHands article opener.
 *
 * The OpenHands service sits in the center; the person's day is a winding
 * road orbiting it clockwise (START → YOU → WALK AWAY → DECIDE → GITLAB →
 * DONE). Dashed spokes carry the service interactions: the clarify chat
 * loop, the Slack notify ping, the "steer again" resume, and the draft MR.
 *
 * Ambient animations: a traveler dot riding the orbit (SMIL animateMotion —
 * deterministic across browsers for path-following), marching road dashes,
 * a bobbing rocket in the hub, coffee steam, a ping ripple on the notify
 * spoke, a pulsing chat loop, and a glowing DONE dot. Every loop is
 * disabled under prefers-reduced-motion; the entrance stagger still
 * settles into the full static composition.
 *
 * Embedded from markdown via `![alt](component:session-storyboard)` —
 * see the img override in MarkdownArticle.
 */

interface SessionStoryboardProps {
  ariaLabel: string
}

// The person's day: one winding road orbiting the hub clockwise.
const ORBIT =
  'M 36 96 C 90 130, 140 150, 195 165 ' +
  'C 300 90, 380 150, 470 100 C 560 60, 700 160, 800 120 C 880 95, 950 140, 990 195 ' +
  'C 1060 260, 1100 300, 1070 380 C 1040 460, 1060 500, 990 565 ' +
  'C 900 660, 800 640, 700 690 C 600 735, 480 660, 380 660 C 330 660, 300 630, 270 610 ' +
  'C 200 640, 140 660, 96 700'

// The traveler acts the story out on its own composite path: it rides the
// orbit but detours through the clarify chat loop three times, takes one
// lap of the coffee circle while the run continues, and bounces DECIDE ↔
// hub three times on the steer spoke before heading to GitLab. Written as
// one path so a single SMIL animateMotion (calcMode="paced" → constant
// walking speed) can drive it.
const CHAT_OUT = 'C 300 260, 350 290, 412 320'
const CHAT_BACK = 'C 330 315, 270 275, 218 235'
const CHAT_OUT_AGAIN = 'C 300 262, 352 292, 412 320'
const STEER_OUT = 'C 920 545, 810 505, 742 496'
const STEER_BACK = 'C 800 520, 900 555, 990 565'
const TRAVELER_PATH =
  'M 36 96 C 90 130, 140 150, 195 165 ' +
  // clarify chat loop ×3
  `${CHAT_OUT} ${CHAT_BACK} ${CHAT_OUT_AGAIN} ${CHAT_BACK} ${CHAT_OUT_AGAIN} ${CHAT_BACK} ` +
  // rejoin the orbit over the top crest
  'C 230 170, 260 110, 320 100 C 400 145, 430 120, 470 100 ' +
  'C 560 60, 700 160, 800 120 C 880 95, 950 140, 990 195 ' +
  // one lap of the coffee circle
  'C 1010 230, 1005 250, 1005 275 ' +
  'A 30 30 0 1 1 1005 335 A 30 30 0 1 1 1005 275 ' +
  'C 1030 320, 1060 340, 1070 380 C 1040 460, 1060 500, 990 565 ' +
  // steer-again loop ×3
  `${STEER_OUT} ${STEER_BACK} ${STEER_OUT} ${STEER_BACK} ${STEER_OUT} ${STEER_BACK} ` +
  // bottom stretch to GitLab and out to DONE
  'C 900 660, 800 640, 700 690 C 600 735, 480 660, 380 660 C 330 660, 300 630, 270 610 ' +
  'C 200 640, 140 660, 96 700'

// Spokes: what the service does, drawn hub ↔ satellite.
const CHAT_TO_HUB = 'M 240 225 C 300 260, 350 290, 412 320'
const CHAT_TO_YOU = 'M 398 342 C 330 315, 270 275, 218 235'
const NOTIFY = 'M 782 318 C 820 285, 838 248, 852 212'
const STEER = 'M 880 540 C 810 505, 775 470, 742 496'
const DRAFT_MR = 'M 470 492 C 430 520, 395 535, 348 552'

const NODE_TEXT = '#a9b1d6'

export default function SessionStoryboard({ ariaLabel }: SessionStoryboardProps): ReactElement {
  const reducedMotion = useReducedMotion()

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  }

  return (
    <motion.div
      role="img"
      aria-label={ariaLabel}
      initial={reducedMotion ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ staggerChildren: 0.12 }}
      style={{ width: '100%', maxWidth: 980 }}
    >
      <svg
        viewBox="0 0 1200 764"
        width="100%"
        style={{ display: 'block', background: '#1a1b26', borderRadius: 16 }}
        fontFamily="Inter, system-ui, sans-serif"
      >
        <defs>
          <marker id="spoke-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M 0 0 L 7 3 L 0 6 Z" fill="context-stroke" />
          </marker>
        </defs>

        {/* Title */}
        <text x={600} y={44} textAnchor="middle" fontSize={22} fontWeight={600} fill="#c0caf5">
          A session, from idea to merged MR
        </text>

        {/* The winding orbit (marching dashes) */}
        <motion.path
          id="orbit"
          d={ORBIT}
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

        {/* The coffee lap the traveler rides while the run continues. */}
        <circle
          cx={1005}
          cy={305}
          r={30}
          fill="none"
          stroke="#e0af68"
          strokeWidth={1.5}
          strokeDasharray="4 6"
          opacity={0.45}
        />

        {/* Traveler acting out the day. SMIL follows the composite path
            natively and is rendered only when motion is allowed. */}
        {!reducedMotion && (
          <g>
            <circle r={9} fill="#7aa2f7" opacity={0.25}>
              <animateMotion dur="22s" repeatCount="indefinite" rotate="0" calcMode="paced" path={TRAVELER_PATH} />
            </circle>
            <circle r={5} fill="#7aa2f7">
              <animateMotion dur="22s" repeatCount="indefinite" rotate="0" calcMode="paced" path={TRAVELER_PATH} />
            </circle>
          </g>
        )}

        {/* Spokes */}
        <motion.g
          variants={cardVariants}
          {...(reducedMotion
            ? {}
            : {
                animate: { opacity: [0.55, 1, 0.55] },
                transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
              })}
        >
          <path
            d={CHAT_TO_HUB}
            fill="none"
            stroke="#7aa2f7"
            strokeWidth={2}
            strokeDasharray="5 6"
            markerEnd="url(#spoke-arrow)"
          />
          <path
            d={CHAT_TO_YOU}
            fill="none"
            stroke="#7aa2f7"
            strokeWidth={2}
            strokeDasharray="5 6"
            markerEnd="url(#spoke-arrow)"
          />
          <text x={252} y={296} fontSize={12.5} fill="#7aa2f7" transform="rotate(22 252 296)">
            💬 chat to clarify
          </text>
        </motion.g>

        <motion.g variants={cardVariants}>
          <path
            d={NOTIFY}
            fill="none"
            stroke="#e0af68"
            strokeWidth={2}
            strokeDasharray="5 6"
            markerEnd="url(#spoke-arrow)"
          />
          <text
            x={788}
            y={272}
            textAnchor="middle"
            fontSize={12.5}
            fill="#e0af68"
            transform="rotate(-40 788 272)"
          >
            📱 notify
          </text>
          {!reducedMotion &&
            [0, 1].map((i) => (
              <motion.circle
                key={i}
                cx={852}
                cy={210}
                fill="none"
                stroke="#e0af68"
                strokeWidth={2}
                animate={{ r: [5, 20], opacity: [0.7, 0] }}
                transition={{ duration: 1.8, delay: i * 0.9, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
        </motion.g>

        <motion.g variants={cardVariants}>
          <path
            d={STEER}
            fill="none"
            stroke="#f7768e"
            strokeWidth={2}
            strokeDasharray="5 6"
            markerEnd="url(#spoke-arrow)"
          />
          <text
            x={800}
            y={540}
            textAnchor="middle"
            fontSize={12.5}
            fill="#f7768e"
            transform="rotate(16 800 540)"
          >
            steer again ↩
          </text>
        </motion.g>

        <motion.g variants={cardVariants}>
          <path
            d={DRAFT_MR}
            fill="none"
            stroke="#bb9af7"
            strokeWidth={2}
            strokeDasharray="5 6"
            markerEnd="url(#spoke-arrow)"
          />
          <text
            x={372}
            y={502}
            textAnchor="middle"
            fontSize={12.5}
            fill="#bb9af7"
            transform="rotate(24 372 502)"
          >
            🔀 draft MR
          </text>
        </motion.g>

        {/* START / DONE */}
        <circle cx={36} cy={96} r={7} fill="#9ece6a" />
        <text x={36} y={74} textAnchor="middle" fontSize={12} fontWeight={600} fill="#9ece6a">
          START
        </text>
        <motion.circle
          cx={96}
          cy={700}
          fill="#bb9af7"
          opacity={0.35}
          {...(reducedMotion
            ? { r: 13 }
            : {
                animate: { r: [10, 19, 10], opacity: [0.4, 0.08, 0.4] },
                transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
              })}
        />
        <circle cx={96} cy={700} r={7} fill="#bb9af7" />
        <text x={96} y={734} textAnchor="middle" fontSize={12} fontWeight={600} fill="#bb9af7">
          DONE ✅
        </text>
        <text x={96} y={752} textAnchor="middle" fontSize={11.5} fill={NODE_TEXT}>
          close the session
        </text>

        {/* YOU (top-left) */}
        <motion.g variants={cardVariants}>
          <rect x={70} y={110} width={250} height={112} rx={14} fill="#24283b" stroke="#7aa2f7" strokeWidth={2} />
          <text x={95} y={162} fontSize={30}>
            🧑‍💻
          </text>
          <text x={142} y={156} fontSize={17} fontWeight={700} fill="#7aa2f7" letterSpacing={1}>
            YOU
          </text>
          <text x={95} y={200} fontSize={14.5} fill={NODE_TEXT}>
            the idea
          </text>
        </motion.g>

        {/* WALK AWAY (top-right) */}
        <motion.g variants={cardVariants}>
          <rect x={860} y={130} width={280} height={132} rx={14} fill="#24283b" stroke="#e0af68" strokeWidth={2} />
          <text x={885} y={182} fontSize={30}>
            ☕
          </text>
          {!reducedMotion &&
            [0, 1, 2].map((i) => (
              <motion.path
                key={i}
                d={`M ${901 + i * 9} 158 q 4 -6 0 -12`}
                fill="none"
                stroke="#e0af68"
                strokeWidth={2}
                strokeLinecap="round"
                animate={{ y: [-2, -12], opacity: [0.7, 0] }}
                transition={{ duration: 1.9, delay: i * 0.55, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          <text x={936} y={176} fontSize={17} fontWeight={700} fill="#e0af68" letterSpacing={1}>
            WALK AWAY
          </text>
          <text x={885} y={216} fontSize={14.5} fill={NODE_TEXT}>
            coffee break —
          </text>
          <text x={885} y={240} fontSize={14.5} fill={NODE_TEXT}>
            📱 Slack pings the phone
          </text>
        </motion.g>

        {/* OPENHANDS hub (center) */}
        <motion.g variants={cardVariants}>
          <rect x={420} y={280} width={360} height={212} rx={16} fill="#24283b" stroke="#9ece6a" strokeWidth={3} />
          <text x={450} y={334} fontSize={36}>
            🙌
          </text>
          <text x={505} y={326} fontSize={21} fontWeight={700} fill="#9ece6a" letterSpacing={1}>
            OPENHANDS
          </text>
          <text x={505} y={348} fontSize={13} fill={NODE_TEXT}>
            one service, whole session
          </text>
          <text x={450} y={398} fontSize={15}>
            💬
          </text>
          <text x={484} y={398} fontSize={14.5} fill={NODE_TEXT}>
            clarify
          </text>
          {reducedMotion ? (
            <text x={450} y={428} fontSize={15}>
              🚀
            </text>
          ) : (
            <motion.text
              x={450}
              y={428}
              fontSize={15}
              animate={{ y: [0, -4, 0], x: [0, 3, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              🚀
            </motion.text>
          )}
          <text x={484} y={428} fontSize={14.5} fill={NODE_TEXT}>
            long run
          </text>
          <text x={450} y={458} fontSize={15}>
            🧹
          </text>
          <text x={484} y={458} fontSize={14.5} fill={NODE_TEXT}>
            auto-sweep after ~2h
          </text>
        </motion.g>

        {/* DECIDE (bottom-right) */}
        <motion.g variants={cardVariants}>
          <rect x={860} y={500} width={280} height={132} rx={14} fill="#24283b" stroke="#f7768e" strokeWidth={2} />
          <text x={885} y={552} fontSize={30}>
            🤔
          </text>
          <text x={932} y={546} fontSize={17} fontWeight={700} fill="#f7768e" letterSpacing={1}>
            DECIDE
          </text>
          <text x={885} y={586} fontSize={14.5} fill={NODE_TEXT}>
            read the summary —
          </text>
          <text x={885} y={610} fontSize={14.5} fill={NODE_TEXT}>
            worth going back?
          </text>
        </motion.g>

        {/* GITLAB (bottom-left) */}
        <motion.g variants={cardVariants}>
          <rect x={140} y={540} width={262} height={148} rx={14} fill="#24283b" stroke="#bb9af7" strokeWidth={2} />
          <text x={165} y={592} fontSize={30}>
            🦊
          </text>
          <text x={212} y={586} fontSize={17} fontWeight={700} fill="#bb9af7" letterSpacing={1}>
            GITLAB
          </text>
          <text x={165} y={626} fontSize={14.5} fill={NODE_TEXT}>
            review the draft MR,
          </text>
          <text x={165} y={650} fontSize={14.5} fill={NODE_TEXT}>
            verify &amp; merge
          </text>
        </motion.g>
      </svg>
    </motion.div>
  )
}
