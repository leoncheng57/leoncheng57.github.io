import { motion, useReducedMotion } from 'framer-motion'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../../../components/site-footer/SiteFooter'
import TopNav from '../../../components/top-nav/TopNav'
import SessionStoryboard from '../../blog/components/SessionStoryboard'
import styles from '../animations.module.css'
import repoStyles from '../repo.module.css'

const STAGGER_SNIPPET = `<motion.div
  initial="hidden"
  whileInView="show"
  viewport={{ once: true }}
  transition={{ staggerChildren: 0.12 }}
>
  {items.map(... => <motion.g variants={cardVariants} ...>)}
</motion.div>`

const LOOP_SNIPPET = `<motion.text
  animate={{ y: [0, -4, 0], x: [0, 3, 0] }}
  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
>
  🚀
</motion.text>`

const DASHES_SNIPPET = `<motion.path
  strokeDasharray="12 10"
  animate={{ strokeDashoffset: [0, -22] }}
  transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
/>`

const TRAVELER_SNIPPET = `<circle r={5} fill="#7aa2f7">
  <animateMotion
    dur="22s"
    repeatCount="indefinite"
    calcMode="paced"   {/* constant walking speed */}
    path={TRAVELER_PATH}
  />
</circle>`

const REDUCED_SNIPPET = `const reducedMotion = useReducedMotion()
// loops: rendered without animate/transition when reduced
// entrance: initial={reducedMotion ? 'show' : 'hidden'}
// SMIL traveler: not rendered at all`

const EMBED_SNIPPET = `![A session, from idea to merged MR](component:session-storyboard)

// MarkdownArticle: urlTransform keeps the component: protocol,
// the img override looks the name up in the embeds registry:
<MarkdownArticle content={post.content} embeds={BLOG_EMBEDS} />`

