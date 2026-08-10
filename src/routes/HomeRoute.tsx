import type { ReactElement } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import Headline from '../components/headline/headline'
import Social from '../components/social/social'
import TopNav from '../components/top-nav/TopNav'
import { getAllBlogPosts } from '../features/blog/content'
import styles from '../App.module.css'

export default function HomeRoute(): ReactElement {
  const recentPosts = getAllBlogPosts().slice(0, 2)

  return (
    <div className={styles.container}>
      <TopNav />
      <main className={classNames(styles.main, styles.homeMain)}>
        <Headline />
        <Social />
        <section className={styles.recentWriting} aria-labelledby="recent-writing-title">
          <div className={styles.recentHeading}>
            <p>Fresh from the notebook</p>
            <h2 id="recent-writing-title">Recent writing</h2>
          </div>
          <div className={styles.recentGrid}>
            {recentPosts.map((post, index) => (
              <Link className={styles.recentCard} key={post.slug} to={`/blog/${post.slug}`}>
                <span className={styles.recentNumber}>0{index + 1}</span>
                <span className={styles.posterFrames} aria-hidden="true">
                  <span className={styles.posterFrameBack} />
                  <span className={styles.posterFrameFront} />
                </span>
                <span className={styles.recentTitle}>{post.title}</span>
                <span className={styles.recentCta}>Read article</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
