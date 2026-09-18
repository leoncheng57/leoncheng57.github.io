import type { ReactElement } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import Headline from '../components/headline/headline'
import Social from '../components/social/social'
import SiteFooter from '../components/site-footer/SiteFooter'
import TopNav from '../components/top-nav/TopNav'
import { getAllBlogPosts } from '../features/blog/content'
import { getAllGuides } from '../features/guides/content'
import styles from '../App.module.css'
import BlogFeedCard from '../features/blog/components/BlogFeedCard'
import { getBlogFeed } from '../features/blog/feed'
import RelativeDate from '../components/relative-date/RelativeDate'
import appStyles from '../features/apps/apps.module.css'

type RecentItem = {
  key: string
  title: string
  type: 'App' | 'Blog' | 'Guide' | 'Project'
  date: string
  href: string
  cta: string
  status?: Array<'Alpha' | 'Beta'>
  external?: boolean
}

const APP_ITEMS: RecentItem[] = [
  {
    // Not a markdown guide, so it cannot come from getAllGuides().
    key: 'guide-opencode-remote-control',
    title: 'OpenCode Remote Control',
    type: 'Guide',
    date: '2026-08-13',
    href: '/guides/opencode-remote-control',
    cta: 'Read guide',
    status: ['Beta'],
  },
  {
    key: 'app-tuzi',
    title: 'Tuzi',
    type: 'Project',
    date: '2026-08-11',
    href: '/tuzi/',
    cta: 'Open project',
    status: ['Alpha'],
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
  const feed = getBlogFeed()
  const recentItems: RecentItem[] = [
    ...getAllGuides().map((guide) => ({
      key: `guide-${guide.slug}`,
      title: guide.title,
      type: 'Guide' as const,
      date: guide.updatedAt,
      href: `/guides/${guide.slug}`,
      cta: 'Read guide',
    })),
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
            {recentItems.map((item) => {
              const post = feed.find((entry) => entry.href === item.href)
              if (post) return <BlogFeedCard key={item.key} post={post} headingLevel={3} titleOnly footer={<p className={styles.recentDate}><RelativeDate date={item.date} /></p>} />

              return (
                <article className={appStyles.appCard} key={item.key}>
                  <h3>
                    {item.external ? <a href={item.href}>{item.title}</a> : <Link to={item.href}>{item.title}</Link>}
                  </h3>
                  <p className={styles.recentDate}><RelativeDate date={item.date} /></p>
                </article>
              )
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
