import type { ReactElement } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import Headline from '../components/headline/headline'
import SiteFooter from '../components/site-footer/SiteFooter'
import TopNav from '../components/top-nav/TopNav'
import styles from '../App.module.css'
import BlogFeedCard from '../features/blog/components/BlogFeedCard'
import { getBlogFeed } from '../features/blog/feed'
import RelativeDate from '../components/relative-date/RelativeDate'
import appStyles from '../features/apps/apps.module.css'

type AppItem = { title: string; date: string; href: string; icon: string; beta?: boolean }

const APP_ITEMS: AppItem[] = [
  { title: 'T-minus - Chromium Extension', icon: '/app-icons/t-minus.svg', date: '2026-09-19', href: '/apps/t-minus-extension', beta: true },
  { title: 'NYC Weather - Chromium Extension', icon: '/app-icons/weather.svg', date: '2026-09-17', href: '/apps/nyc-weather-extension' },
  { title: 'NYC Weather', icon: '/app-icons/weather.svg', date: '2026-08-20', href: '/weather' },
  { title: 'Sub-Wait', icon: '/app-icons/sub-wait-v2.svg', date: '2026-08-10', href: '/sub-wait' },
  { title: "Georgie's Game Nights", icon: '/app-icons/game-nights.svg', date: '2026-08-10', href: '/georgies-board-game-nights' },
  { title: 'Workout Lab', icon: '/app-icons/workout-lab.svg', date: '2026-08-09', href: '/workout-lab', beta: true },
  { title: 'House Party Photo Hunt', icon: '/app-icons/house-party-photo-hunt.svg', date: '2026-08-01', href: 'https://leoncheng.dev/vibe-photo-voting-house-game/' },
  { title: 'Whoops Hoops', icon: '/app-icons/whoops-hoops.png', date: '2026-05-12', href: 'https://apps.apple.com/us/app/whoops-hoops/id6763969713' },
]

export default function HomeRoute(): ReactElement {
  const posts = getBlogFeed().slice(0, 6)
  const apps = [...APP_ITEMS].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

  return (
    <div className={styles.container}>
      <TopNav />
      <main className={classNames(styles.main, styles.homeMain)}>
        <Headline />
        <section className={styles.recentWriting} aria-labelledby="recent-blogs-title">
          <div className={styles.recentHeading}>
            <h2 id="recent-blogs-title">Blogs</h2>
          </div>
          <p><Link to="/blog">See all blogs →</Link></p>
          <div className={styles.recentGrid}>
            {posts.map(post => (
              <BlogFeedCard key={post.href} post={post} headingLevel={3} titleOnly
                footer={<p className={styles.recentDate}><RelativeDate date={post.date} /></p>} />
            ))}
          </div>
        </section>
        <section className={styles.recentWriting} aria-labelledby="recent-apps-title">
          <div className={styles.recentHeading}>
            <h2 id="recent-apps-title">Apps</h2>
          </div>
          <p><Link to="/apps">See all apps →</Link></p>
          <div className={styles.recentGrid}>
            {apps.map(item => (
              <article className={appStyles.appCard} key={item.href}>
                <div className={appStyles.appCardHeader}>
                  <img className={appStyles.appIcon} src={item.icon} alt="" width={64} height={64} decoding="async" />
                  <div className={appStyles.appCardHeading}>
                    <h3>
                      {item.href.startsWith('https://') ? <a href={item.href}>{item.title}</a> : <Link to={item.href}>{item.title}</Link>}
                      {item.beta ? <span className={appStyles.betaBadge}>BETA</span> : null}
                    </h3>
                    <p className={styles.recentDate}><RelativeDate date={item.date} /></p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