export default function AnimationsRoute(): ReactElement {
  const reducedMotion = useReducedMotion()

  return (
    <div className={repoStyles.page}>
      <TopNav />
      <main className={repoStyles.content}>
        <p className={repoStyles.backLink}>
          <Link to="/">Back home</Link>
        </p>
        <header className={repoStyles.pageHeader}>
          <p className={repoStyles.eyebrow}>Repo / motion system</p>
          <h1>Animations</h1>
          <p>
            How the animated figures on this site are built, verified, and kept
            accessible — with the blog&apos;s session storyboard as the living
            reference.
          </p>
        </header>

        <section className={styles.showcase} aria-labelledby="stack-heading">
          <h2 id="stack-heading">The stack</h2>
          <p>
            Two tools, each where it is strongest. <strong>framer-motion</strong>{' '}
            drives everything React-shaped: entrance staggers when a figure
            scrolls into view, infinite keyframe loops for ambient movement, and
            the <code>useReducedMotion</code> accessibility hook. Native{' '}
            <strong>SMIL</strong> (<code>&lt;animateMotion&gt;</code>) drives
            path-following, because it traces an SVG path deterministically in
            every browser with zero per-frame JavaScript — CSS{' '}
            <code>offset-path</code> support on SVG elements is still patchy.
            Anything simpler than that is plain CSS.
          </p>
        </section>

        <section className={styles.showcase} aria-labelledby="specimen-heading">
          <h2 id="specimen-heading">Live specimen: the session storyboard</h2>
          <p>
            The real component from the{' '}
            <Link to="/blog/how-openhands-was-integrated">OpenHands article</Link>
            , not a copy — so this reference never drifts from what ships.
          </p>
          <div className={styles.specimenFrame}>
            <SessionStoryboard ariaLabel="A session, from idea to merged MR" />
          </div>
          <ul className={styles.legend}>
            <li>
              <strong>Entrance</strong> — cards stagger in once on scroll
              (<code>whileInView</code> + <code>staggerChildren</code>).
            </li>
            <li>
              <strong>Ambient loops</strong> — bobbing rocket, coffee steam,
              ping ripple, pulsing chat spoke, glowing DONE dot: framer-motion
              keyframes with <code>repeat: Infinity</code>.
            </li>
            <li>
              <strong>Marching road</strong> — the dashes advance by animating{' '}
              <code>strokeDashoffset</code> exactly one dash period.
            </li>
            <li>
              <strong>The traveler</strong> — a SMIL <code>animateMotion</code>{' '}
              dot acting out the story on a composite path: the clarify chat
              loop three times, one lap of the coffee circle, and the
              steer-again spoke three times, at constant speed
              (<code>calcMode=&quot;paced&quot;</code>).
            </li>
          </ul>
        </section>

        <section className={styles.showcase} aria-labelledby="recipes-heading">
          <h2 id="recipes-heading">Recipes</h2>

          <h3>Entrance stagger</h3>
          <div className={styles.recipe}>
            <div className={styles.demoBox} aria-hidden="true">
              <motion.div
                initial={reducedMotion ? 'show' : 'hidden'}
                whileInView="show"
                viewport={{ once: true }}
                transition={{ staggerChildren: 0.25 }}
                style={{ display: 'flex', gap: 10 }}
              >
                {['#7aa2f7', '#9ece6a', '#e0af68'].map((color) => (
                  <motion.div
                    key={color}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                    style={{ background: color, borderRadius: 6, height: 28, width: 28 }}
                  />
                ))}
              </motion.div>
            </div>
            <pre className={styles.codeBlock}>
              <code>{STAGGER_SNIPPET}</code>
            </pre>
          </div>

          <h3>Ambient keyframe loop</h3>
          <div className={styles.recipe}>
            <div className={styles.demoBox} aria-hidden="true">
              {reducedMotion ? (
                <span style={{ fontSize: 28 }}>🚀</span>
              ) : (
                <motion.span
                  animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: 'inline-block', fontSize: 28 }}
                >
                  🚀
                </motion.span>
              )}
            </div>
            <pre className={styles.codeBlock}>
              <code>{LOOP_SNIPPET}</code>
            </pre>
          </div>

          <h3>Marching dashes</h3>
          <div className={styles.recipe}>
            <div className={styles.demoBox} aria-hidden="true">
              <svg viewBox="0 0 140 24" width={140} height={24}>
                <motion.path
                  d="M 4 12 C 40 2, 100 22, 136 12"
                  fill="none"
                  stroke="#565f89"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray="12 10"
                  {...(reducedMotion
                    ? {}
                    : {
                        animate: { strokeDashoffset: [0, -22] },
                        transition: { duration: 1.4, repeat: Infinity, ease: 'linear' },
                      })}
                />
              </svg>
            </div>
            <pre className={styles.codeBlock}>
              <code>{DASHES_SNIPPET}</code>
            </pre>
          </div>

          <h3>Path traveler (SMIL)</h3>
          <div className={styles.recipe}>
            <div className={styles.demoBox} aria-hidden="true">
              <svg viewBox="0 0 140 40" width={140} height={40}>
                <path
                  d="M 8 20 C 40 0, 100 40, 132 20"
                  fill="none"
                  stroke="#565f89"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                />
                {!reducedMotion && (
                  <circle r={4} fill="#7aa2f7">
                    <animateMotion
                      dur="4s"
                      repeatCount="indefinite"
                      calcMode="paced"
                      path="M 8 20 C 40 0, 100 40, 132 20 C 100 40, 40 0, 8 20"
                    />
                  </circle>
                )}
              </svg>
            </div>
            <pre className={styles.codeBlock}>
              <code>{TRAVELER_SNIPPET}</code>
            </pre>
          </div>
        </section>

        <section className={styles.showcase} aria-labelledby="reduced-heading">
          <h2 id="reduced-heading">Reduced motion</h2>
          <p>
            Every loop respects <code>prefers-reduced-motion</code> via
            framer-motion&apos;s <code>useReducedMotion</code>: infinite
            animations are simply not attached, the SMIL traveler is not
            rendered, and the entrance starts in its settled state — the figure
            is always the complete static composition.
          </p>
          <pre className={styles.codeBlock}>
            <code>{REDUCED_SNIPPET}</code>
          </pre>
        </section>

        <section className={styles.showcase} aria-labelledby="embed-heading">
          <h2 id="embed-heading">Embedding in articles</h2>
          <p>
            Blog posts are markdown, so interactive figures are addressed with
            an image whose <code>src</code> uses a <code>component:</code>{' '}
            marker. The markdown renderer keeps the marker through URL
            sanitization and swaps in the registered React component; unknown
            names fall back to a plain image, so a typo cannot break an article.
          </p>
          <pre className={styles.codeBlock}>
            <code>{EMBED_SNIPPET}</code>
          </pre>
        </section>

        <section className={styles.showcase} aria-labelledby="verify-heading">
          <h2 id="verify-heading">Verifying motion</h2>
          <p>
            CI screenshots are static, so animation is verified three ways:
            headless screenshots taken at two timestamps and diffed by eye,
            DOM probes that sample animated values across a cycle (the
            storyboard traveler&apos;s choreography was confirmed by sampling
            its position twenty times over 22 seconds), and pull request
            preview deploys — the only place a reviewer can actually judge the
            motion.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
