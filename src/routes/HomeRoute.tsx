import type { ReactElement } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import Headline from '../components/headline/headline'
import Social from '../components/social/social'
import TopNav from '../components/top-nav/TopNav'
import { getAllBlogPosts } from '../features/blog/content'
import styles from '../App.module.css'

type RecentItem = {
  key: string
  title: string
  type: 'App' | 'Blog' | 'Project'
  date: string
  href: string
  cta: string
  status?: Array<'Alpha' | 'Beta'>
  external?: boolean
}

const APP_ITEMS: RecentItem[] = [
  {
    key: 'app-tuzi',
    title: 'Tuzi',
    type: 'Project',
    date: '2026-08-11',
    href: '/tuzi/',
    cta: 'Open project',
    status: ['Alpha', 'Beta'],
  },
  {
    key: 'app-sub-wait',
    title: 'Sub-Wait',
    type: 'App',
    date: '2026-08-10',
    href: '/sub-wait',
    cta: 'Open app',
    status: ['Beta'],
  },
  {
    key: 'app-game-nights',
    title: "Georgie's Game Nights",
    type: 'App',
    date: '2026-08-10',
    href: '/georgies-board-game-nights',
    cta: 'Open app',
  },
  {
    key: 'app-workout-lab',
    title: 'Workout Lab',
    type: 'App',
    date: '2026-08-09',
    href: '/workout-lab',
    cta: 'Open app',
    status: ['Beta'],
  },
  {
    key: 'app-photo-hunt',
    title: 'House Party Photo Hunt',
    type: 'App',
    date: '2026-08-01',
    href: 'https://leoncheng.dev/vibe-photo-voting-house-game/',
    cta: 'Open app',
    external: true,
  },
  {
    key: 'app-whoops-hoops',
    title: 'Whoops Hoops',
    type: 'App',
    date: '2026-05-12',
    href: 'https://apps.apple.com/us/app/whoops-hoops/id6763969713',
    cta: 'Open app',
    external: true,
  },
]

export default function HomeRoute(): ReactElement {
  const recentItems: RecentItem[] = [
    ...getAllBlogPosts().map((post) => ({
      key: `blog-${post.slug}`,
      title: post.title,
      type: 'Blog' as const,
      date: post.updatedAt ?? post.publishedAt,
      href: `/blog/${post.slug}`,
      cta: 'Read article',
    })),
    ...APP_ITEMS,
  ]
    .sort((left, right) => right.date.localeCompare(left.date) || left.title.localeCompare(right.title))
    .slice(0, 6)

  return (
    <div className={styles.container}>
      <TopNav />
      <main className={classNames(styles.main, styles.homeMain)}>
        <Headline />
        <Social />
        <section className={styles.recentWriting} aria-labelledby="recent-work-title">
          <div className={styles.recentHeading}>
            <p>Latest across apps, blogs &amp; guides</p>
            <h2 id="recent-work-title">Recent work</h2>
          </div>
          <div className={styles.recentGrid}>
            {recentItems.map((item, index) => {
              const cardContent = (
                <>
                  <span className={styles.recentNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.recentLabels}>
                    <span className={styles.recentType}>{item.type}</span>
                    {item.status?.map((status) => (
                      <span
                        className={
                          status === 'Alpha'
                            ? styles.recentStatusAlpha
                            : styles.recentStatus
                        }
                        key={status}
                      >
                        {status}
                      </span>
                    ))}
                  </span>
                  <span className={styles.posterFrames} aria-hidden="true">
                    <span className={styles.posterFrameBack} />
                    <span className={styles.posterFrameFront} />
                  </span>
                  <span className={styles.recentTitle}>{item.title}</span>
                  <span className={styles.recentCta}>{item.cta}</span>
                </>
              )

              return item.external ? (
                <a className={styles.recentCard} href={item.href} key={item.key}>
                  {cardContent}
                </a>
              ) : (
                <Link className={styles.recentCard} key={item.key} to={item.href}>
                  {cardContent}
                </Link>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
